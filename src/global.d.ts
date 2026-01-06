import { Project, PromptHistory, Settings, PipelineResult } from "./types";

declare global {
  interface Window {
    studio: {
      listProjects: () => Promise<Project[]>;
      createProject: (name: string) => Promise<Project | { cancelled: true }>;
      openProject: () => Promise<Project | { cancelled: true }>;
      getProjectTree: (projectPath: string) => Promise<{ path: string; type: "file" | "dir" }[]>;
      getPromptHistory: (projectId: string) => Promise<PromptHistory[]>;
      rollbackProject: (projectPath: string, commit: string) => Promise<boolean>;
      getSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<boolean>;
      listModels: (baseUrl: string) => Promise<{ name: string }[]>;
      checkHealth: (baseUrl: string) => Promise<boolean>;
      runPipeline: (payload: {
        projectId: string;
        projectPath: string;
        prompt: string;
        dryRun: boolean;
      }) => Promise<PipelineResult>;
      onPipelineLog: (callback: (message: string) => void) => void;
    };
  }
}

export {};
