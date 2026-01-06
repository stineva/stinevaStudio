export type OllamaSettings = {
  baseUrl: string;
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
};

export type OllamaModel = { name: string };

export async function listModels(baseUrl: string): Promise<OllamaModel[]> {
  const response = await fetch(`${baseUrl}/api/tags`);
  if (!response.ok) {
    throw new Error("خطا در دریافت لیست مدل‌ها از اولاما");
  }
  const data = (await response.json()) as { models?: { name: string }[] };
  return data.models ?? [];
}

export async function generateCompletion(
  baseUrl: string,
  model: string,
  prompt: string,
  options: { temperature: number; topP: number; maxTokens: number }
) {
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: options.temperature,
        top_p: options.topP,
        num_predict: options.maxTokens
      }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`خطا در فراخوانی مدل: ${text}`);
  }
  const data = (await response.json()) as { response?: string };
  return data.response ?? "";
}

export async function checkHealth(baseUrl: string) {
  const response = await fetch(`${baseUrl}/api/tags`);
  return response.ok;
}
