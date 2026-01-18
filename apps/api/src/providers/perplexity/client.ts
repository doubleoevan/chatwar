export type PerplexityModel = {
  id: string;
  object: "model";
  owned_by: string;
};

export type GetPerplexityModelsResponse = {
  object: "list";
  data: PerplexityModel[];
};

export async function getPerplexityModels(args: {
  apiKey: string;
}): Promise<GetPerplexityModelsResponse> {
  // validate the API key
  await validatePerplexityApiKey(args.apiKey);

  // Perplexity does not document a GET /models endpoint.
  // Their docs provide a fixed set of Sonar model IDs used with /chat/completions.
  // So we return the supported models as a static list.
  return {
    object: "list",
    data: [
      { id: "sonar-pro", object: "model", owned_by: "perplexity" },
      { id: "sonar-reasoning-pro", object: "model", owned_by: "perplexity" },
      { id: "sonar-deep-research", object: "model", owned_by: "perplexity" },
      { id: "sonar", object: "model", owned_by: "perplexity" },
    ],
  };
}

export async function validatePerplexityApiKey(apiKey: string): Promise<void> {
  // post a validation chat message
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "sonar",
      messages: [{ role: "user", content: "ping" }],
      max_tokens: 1,
      temperature: 0,
    }),
  });

  // throw an error if the request failed
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    const parsedError = JSON.parse(error);
    throw new Error(
      parsedError?.error?.message ??
        `Perplexity validation failed: ${response.status} ${response.statusText}`,
    );
  }
}

export async function createPerplexityChatStream(args: {
  apiKey: string;
  modelId: string;
  message: string;
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
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
        `Perplexity chat failed: ${response.status} ${response.statusText}`,
    );
  }
  return response;
}
