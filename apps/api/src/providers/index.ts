import type { ProviderAdapter } from "./types";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";

const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  [openaiAdapter.id]: openaiAdapter,
  [anthropicAdapter.id]: anthropicAdapter,
};

export function getProviderAdapter(providerId: string): ProviderAdapter {
  const adapter = PROVIDER_ADAPTERS[providerId];
  if (!adapter) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }
  return adapter;
}
