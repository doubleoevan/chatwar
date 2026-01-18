export type GeminiModel = {
  // resource name, e.g. "models/gemini-1.5-flash-001"
  name: string;

  // e.g. "gemini-1.5-flash"
  baseModelId: string;

  // e.g. "001"
  version: string;

  // e.g. "Gemini 1.5 Flash"
  displayName: string;

  // useful metadata (optional)
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;

  // e.g. ["generateContent", "embedContent"]
  supportedGenerationMethods?: string[];
};

export type GetGeminiModelsResponse = {
  models: GeminiModel[];
  nextPageToken?: string;
};

export async function getGeminiModels(args: { apiKey: string }): Promise<GetGeminiModelsResponse> {
  // make the request
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    method: "GET",
    headers: {
      "x-goog-api-key": args.apiKey,
      "Content-Type": "application/json",
    },
  });

  // throw an error if the request failed
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Gemini get models failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }

  // return the response
  return (await response.json()) as GetGeminiModelsResponse;
}
