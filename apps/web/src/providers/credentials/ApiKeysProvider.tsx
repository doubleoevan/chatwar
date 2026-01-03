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
import { randomDelay } from "@/mocks/latency";

type ApiKeysState = { apiKeys: ProviderApiKeys; loadingProviderIds: Set<ProviderId> };
type ApiKeysAction =
  | { type: "SET_API_KEYS"; apiKeys: ProviderApiKeys }
  | { type: "API_KEYS_UPDATED" }
  | { type: "ADD_PROVIDER_LOADING"; providerId: ProviderId }
  | { type: "REMOVE_PROVIDER_LOADING"; providerId: ProviderId };

function apiKeysReducer(state: ApiKeysState, action: ApiKeysAction): ApiKeysState {
  switch (action.type) {
    case "SET_API_KEYS":
      return {
        ...state,
        apiKeys: action.apiKeys,
      };
    case "API_KEYS_UPDATED":
      return {
        ...state,
        apiKeys: getApiKeys(),
      };
    case "ADD_PROVIDER_LOADING": {
      const loadingProviderIds = new Set(state.loadingProviderIds);
      loadingProviderIds.add(action.providerId);
      return { ...state, loadingProviderIds };
    }
    case "REMOVE_PROVIDER_LOADING": {
      const loadingProviderIds = new Set(state.loadingProviderIds);
      loadingProviderIds.delete(action.providerId);
      return { ...state, loadingProviderIds };
    }
    default:
      return state;
  }
}

export function ApiKeysProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(apiKeysReducer, {
    apiKeys: getApiKeys(),
    loadingProviderIds: new Set<ProviderId>(),
  });

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

  const saveApiKey = useCallback(async (providerId: ProviderId, apiKey: string) => {
    dispatch({
      type: "ADD_PROVIDER_LOADING",
      providerId,
    });

    // TODO: validate api key
    await randomDelay({ minimum: 2000 });

    dispatch({
      type: "REMOVE_PROVIDER_LOADING",
      providerId,
    });

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
      loadingProviderIds: state.loadingProviderIds,
    }),
    [saveApiKey, deleteApiKey, getApiKey, state.apiKeys, state.loadingProviderIds],
  );
  return <ApiKeysContext.Provider value={value}>{children}</ApiKeysContext.Provider>;
}
