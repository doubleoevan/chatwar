export type OpenAIModel = {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
};

export type GetOpenAIModelsResponse = {
  data: OpenAIModel[];
};

export async function getOpenAIModels(args: { apiKey: string }): Promise<GetOpenAIModelsResponse> {
  // make the request
  const response = await fetch("https://api.openai.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    const parsedError = JSON.parse(error);
    throw new Error(
      parsedError?.error?.message ??
        `OpenAI get models failed: ${response.status} ${response.statusText}`,
    );
  }
  // return the response
  return (await response.json()) as GetOpenAIModelsResponse;
}

export async function createOpenAIChatStream(args: {
  apiKey: string;
  modelId: string;
  message: string;
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
      parsedError?.error?.message ??
        `OpenAI chat failed: ${response.status} ${response.statusText}`,
    );
  }
  return response;
}
