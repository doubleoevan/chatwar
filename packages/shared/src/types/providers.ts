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
  iconSvg: string;
  color: [number, number, number];
};
