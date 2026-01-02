import {
  API_KEYS_STORAGE_KEY,
  getApiKeys,
  ProviderApiKeys,
  removeApiKey,
  storeApiKey,
} from "@/utils/apiKeys";
import { ProviderId } from "@chatwar/shared";
import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { ApiKeysContext } from "@/providers/credentials/ApiKeysContext";

type ApiKeysState = { apiKeys: ProviderApiKeys };
type ApiKeysAction =
  | { type: "SET_API_KEYS"; apiKeys: ProviderApiKeys }
  | { type: "API_KEYS_UPDATED" };

function apiKeysReducer(state: ApiKeysState, action: ApiKeysAction): ApiKeysState {
  switch (action.type) {
    case "SET_API_KEYS":
      return { apiKeys: action.apiKeys };
    case "API_KEYS_UPDATED":
      return { apiKeys: getApiKeys() };
    default:
      return state;
  }
}

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(apiKeysReducer, { apiKeys: getApiKeys() });

  // listen to local storage changes
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onStorageChange = (event: StorageEvent) => {
      if (event.key === API_KEYS_STORAGE_KEY) {
        dispatch({ type: "API_KEYS_UPDATED" });
      }
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  const saveApiKey = useCallback((providerId: ProviderId, apiKey: string) => {
    storeApiKey(providerId, apiKey);
    dispatch({
      type: "SET_API_KEYS",
      apiKeys: getApiKeys(),
    });
  }, []);

  const deleteApiKey = useCallback((providerId: ProviderId) => {
    removeApiKey(providerId);
    dispatch({
      type: "SET_API_KEYS",
      apiKeys: getApiKeys(),
    });
  }, []);

  const getApiKey = useCallback(
    (providerId: ProviderId) => state.apiKeys[providerId] ?? null,
    [state.apiKeys],
  );

  // memoize context to avoid rerendering consumers
  const value = useMemo(
    () => ({
      saveApiKey,
      deleteApiKey,
      getApiKey,
      apiKeys: state.apiKeys,
    }),
    [saveApiKey, deleteApiKey, getApiKey, state.apiKeys],
  );
  return <ApiKeysContext.Provider value={value}>{children}</ApiKeysContext.Provider>;
}
