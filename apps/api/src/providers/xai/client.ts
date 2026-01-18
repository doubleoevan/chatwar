export type XAIModel = {
  id: string;
  object: "model";
  created?: string;
  owned_by?: string;
};

export type GetXAIModelsResponse = {
  object: "list";
  data: XAIModel[];
};

export async function getXAIModels(args: { apiKey: string }): Promise<GetXAIModelsResponse> {
  // make the request
  const response = await fetch("https://api.x.ai/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      Accept: "application/json",
    },
  });

  // throw an error if the request failed
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    const parsedError = JSON.parse(error);
    throw new Error(
      parsedError?.error?.message ??
        `xAI get models failed: ${response.status} ${response.statusText}`,
    );
  }
  return (await response.json()) as GetXAIModelsResponse;
}

export async function createXAIChatStream(args: {
  apiKey: string;
  modelId: string;
  message: string;
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: args.modelId,
      stream: true,
      messages: [{ role: "user", content: args.message }],
    }),
    signal: args.signal,
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    const parsedError = JSON.parse(error);
    throw new Error(
      parsedError?.error?.message ?? `xAI chat failed: ${response.status} ${response.statusText}`,
    );
  }
  return response;
}
