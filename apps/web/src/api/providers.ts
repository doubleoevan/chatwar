import type { ApiError, ProviderId, ProviderModels } from "@chatwar/shared";

type ValidateKeySuccess = ProviderModels;
type ValidateKeyFailure = { error: ApiError };

export async function validateProviderKey(args: {
  providerId: ProviderId;
  apiKey: string;
}): Promise<ProviderModels> {
  // post the providerId and apiKey to the api
  const response = await fetch(`/api/v1/providers/${args.providerId}/validate-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: args.apiKey }),
  });

  // return the json as ProviderModels or throw an error
  const json = (await response.json()) as ValidateKeySuccess | ValidateKeyFailure;
  if (!response.ok) {
    throw "error" in json
      ? json.error
      : ({ code: "INTERNAL", message: "Unknown error" } satisfies ApiError);
  }
  return json as ProviderModels;
}
