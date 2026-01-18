import { getProviderAdapter } from "../providers";
import { ProviderId, ProviderModels } from "@chatwar/shared";

export async function getProviderModels(args: {
  apiKey: string;
  providerId: ProviderId;
}): Promise<ProviderModels> {
  const { providerId, apiKey } = args;
  if (!apiKey) {
    throw new Error("Missing provider API key");
  }
  const adapter = getProviderAdapter(providerId);
  return await adapter.getModels({ apiKey, providerId });
}
