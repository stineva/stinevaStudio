import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import simpleGit from "simple-git";
import { generateCompletion, OllamaSettings } from "./ollama";

export type Plan = {
  summary: string;
  assumptions: string[];
  files_to_create: { path: string; purpose: string }[];
  files_to_modify: { path: string; purpose: string }[];
  files_to_delete: { path: string; purpose: string }[];
  routes_added: string[];
  components_added: string[];
  mock_api_changes: string[];
  acceptance_tests: string[];
};

export type PipelineResult = {
  planText: string;
  patchText: string;
  logs: string[];
  success: boolean;
};

export type PromptTemplates = {
  planner: string;
  patcher: string;
  fixer: string;
};

const ALLOWED_COMMANDS = new Set(["npm install", "npm run lint", "npm run build", "npm run dev"]);

export function sanitizePath(projectPath: string, targetPath: string) {
  const resolved = path.resolve(projectPath, targetPath);
  if (!resolved.startsWith(path.resolve(projectPath))) {
    throw new Error("مسیر نامعتبر است.");
  }
  return resolved;
}

export async function runPipeline({
  projectPath,
  prompt,
  settings,
  templates,
  lastTouched,
  onLog,
  dryRun
}: {
  projectPath: string;
  prompt: string;
  settings: OllamaSettings;
  templates: PromptTemplates;
  lastTouched: string[];
  onLog: (message: string) => void;
  dryRun: boolean;
}): Promise<PipelineResult> {
  const logs: string[] = [];
  const pushLog = (message: string) => {
    logs.push(message);
    onLog(message);
  };

  pushLog("مرحله برنامه‌ریزی آغاز شد...");
  const baseContext = loadContext(projectPath, null, lastTouched);
  const planPrompt = templates.planner
    .replace("{{prompt}}", prompt)
    .replace("{{context}}", formatContext(baseContext));
  const planText = await generateCompletion(
    settings.baseUrl,
    settings.model,
    planPrompt,
    settings
  );

  let plan: Plan;
  try {
    plan = JSON.parse(planText) as Plan;
  } catch (error) {
    throw new Error("خروجی برنامه‌ریز JSON معتبر نبود.");
  }

  pushLog("مرحله تولید پچ آغاز شد...");
  const patchContext = loadContext(projectPath, plan, lastTouched);
  const patchPrompt = templates.patcher
    .replace("{{prompt}}", prompt)
    .replace("{{plan}}", JSON.stringify(plan, null, 2))
    .replace("{{context}}", formatContext(patchContext));
  const patchText = await generateCompletion(
    settings.baseUrl,
    settings.model,
    patchPrompt,
    settings
  );

  if (dryRun) {
    return { planText, patchText, logs, success: true };
  }

  pushLog("اعمال پچ...");
  await applyPatch(projectPath, patchText, pushLog);

  pushLog("اجرای اعتبارسنجی...");
  const lintSuccess = await runAllowedCommand("npm run lint", projectPath, pushLog);
  const buildSuccess = await runAllowedCommand("npm run build", projectPath, pushLog);

  let success = lintSuccess && buildSuccess;
  if (!success) {
    pushLog("نیاز به پچ اصلاحی...");
    const fixPrompt = templates.fixer
      .replace("{{prompt}}", prompt)
      .replace("{{plan}}", JSON.stringify(plan, null, 2))
      .replace("{{errors}}", logs.join("\n"))
      .replace("{{context}}", formatContext(contextFiles));
    const fixPatch = await generateCompletion(
      settings.baseUrl,
      settings.model,
      fixPrompt,
      settings
    );
    pushLog("اعمال پچ اصلاحی...");
    await applyPatch(projectPath, fixPatch, pushLog);
    const lintSuccessFix = await runAllowedCommand("npm run lint", projectPath, pushLog);
    const buildSuccessFix = await runAllowedCommand("npm run build", projectPath, pushLog);
    success = lintSuccessFix && buildSuccessFix;
    return { planText, patchText: `${patchText}\n\n${fixPatch}`, logs, success };
  }

  return { planText, patchText, logs, success };
}

export async function applyPatch(projectPath: string, patchText: string, onLog: (m: string) => void) {
  const git = simpleGit({ baseDir: projectPath });
  const patchFile = path.join(os.tmpdir(), `studio-${Date.now()}.patch`);
  fs.writeFileSync(patchFile, patchText);
  try {
    await git.raw(["apply", "--whitespace=fix", patchFile]);
  } catch (error) {
    onLog(`خطا در اعمال پچ: ${(error as Error).message}`);
    throw error;
  } finally {
    fs.unlinkSync(patchFile);
  }
}

export async function runAllowedCommand(
  command: string,
  projectPath: string,
  onLog: (message: string) => void
) {
  if (!ALLOWED_COMMANDS.has(command)) {
    onLog("دستور غیرمجاز مسدود شد.");
    return false;
  }
  return new Promise<boolean>((resolve) => {
    const [cmd, ...args] = command.split(" ");
    const child = spawn(cmd, args, { cwd: projectPath, shell: false });
    child.stdout.on("data", (data) => onLog(data.toString()));
    child.stderr.on("data", (data) => onLog(data.toString()));
    child.on("close", (code) => resolve(code === 0));
  });
}

export function formatContext(contextFiles: { path: string; content: string }[]) {
  return contextFiles
    .map((file) => `---\n${file.path}\n${file.content}\n---`)
    .join("\n");
}

export function extractPatchFiles(patchText: string) {
  const files = new Set<string>();
  for (const line of patchText.split("\n")) {
    if (line.startsWith("diff --git")) {
      const match = line.match(/diff --git a\/(.+?) b\/(.+)/);
      if (match) {
        files.add(match[1]);
      }
    }
  }
  return Array.from(files);
}

export function loadContext(
  projectPath: string,
  plan: Plan | null,
  lastTouched: string[]
): { path: string; content: string }[] {
  const baseFiles = ["SPEC.md", "CONVENTIONS.md", "ARCHITECTURE.md", "package.json"];
  const planFiles = plan
    ? [...plan.files_to_create, ...plan.files_to_modify, ...plan.files_to_delete]
        .map((file) => file.path)
        .filter(Boolean)
    : [];
  const files = Array.from(new Set([...baseFiles, ...lastTouched, ...planFiles]));
  return files
    .map((file) => {
      const resolved = sanitizePath(projectPath, file);
      if (!fs.existsSync(resolved) || fs.statSync(resolved).isDirectory()) {
        return null;
      }
      const content = fs.readFileSync(resolved, "utf-8");
      return { path: file, content: content.slice(0, 8000) };
    })
    .filter(Boolean) as { path: string; content: string }[];
}
