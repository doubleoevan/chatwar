import React, { ReactNode, useCallback, useEffect, useMemo, useReducer, useRef } from "react";

import type { ApiError, ProviderId, ProviderModels } from "@chatwar/shared";

import {
  API_KEYS_STORAGE_KEY,
  getApiKey as getSavedApiKey,
  getApiKeys,
  type ProviderApiKeys,
  removeApiKey,
  storeApiKey,
} from "@/utils/apiKeys";
import { getProviderModels } from "@/api";
import { toApiError } from "@/utils/apiError";
import { toastApiError } from "@/utils/toast";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { CredentialsContext } from "@/providers/credentials/CredentialsContext";

export type CredentialsState = {
  apiKeys: ProviderApiKeys;
  loadingProviderIds: Set<ProviderId>;
  providerModels: Partial<Record<ProviderId, ProviderModels>>;
  providerErrors: Partial<Record<ProviderId, ApiError>>;
};

type CredentialsAction =
  | { type: "SET_API_KEYS"; apiKeys: ProviderApiKeys }
  | { type: "API_KEYS_UPDATED" }
  | { type: "ADD_LOADING_PROVIDER"; providerId: ProviderId }
  | { type: "REMOVE_LOADING_PROVIDER"; providerId: ProviderId }
  | { type: "SET_PROVIDER_MODELS"; providerId: ProviderId; providerModels: ProviderModels }
  | { type: "REMOVE_PROVIDER_KEY"; providerId: ProviderId }
  | { type: "REMOVE_PROVIDER_MODELS"; providerId: ProviderId }
  | { type: "SET_PROVIDER_ERROR"; providerId: ProviderId; error: ApiError }
  | { type: "REMOVE_PROVIDER_ERROR"; providerId: ProviderId };

const initialState: CredentialsState = {
  apiKeys: getApiKeys(),
  loadingProviderIds: new Set<ProviderId>(),
  providerModels: {},
  providerErrors: {},
};

function credentialsReducer(state: CredentialsState, action: CredentialsAction): CredentialsState {
  switch (action.type) {
    case "SET_API_KEYS": {
      return {
        ...state,
        apiKeys: action.apiKeys,
      };
    }

    case "API_KEYS_UPDATED": {
      return {
        ...state,
        apiKeys: getApiKeys(),
      };
    }

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
      const providerId = action.providerId;
      const providerErrors = { ...state.providerErrors };
      delete providerErrors[providerId];

      // save the new provider models
      return {
        ...state,
        providerModels: { ...state.providerModels, [providerId]: action.providerModels },
        providerErrors,
      };
    }

    case "REMOVE_PROVIDER_KEY": {
      const apiKeys = { ...state.apiKeys };
      delete apiKeys[action.providerId];
      return { ...state, apiKeys };
    }

    case "REMOVE_PROVIDER_MODELS": {
      const providerModels = { ...state.providerModels };
      delete providerModels[action.providerId];
      return { ...state, providerModels };
    }

    case "SET_PROVIDER_ERROR": {
      return {
        ...state,
        providerErrors: {
          ...state.providerErrors,
          [action.providerId]: action.error,
        },
      };
    }

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
  const [state, dispatch] = useReducer(credentialsReducer, initialState);

  // use an instance field for current provider models to check when loading
  const providerModelsRef = useRef(state.providerModels);
  useEffect(() => {
    providerModelsRef.current = state.providerModels;
  }, [state.providerModels]);

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

  // fetch models from provider api keys
  const fetchProviderModels = useCallback(
    async (
      providerId: ProviderId,
      apiKey: string,
      action: "saveApiKey" | "loadProviderModels",
      options?: { signal?: AbortSignal },
    ) => {
      dispatch({ type: "ADD_LOADING_PROVIDER", providerId });
      dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
      dispatch({ type: "REMOVE_PROVIDER_MODELS", providerId });
      try {
        // update the models
        const useCache = action !== "saveApiKey";
        const providerModels = await getProviderModels({
          providerId,
          providerApiKey: apiKey,
          signal: options?.signal,
          useCache,
        });
        dispatch({ type: "SET_PROVIDER_MODELS", providerId, providerModels });

        // update the provider api key if necessary
        if (getSavedApiKey(providerId) !== apiKey) {
          storeApiKey(providerId, apiKey);
          dispatch({ type: "SET_API_KEYS", apiKeys: getApiKeys() });
        }
      } catch (error) {
        // no need to log an error if the request was manually aborted
        if (
          options?.signal?.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        // save the error
        const apiError = toApiError(error, {
          code: "PROVIDER_FAILED",
          message: "Unknown error validating API key",
        });
        dispatch({ type: "SET_PROVIDER_ERROR", providerId, error: apiError });

        // show an error toast
        const provider = PROVIDER_CONFIGURATIONS[providerId];
        const { Icon } = provider;
        toastApiError(apiError, {
          providerId,
          icon: <Icon />,
          metadata: {
            action,
            endpoint: `/v1/providers/${providerId}/models`,
          },
        });
      } finally {
        dispatch({ type: "REMOVE_LOADING_PROVIDER", providerId });
      }
    },
    [],
  );

  // reload missing provider models using api keys from local storage
  useEffect(() => {
    // nothing to hydrate if there are no api keys in local storage
    const apiKeys = Object.entries(state.apiKeys) as Array<[ProviderId, string]>;
    if (apiKeys.length === 0) {
      return;
    }
    const controller = new AbortController();
    const { signal } = controller;
    const providerModels = providerModelsRef.current;
    const loadProviderModels = async () => {
      for (const [providerId, apiKey] of apiKeys) {
        // exit on unmount
        if (signal.aborted) {
          return;
        }
        // ignore providers without keys or with models already hydrated
        if (!apiKey || providerModels[providerId]) {
          continue;
        }
        await fetchProviderModels(providerId, apiKey, "loadProviderModels", { signal });
      }
    };
    void loadProviderModels();

    // abort loading models on unmount
    return () => {
      controller.abort();
    };
  }, [state.apiKeys, fetchProviderModels]);

  const saveApiKey = useCallback(
    async (providerId: ProviderId, apiKey: string) => {
      await fetchProviderModels(providerId, apiKey, "saveApiKey");
    },
    [fetchProviderModels],
  );

  const deleteApiKey = useCallback((providerId: ProviderId) => {
    removeApiKey(providerId);
    dispatch({
      type: "SET_API_KEYS",
      apiKeys: getApiKeys(),
    });
    dispatch({ type: "REMOVE_PROVIDER_KEY", providerId });
    dispatch({ type: "REMOVE_PROVIDER_MODELS", providerId });
    dispatch({ type: "REMOVE_PROVIDER_ERROR", providerId });
  }, []);

  const getApiKey = useCallback(
    (providerId: ProviderId) => state.apiKeys[providerId] ?? null,
    [state.apiKeys],
  );

  // memoize context to avoid rerendering consumers
  const value = useMemo(
    () => ({
      ...state,
      saveApiKey,
      deleteApiKey,
      getApiKey,
    }),
    [state, saveApiKey, deleteApiKey, getApiKey],
  );
  return <CredentialsContext.Provider value={value}>{children}</CredentialsContext.Provider>;
}
