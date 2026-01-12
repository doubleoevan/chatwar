import type { ProviderId, ProviderModels } from "@chatwar/shared";
import { fetchJson } from "@/api/client";

/**
 * GET /api/v1/providers/${providerId}/models
 * Used by CredentialsProvider
 */
export async function getProviderModels(args: {
  providerId: ProviderId;
  providerApiKey: string;
  useCache?: boolean;
  signal?: AbortSignal;
}): Promise<ProviderModels> {
  return fetchJson<ProviderModels>(
    `/api/v1/providers/${args.providerId}/models`,
    { method: "GET" },
    { providerApiKey: args.providerApiKey, useCache: args.useCache, signal: args.signal },
  );
}
