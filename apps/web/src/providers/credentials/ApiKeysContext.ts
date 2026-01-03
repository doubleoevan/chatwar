import { createContext } from "react";
import type { ProviderId } from "@chatwar/shared";
import type { ProviderApiKeys } from "@/utils/apiKeys";

export type ApiKeysContextValue = {
  saveApiKey: (providerId: ProviderId, apiKey: string) => void;
  deleteApiKey: (providerId: ProviderId) => void;
  getApiKey: (providerId: ProviderId) => string | null;
  apiKeys: ProviderApiKeys;
  loadingProviderIds: Set<string>;
};

export const ApiKeysContext = createContext<ApiKeysContextValue | undefined>(undefined);
