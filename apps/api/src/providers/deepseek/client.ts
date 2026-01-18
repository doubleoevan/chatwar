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

  // throw an error if the request failed
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Deepseek get models failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }

  // return the response
  return (await response.json()) as GetDeepseekModelsResponse;
}
