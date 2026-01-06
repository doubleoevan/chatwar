import seedrandom from "seedrandom";
import { Provider } from "@/types/provider";
import { ProviderApiKeys } from "@/utils/apiKeys";

/**
 * Deterministic, seeded Fisher–Yates shuffle for stable UI ordering.
 */
function shuffleProviders(items: readonly Provider[], seed: number): Provider[] {
  const randomNumberGenerator = seedrandom(String(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const swapIndex = Math.floor(randomNumberGenerator() * (i + 1));
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
  shuffleSeed = 0,
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
  const orderedProvidersWithKeys = shuffleSeed
    ? shuffleProviders(providersWithKeys, shuffleSeed)
    : providersWithKeys;
  return [...orderedProvidersWithKeys, ...providersWithoutKeys];
}
