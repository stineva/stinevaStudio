import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("studio", {
  listProjects: () => ipcRenderer.invoke("projects:list"),
  createProject: (name: string) => ipcRenderer.invoke("projects:create", name),
  openProject: () => ipcRenderer.invoke("projects:open"),
  getProjectTree: (projectPath: string) =>
    ipcRenderer.invoke("projects:tree", projectPath),
  getPromptHistory: (projectId: string) =>
    ipcRenderer.invoke("projects:prompts", projectId),
  rollbackProject: (projectPath: string, commit: string) =>
    ipcRenderer.invoke("projects:rollback", projectPath, commit),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  saveSettings: (settings: unknown) => ipcRenderer.invoke("settings:save", settings),
  listModels: (baseUrl: string) => ipcRenderer.invoke("ollama:models", baseUrl),
  checkHealth: (baseUrl: string) => ipcRenderer.invoke("ollama:health", baseUrl),
  runPipeline: (payload: {
    projectId: string;
    projectPath: string;
    prompt: string;
    dryRun: boolean;
  }) => ipcRenderer.invoke("pipeline:run", payload),
  onPipelineLog: (callback: (message: string) => void) => {
    ipcRenderer.on("pipeline:log", (_event, message) => callback(message));
  }
});
