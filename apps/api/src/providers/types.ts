import type { ProviderId, ProviderModels } from "@chatwar/shared";

export type GetModelsArgs = {
  apiKey: string;
  providerId: ProviderId;
};

export type ProviderAdapter = {
  id: ProviderId;
  getModels: (args: GetModelsArgs) => Promise<ProviderModels>;
};
