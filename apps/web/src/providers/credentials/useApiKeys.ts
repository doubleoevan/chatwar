import { useContext } from "react";
import { ApiKeysContext, type ApiKeysContextValue } from "@/providers/credentials/ApiKeysContext";

export function useApiKeys(): ApiKeysContextValue {
  const context = useContext(ApiKeysContext);
  if (!context) {
    throw new Error("useApiKeys must be used within an ApiKeysContextProvider");
  }
  return context;
}
