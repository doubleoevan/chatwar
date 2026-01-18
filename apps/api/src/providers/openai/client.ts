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

  // throw an error if the request failed
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `OpenAI get models failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }

  // return the response
  return (await response.json()) as GetOpenAIModelsResponse;
}
