export type AnthropicModel = {
  id: string;
  type: "model";
  created_at: string;
  display_name: string;
};

export type GetAnthropicModelsResponse = {
  data: AnthropicModel[];
};

export async function getAnthropicModels(args: {
  apiKey: string;
}): Promise<GetAnthropicModelsResponse> {
  // make the request
  const response = await fetch("https://api.anthropic.com/v1/models", {
    method: "GET",
    headers: {
      "x-api-key": args.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
  });

  // throw an error if the request failed
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Anthropic get models failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }

  // return the response
  return (await response.json()) as GetAnthropicModelsResponse;
}
