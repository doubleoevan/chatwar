import type { Provider, ProviderId } from "@chatwar/shared";
import OpenAIIcon from "@/assets/icons/providers/openai.svg?react";
import AnthropicIcon from "@/assets/icons/providers/anthropic.svg?react";
import GeminiIcon from "@/assets/icons/providers/gemini.svg?react";
import XAIIcon from "@/assets/icons/providers/xai.svg?react";
import DeepSeekIcon from "@/assets/icons/providers/deepseek.svg?react";
import PerplexityIcon from "@/assets/icons/providers/perplexity.svg?react";

export const PROVIDER_CONFIGURATIONS: Record<ProviderId, Provider> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    Icon: OpenAIIcon,
    apiKeyUrl: "https://platform.openai.com/account/api-keys",
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
        recommended: true,
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
    id: "anthropic",
    label: "Anthropic",
    Icon: AnthropicIcon,
    apiKeyUrl: "https://console.anthropic.com/dashboard",
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
        recommended: true,
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
    id: "gemini",
    label: "Gemini",
    Icon: GeminiIcon,
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
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
        recommended: true,
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
    id: "xai",
    label: "xAI",
    Icon: XAIIcon,
    apiKeyUrl: "https://console.x.ai/",
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
        recommended: true,
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
    id: "deepseek",
    label: "DeepSeek",
    Icon: DeepSeekIcon,
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
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
        recommended: true,
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
    id: "perplexity",
    label: "Perplexity",
    Icon: PerplexityIcon,
    apiKeyUrl: "https://docs.perplexity.ai/guides/api-key-management",
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
        recommended: true,
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
