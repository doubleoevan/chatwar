import type { ProviderAdapter } from "./types";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { geminiAdapter } from "./gemini";

const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  [openaiAdapter.id]: openaiAdapter,
  [anthropicAdapter.id]: anthropicAdapter,
  [geminiAdapter.id]: geminiAdapter,
};

export function getProviderAdapter(providerId: string): ProviderAdapter {
  const adapter = PROVIDER_ADAPTERS[providerId];
  if (!adapter) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }
  return adapter;
}
