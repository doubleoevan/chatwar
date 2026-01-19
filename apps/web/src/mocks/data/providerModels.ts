import type { ProviderId, ProviderModels } from "@chatwar/shared";

export const PROVIDER_MODELS: Record<ProviderId, ProviderModels> = {
  openai: {
    providerId: "openai",
    defaultModelId: "gpt-4o-mini",
    models: [
      {
        id: "gpt-4o-mini",
        label: "GPT-4o mini",
        contextWindow: 128_000,
        inputCostPer1M: 0.15,
        outputCostPer1M: 0.6,
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
        },
      },
      {
        id: "gpt-4.1-mini",
        label: "GPT-4.1 mini",
        contextWindow: 128_000,
        capabilities: {
          streaming: true,
          tools: true,
        },
      },
    ],
  },

  anthropic: {
    providerId: "anthropic",
    defaultModelId: "claude-3-5-sonnet-latest",
    models: [
      {
        id: "claude-3-5-sonnet-latest",
        label: "Claude 3.5 Sonnet",
        contextWindow: 200_000,
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
        },
      },
      {
        id: "claude-3-5-haiku-latest",
        label: "Claude 3.5 Haiku",
        contextWindow: 200_000,
        capabilities: {
          streaming: true,
          tools: true,
        },
      },
    ],
  },

  gemini: {
    providerId: "gemini",
    defaultModelId: "gemini-1.5-pro",
    models: [
      {
        id: "gemini-1.5-pro",
        label: "Gemini 1.5 Pro",
        contextWindow: 1_000_000,
        capabilities: {
          streaming: true,
          tools: true,
          vision: true,
        },
      },
      {
        id: "gemini-1.5-flash",
        label: "Gemini 1.5 Flash",
        contextWindow: 1_000_000,
        capabilities: {
          streaming: true,
          tools: true,
        },
      },
    ],
  },

  xai: {
    providerId: "xai",
    defaultModelId: "grok-2",
    models: [
      {
        id: "grok-2",
        label: "Grok-2",
        contextWindow: 128_000,
        capabilities: {
          streaming: true,
          tools: false,
        },
      },
      {
        id: "grok-2-mini",
        label: "Grok-2 Mini",
        contextWindow: 128_000,
        capabilities: {
          streaming: true,
        },
      },
    ],
  },

  deepseek: {
    providerId: "deepseek",
    defaultModelId: "deepseek-chat",
    models: [
      {
        id: "deepseek-chat",
        label: "DeepSeek Chat",
        contextWindow: 128_000,
        capabilities: {
          streaming: true,
          tools: true,
        },
      },
      {
        id: "deepseek-coder",
        label: "DeepSeek Coder",
        contextWindow: 128_000,
        capabilities: {
          streaming: true,
          tools: false,
        },
      },
    ],
  },

  perplexity: {
    providerId: "perplexity",
    defaultModelId: "sonar",
    models: [
      {
        id: "sonar",
        label: "Sonar",
        contextWindow: 32_000,
        capabilities: {
          streaming: true,
          tools: true,
        },
      },
      {
        id: "sonar-small",
        label: "Sonar Small",
        contextWindow: 16_000,
        capabilities: {
          streaming: true,
        },
      },
    ],
  },
};
