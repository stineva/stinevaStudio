import { app, BrowserWindow, dialog, ipcMain } from "electron";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import simpleGit from "simple-git";
import {
  addExecution,
  getSetting,
  listProjects,
  listPrompts,
  setSetting,
  upsertProject
} from "./db";
import { checkHealth, listModels, OllamaSettings } from "./ollama";
import {
  extractPatchFiles,
  runPipeline,
  PromptTemplates
} from "./pipeline";

const isDev = !app.isPackaged;
let mainWindow: BrowserWindow | null = null;

const DEFAULT_PROMPTS: PromptTemplates = {
  planner: `شما برنامه‌ریز هستید. خروجی فقط JSON معتبر با این فیلدها باشد:
{\n  "summary": "...",\n  "assumptions": ["..."],\n  "files_to_create": [{"path": "...", "purpose": "..."}],\n  "files_to_modify": [{"path": "...", "purpose": "..."}],\n  "files_to_delete": [{"path": "...", "purpose": "..."}],\n  "routes_added": ["..."],\n  "components_added": ["..."],\n  "mock_api_changes": ["..."],\n  "acceptance_tests": ["..."]\n}\n
درخواست کاربر:\n{{prompt}}\n\nکانتکست:\n{{context}}\n`,
  patcher: `شما پچر هستید. خروجی فقط یک unified diff بدون توضیح.

برنامه:\n{{plan}}\n
درخواست کاربر:\n{{prompt}}\n
کانتکست:\n{{context}}\n`,
  fixer: `شما پچر اصلاحی هستید. فقط unified diff برگردان.

برنامه:\n{{plan}}\n
خطاها:\n{{errors}}\n
کانتکست:\n{{context}}\n`
};

function ensureDefaultPrompts() {
  const planner = getSetting("prompt.planner");
  if (!planner) {
    setSetting("prompt.planner", DEFAULT_PROMPTS.planner);
    setSetting("prompt.patcher", DEFAULT_PROMPTS.patcher);
    setSetting("prompt.fixer", DEFAULT_PROMPTS.fixer);
  }
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#0f172a",
    webPreferences: {
      preload: path.join(app.getAppPath(), "dist-electron", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), "dist-renderer", "index.html"));
  }
}

app.whenReady().then(() => {
  ensureDefaultPrompts();
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

ipcMain.handle("projects:list", () => listProjects());

ipcMain.handle("projects:create", async (_event, name: string) => {
  const selection = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"]
  });
  if (selection.canceled || selection.filePaths.length === 0) {
    return { cancelled: true };
  }
  const basePath = selection.filePaths[0];
  const projectPath = path.join(basePath, name);
  fs.mkdirSync(projectPath, { recursive: true });
  const templatePath = path.join(app.getAppPath(), "templates", "nextjs-rtl-mock");
  fs.cpSync(templatePath, projectPath, { recursive: true });
  const git = simpleGit({ baseDir: projectPath });
  await git.init();
  await git.add(".");
  await git.commit("ایجاد پروژه از قالب پیش‌فرض");

  const projectId = crypto.randomUUID();
  upsertProject({
    id: projectId,
    name,
    path: projectPath,
    lastOpenedAt: new Date().toISOString(),
    lastSuccessCommit: (await git.revparse(["HEAD"]))
  });
  return { id: projectId, name, path: projectPath };
});

ipcMain.handle("projects:open", async () => {
  const selection = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });
  if (selection.canceled || selection.filePaths.length === 0) {
    return { cancelled: true };
  }
  const projectPath = selection.filePaths[0];
  const name = path.basename(projectPath);
  const projectId = crypto.randomUUID();
  upsertProject({
    id: projectId,
    name,
    path: projectPath,
    lastOpenedAt: new Date().toISOString()
  });
  return { id: projectId, name, path: projectPath };
});

ipcMain.handle("projects:tree", async (_event, projectPath: string) => {
  const files: { path: string; type: "file" | "dir" }[] = [];
  const walk = (dir: string, prefix = "") => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach((entry) => {
      const rel = path.join(prefix, entry.name);
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push({ path: rel, type: "dir" });
        walk(full, rel);
      } else {
        files.push({ path: rel, type: "file" });
      }
    });
  };
  walk(projectPath);
  return files;
});

ipcMain.handle("projects:prompts", (_event, projectId: string) => listPrompts(projectId));

ipcMain.handle("projects:rollback", async (_event, projectPath: string, commit: string) => {
  const git = simpleGit({ baseDir: projectPath });
  await git.reset(["--hard", commit]);
  return true;
});

ipcMain.handle("settings:get", () => {
  return {
    baseUrl: getSetting("ollama.baseUrl") ?? "http://localhost:11434",
    model: getSetting("ollama.model") ?? "",
    temperature: Number(getSetting("ollama.temperature") ?? 0.2),
    topP: Number(getSetting("ollama.topP") ?? 0.9),
    maxTokens: Number(getSetting("ollama.maxTokens") ?? 2048),
    planner: getSetting("prompt.planner") ?? DEFAULT_PROMPTS.planner,
    patcher: getSetting("prompt.patcher") ?? DEFAULT_PROMPTS.patcher,
    fixer: getSetting("prompt.fixer") ?? DEFAULT_PROMPTS.fixer
  };
});

ipcMain.handle("settings:save", (_event, settings) => {
  setSetting("ollama.baseUrl", settings.baseUrl);
  setSetting("ollama.model", settings.model);
  setSetting("ollama.temperature", String(settings.temperature));
  setSetting("ollama.topP", String(settings.topP));
  setSetting("ollama.maxTokens", String(settings.maxTokens));
  setSetting("prompt.planner", settings.planner);
  setSetting("prompt.patcher", settings.patcher);
  setSetting("prompt.fixer", settings.fixer);
  return true;
});

ipcMain.handle("ollama:models", async (_event, baseUrl: string) => listModels(baseUrl));
ipcMain.handle("ollama:health", async (_event, baseUrl: string) => checkHealth(baseUrl));

ipcMain.handle(
  "pipeline:run",
  async (
    event,
    params: {
      projectId: string;
      projectPath: string;
      prompt: string;
      dryRun: boolean;
    }
  ) => {
    const settings: OllamaSettings = {
      baseUrl: getSetting("ollama.baseUrl") ?? "http://localhost:11434",
      model: getSetting("ollama.model") ?? "",
      temperature: Number(getSetting("ollama.temperature") ?? 0.2),
      topP: Number(getSetting("ollama.topP") ?? 0.9),
      maxTokens: Number(getSetting("ollama.maxTokens") ?? 2048)
    };
    const templates: PromptTemplates = {
      planner: getSetting("prompt.planner") ?? DEFAULT_PROMPTS.planner,
      patcher: getSetting("prompt.patcher") ?? DEFAULT_PROMPTS.patcher,
      fixer: getSetting("prompt.fixer") ?? DEFAULT_PROMPTS.fixer
    };

    const onLog = (message: string) => {
      event.sender.send("pipeline:log", message);
    };

    const result = await runPipeline({
      projectPath: params.projectPath,
      prompt: params.prompt,
      settings,
      templates,
      lastTouched: [],
      onLog,
      dryRun: params.dryRun
    });

    if (!params.dryRun) {
      const git = simpleGit({ baseDir: params.projectPath });
      const patchFiles = extractPatchFiles(result.patchText);
      if (patchFiles.length > 0) {
        await git.add(patchFiles);
      }
      await git.commit(`اجرای درخواست: ${params.prompt.slice(0, 50)}`);
      if (result.success) {
        const commit = await git.revparse(["HEAD"]);
        const projects = listProjects();
        const project = projects.find((item) => item.id === params.projectId);
        if (project) {
          upsertProject({
            ...project,
            lastOpenedAt: new Date().toISOString(),
            lastSuccessCommit: commit
          });
        }
      }
    }

    addExecution({
      id: crypto.randomUUID(),
      projectId: params.projectId,
      prompt: params.prompt,
      plan: result.planText,
      patch: result.patchText,
      logs: result.logs.join("\n"),
      success: result.success ? 1 : 0,
      createdAt: new Date().toISOString()
    });

    return result;
  }
);
