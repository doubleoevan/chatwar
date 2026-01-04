import { createContext } from "react";
import { ApiError, ProviderId, ProviderModels } from "@chatwar/shared";
import type { ProviderApiKeys } from "@/utils/apiKeys";

export type CredentialsContextValue = {
  saveApiKey: (providerId: ProviderId, apiKey: string) => void;
  deleteApiKey: (providerId: ProviderId) => void;
  getApiKey: (providerId: ProviderId) => string | null;
  apiKeys: ProviderApiKeys;
  loadingProviderIds: Set<string>;
  providerModels: Partial<Record<ProviderId, ProviderModels>>;
  providerErrors: Partial<Record<ProviderId, ApiError>>;
};

export const CredentialsContext = createContext<CredentialsContextValue | undefined>(undefined);
