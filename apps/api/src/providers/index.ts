import type { ProviderAdapter } from "./types";
import { openaiAdapter } from "./openai";
import { anthropicAdapter } from "./anthropic";
import { geminiAdapter } from "./gemini";
import { deepseekAdapter } from "./deepseek";
import { xaiAdapter } from "./xai";
import { perplexityAdapter } from "./perplexity";

const PROVIDER_ADAPTERS: Record<string, ProviderAdapter> = {
  [openaiAdapter.id]: openaiAdapter,
  [anthropicAdapter.id]: anthropicAdapter,
  [geminiAdapter.id]: geminiAdapter,
  [deepseekAdapter.id]: deepseekAdapter,
  [xaiAdapter.id]: xaiAdapter,
  [perplexityAdapter.id]: perplexityAdapter,
};

export function getProviderAdapter(providerId: string): ProviderAdapter {
  const adapter = PROVIDER_ADAPTERS[providerId];
  if (!adapter) {
    throw new Error(`Unsupported provider: ${providerId}`);
  }
  return adapter;
}
