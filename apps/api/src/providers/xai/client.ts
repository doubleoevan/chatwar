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
    throw new Error(
      `xAI get models failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }

  // return the response
  return (await response.json()) as GetXAIModelsResponse;
}
