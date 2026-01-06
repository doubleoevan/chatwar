import { useContext } from "react";
import {
  CredentialsContext,
  type CredentialsContextValue,
} from "@/providers/credentials/CredentialsContext";

export function useCredentials(): CredentialsContextValue {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error("useCredentials must be used within <CredentialsProvider />");
  }
  return context;
}
