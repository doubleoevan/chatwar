import { createContext } from "react";
import { ProviderId } from "@chatwar/shared";
import { CredentialsState } from "@/providers/credentials/CredentialsProvider";

export type CredentialsContextValue = CredentialsState & {
  saveApiKey: (providerId: ProviderId, apiKey: string) => void;
  deleteApiKey: (providerId: ProviderId) => void;
  getApiKey: (providerId: ProviderId) => string | null;
};

export const CredentialsContext = createContext<CredentialsContextValue | undefined>(undefined);
