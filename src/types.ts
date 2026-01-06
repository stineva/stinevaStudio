export type Project = {
  id: string;
  name: string;
  path: string;
  lastOpenedAt: string;
  lastSuccessCommit?: string | null;
};

export type PromptHistory = {
  prompt: string;
  createdAt: string;
  success: number;
};

export type Settings = {
  baseUrl: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  planner: string;
  patcher: string;
  fixer: string;
};

export type PipelineResult = {
  planText: string;
  patchText: string;
  logs: string[];
  success: boolean;
};
