/* Providers */
export const PROVIDERS = [
  "openai",
  "anthropic",
  "gemini",
  "xai",
  "deepseek",
  "perplexity",
] as const;

export type ProviderId = (typeof PROVIDERS)[number];

export type ProviderMetadata = {
  id: ProviderId;
  label: string;
  apiKeyUrl: string;
};

export type ProviderModels = {
  providerId: ProviderId;
  models: Model[];
  defaultModelId: string;
};

export type Model = {
  /** Provider-specific model identifier (passed through verbatim) */
  id: string; // e.g. "gpt-4o-mini", "claude-3-5-sonnet-latest"

  /** Human-friendly label for UI */
  label: string;

  /** Optional metadata for UX / analytics */
  contextWindow?: number;
  inputCostPer1M?: number;
  outputCostPer1M?: number;

  capabilities?: {
    vision?: boolean;
    tools?: boolean;
    streaming?: boolean;
  };

  /** Used to guide users toward sane defaults */
  recommended?: boolean;
};
