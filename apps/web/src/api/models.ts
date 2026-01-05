import type { ProviderId, ProviderModels } from "@chatwar/shared";
import { fetchJson } from "@/api/client";

export async function getProviderModels(args: {
  providerId: ProviderId;
  providerApiKey: string;
  signal?: AbortSignal;
}): Promise<ProviderModels> {
  return fetchJson<ProviderModels>(
    `/api/v1/providers/${args.providerId}/models`,
    { method: "GET" },
    { providerApiKey: args.providerApiKey, signal: args.signal },
  );
}
