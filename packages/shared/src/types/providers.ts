export const PROVIDERS = [
  "openai",
  "gemini",
  "deepseek",
  "anthropic",
  "perplexity",
  "xai",
] as const;

export type ProviderId = (typeof PROVIDERS)[number];

export type ProviderMetadata = {
  id: ProviderId;
  label: string;
  apiKeyUrl: string;
  iconSvg: string;
  color: [number, number, number];
};
