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

  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Perplexity API key validation failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }
}
