export type DeepseekModel = {
  id: string;
  object: "model";
  owned_by: string;
};

export type GetDeepseekModelsResponse = {
  object: "list";
  data: DeepseekModel[];
};

export async function getDeepseekModels(args: {
  apiKey: string;
}): Promise<GetDeepseekModelsResponse> {
  // make the request
  const response = await fetch("https://api.deepseek.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      Accept: "application/json",
    },
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    const parsedError = JSON.parse(error);
    throw new Error(
      parsedError?.error?.message ??
        `Deepseek get models failed: ${response.status} ${response.statusText}`,
    );
  }
  return (await response.json()) as GetDeepseekModelsResponse;
}

export async function createDeepseekChatStream(args: {
  apiKey: string;
  modelId: string;
  message: string;
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "x-api-key": args.apiKey,
      "deepseek-version": "2023-06-01",
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
        `Deepseek chat failed: ${response.status} ${response.statusText}`,
    );
  }
  return response;
}
