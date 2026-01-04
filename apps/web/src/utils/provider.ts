import type { Provider } from "@/types/provider";
import type { ProviderApiKeys } from "@/utils/apiKeys";

/**
 * non-mutating fisher–yates shuffle.
 */
function shuffle(items: readonly Provider[]): Provider[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(Math.random() * (i + 1));
    [result[i], result[swapIndex]] = [result[swapIndex], result[i]];
  }
  return result;
}

/**
 * sorts providers with API keys first.
 * optionally shuffles providers with API keys
 */
export function sortProviders(
  providers: readonly Provider[],
  apiKeys: ProviderApiKeys,
  shuffleProvidersWithKeys = false,
): Provider[] {
  const providersWithKeys: Provider[] = [];
  const providersWithoutKeys: Provider[] = [];
  for (const provider of providers) {
    if (apiKeys[provider.id]) {
      providersWithKeys.push(provider);
    } else {
      providersWithoutKeys.push(provider);
    }
  }
  const orderedProvidersWithKeys = shuffleProvidersWithKeys
    ? shuffle(providersWithKeys)
    : providersWithKeys;
  return [...orderedProvidersWithKeys, ...providersWithoutKeys];
}
