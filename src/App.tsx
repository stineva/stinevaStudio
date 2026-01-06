import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";
import LogsPanel from "./components/LogsPanel";
import SettingsPanel from "./components/SettingsPanel";
import { PipelineResult, Project, PromptHistory, Settings } from "./types";

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [fileTree, setFileTree] = useState<{ path: string; type: "file" | "dir" }[]>([]);
  const [promptHistory, setPromptHistory] = useState<PromptHistory[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [planOutput, setPlanOutput] = useState("");
  const [patchOutput, setPatchOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"plan" | "diff" | "settings">("plan");

  useEffect(() => {
    window.studio.listProjects().then(setProjects);
    window.studio.getSettings().then(setSettings);
    window.studio.onPipelineLog((message) => {
      setLogs((prev) => [...prev, message]);
    });
  }, []);

  useEffect(() => {
    if (!currentProject) return;
    window.studio.getProjectTree(currentProject.path).then(setFileTree);
    window.studio.getPromptHistory(currentProject.id).then(setPromptHistory);
  }, [currentProject]);

  const projectPathLabel = useMemo(() => {
    if (!currentProject) return "پروژه‌ای انتخاب نشده است";
    return `مسیر پروژه: ${currentProject.path}`;
  }, [currentProject]);

  const handleCreateProject = async (name: string) => {
    const created = await window.studio.createProject(name);
    if ("cancelled" in created) return;
    setProjects((prev) => [created, ...prev]);
    setCurrentProject(created);
  };

  const handleOpenProject = async () => {
    const opened = await window.studio.openProject();
    if ("cancelled" in opened) return;
    setProjects((prev) => [opened, ...prev]);
    setCurrentProject(opened);
  };

  const handleRunPipeline = async (prompt: string, dryRun: boolean) => {
    if (!currentProject) return;
    setRunning(true);
    setLogs([]);
    setPlanOutput("");
    setPatchOutput("");
    const result: PipelineResult = await window.studio.runPipeline({
      projectId: currentProject.id,
      projectPath: currentProject.path,
      prompt,
      dryRun
    });
    setPlanOutput(result.planText);
    setPatchOutput(result.patchText);
    setRunning(false);
    window.studio.getPromptHistory(currentProject.id).then(setPromptHistory);
  };

  const handleSaveSettings = async (nextSettings: Settings) => {
    await window.studio.saveSettings(nextSettings);
    setSettings(nextSettings);
  };

  const handleRollback = async () => {
    if (!currentProject || !currentProject.lastSuccessCommit) return;
    await window.studio.rollbackProject(currentProject.path, currentProject.lastSuccessCommit);
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Local AI Studio</h1>
          <p className="text-sm text-slate-400">استودیو محلی تولید فرانت‌اند با مدل‌های محلی</p>
        </div>
        <div className="text-sm text-slate-400">{projectPathLabel}</div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          projects={projects}
          currentProject={currentProject}
          onSelectProject={setCurrentProject}
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
          fileTree={fileTree}
          promptHistory={promptHistory}
          onRollback={handleRollback}
        />
        <main className="flex-1 grid grid-rows-[1fr_auto]">
          <Workspace
            running={running}
            planOutput={planOutput}
            patchOutput={patchOutput}
            onRun={handleRunPipeline}
            activeTab={activeTab}
            onChangeTab={setActiveTab}
          >
            {activeTab === "settings" && settings && (
              <SettingsPanel settings={settings} onSave={handleSaveSettings} />
            )}
          </Workspace>
          <LogsPanel logs={logs} />
        </main>
      </div>
    </div>
  );
}
