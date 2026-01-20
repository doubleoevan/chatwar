export const PROVIDERS = [
  "openai",
  "gemini",
  "anthropic",
  "perplexity",
  "xai",
  "deepseek",
] as const;

export type ProviderId = (typeof PROVIDERS)[number];

export type ProviderMetadata = {
  id: ProviderId;
  label: string;
  apiKeyUrl: string;
  iconSvg: string;
  color: [number, number, number];
};
