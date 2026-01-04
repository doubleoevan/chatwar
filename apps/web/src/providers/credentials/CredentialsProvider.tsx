import {
  API_KEYS_STORAGE_KEY,
  getApiKeys,
  ProviderApiKeys,
  removeApiKey,
  storeApiKey,
} from "@/utils/apiKeys";
import type { ApiError, ProviderId, ProviderModels } from "@chatwar/shared";
import { ReactNode, useCallback, useEffect, useMemo, useReducer } from "react";
import { CredentialsContext } from "@/providers/credentials/CredentialsContext";
import { validateProviderKey } from "@/api/providers";
import { toApiError } from "@/utils/apiError";

type CredentialsAction =
  | { type: "SET_API_KEYS"; apiKeys: ProviderApiKeys }
  | { type: "API_KEYS_UPDATED" }
  | { type: "ADD_LOADING_PROVIDER"; providerId: ProviderId }
  | { type: "REMOVE_LOADING_PROVIDER"; providerId: ProviderId }
  | { type: "SET_PROVIDER_MODELS"; providerModels: ProviderModels }
  | { type: "REMOVE_PROVIDER_MODELS"; providerId: ProviderId }
  | { type: "SET_PROVIDER_ERROR"; providerId: ProviderId; error: ApiError }
  | { type: "REMOVE_PROVIDER_ERROR"; providerId: ProviderId };

type CredentialsState = {
  apiKeys: ProviderApiKeys;
  loadingProviderIds: Set<ProviderId>;
  providerModels: Partial<Record<ProviderId, ProviderModels>>;
  providerErrors: Partial<Record<ProviderId, ApiError>>;
};

function credentialsReducer(state: CredentialsState, action: CredentialsAction): CredentialsState {
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
    case "ADD_LOADING_PROVIDER": {
      const loadingProviderIds = new Set(state.loadingProviderIds);
      loadingProviderIds.add(action.providerId);
      return { ...state, loadingProviderIds };
    }
    case "REMOVE_LOADING_PROVIDER": {
      const loadingProviderIds = new Set(state.loadingProviderIds);
      loadingProviderIds.delete(action.providerId);
      return { ...state, loadingProviderIds };
    }
    case "SET_PROVIDER_MODELS": {
      // remove a previous provider error
      const providerId = action.providerModels.providerId;
      const providerErrors = { ...state.providerErrors };
      delete providerErrors[providerId];

      // save the new provider models
      return {
        ...state,
        providerModels: { ...state.providerModels, [providerId]: action.providerModels },
        providerErrors,
      };
    }

    case "REMOVE_PROVIDER_MODELS": {
      const providerModels = { ...state.providerModels };
      delete providerModels[action.providerId];
      return { ...state, providerModels };
    }
    case "SET_PROVIDER_ERROR":
      return {
        ...state,
        providerErrors: {
          ...state.providerErrors,
          [action.providerId]: action.error,
        },
      };
    case "REMOVE_PROVIDER_ERROR": {
      const providerErrors = { ...state.providerErrors };
      delete providerErrors[action.providerId];
      return { ...state, providerErrors };
    }
    default:
      return state;
  }
}

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(credentialsReducer, {
    apiKeys: getApiKeys(),
    loadingProviderIds: new Set<ProviderId>(),
    providerModels: {},
    providerErrors: {},
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

  const saveApiKey = useCallback(
    async (providerId: ProviderId, apiKey: string) => {
      // remove provider data and show the loading animation
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
      dispatch({ type: "REMOVE_PROVIDER_MODELS", providerId });
      dispatch({ type: "ADD_LOADING_PROVIDER", providerId });
      try {
        // set the provider models and api key
        const providerModels = await validateProviderKey({ providerId, apiKey });
        dispatch({ type: "SET_PROVIDER_MODELS", providerModels });
        storeApiKey(providerId, apiKey);
        dispatch({ type: "SET_API_KEYS", apiKeys: getApiKeys() });
      } catch (error) {
        // or set an error
        const apiError = toApiError(error, {
          code: "PROVIDER_FAILED",
          message: "Unknown error validating API key",
        });
        dispatch({ type: "SET_PROVIDER_ERROR", providerId, error: apiError });
      } finally {
        // stop the loading animation
        dispatch({ type: "REMOVE_LOADING_PROVIDER", providerId });
      }
    },
    [dispatch],
  );

  const deleteApiKey = useCallback(
    (providerId: ProviderId) => {
      removeApiKey(providerId);
      dispatch({
        type: "SET_API_KEYS",
        apiKeys: getApiKeys(),
      });
      dispatch({ type: "REMOVE_PROVIDER_MODELS", providerId });
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
    },
    [dispatch],
  );

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
      providerModels: state.providerModels,
      providerErrors: state.providerErrors,
    }),
    [
      saveApiKey,
      deleteApiKey,
      getApiKey,
      state.apiKeys,
      state.loadingProviderIds,
      state.providerModels,
      state.providerErrors,
    ],
  );
  return <CredentialsContext.Provider value={value}>{children}</CredentialsContext.Provider>;
}
