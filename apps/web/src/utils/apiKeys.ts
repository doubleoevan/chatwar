import type { ProviderId } from "@chatwar/shared";

export type ProviderApiKeys = Partial<Record<ProviderId, string>>;

export const API_KEYS_STORAGE_KEY = "chatwar.apikeys.v1";

export function storeApiKey(providerId: ProviderId, apiKey: string) {
  if (typeof window === "undefined" || !apiKey.trim()) {
    return;
  }
  const apiKeys = { ...getApiKeys() }; // clone in case getApiKeys uses a cache
  apiKeys[providerId] = apiKey.trim();
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
}

export function removeApiKey(providerId: ProviderId) {
  if (typeof window === "undefined") {
    return;
  }
  const apiKeys = { ...getApiKeys() }; // clone in case getApiKeys uses a cache
  delete apiKeys[providerId];
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
}

export function getApiKey(providerId: ProviderId) {
  if (typeof window === "undefined") {
    return null;
  }
  const apiKeys = getApiKeys();
  return apiKeys[providerId] ?? null;
}

export function getApiKeys(): ProviderApiKeys {
  if (typeof window === "undefined") {
    return {};
  }

  const apiKeysString = localStorage.getItem(API_KEYS_STORAGE_KEY);
  if (!apiKeysString) {
    return {};
  }

  try {
    const apiKeys = JSON.parse(apiKeysString);
    if (apiKeys && typeof apiKeys === "object" && !Array.isArray(apiKeys)) {
      return apiKeys as ProviderApiKeys;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(
        `[apiKeys] Failed to parse localStorage value for ${API_KEYS_STORAGE_KEY}`,
        error,
      );
    }
  }
  return {};
}
