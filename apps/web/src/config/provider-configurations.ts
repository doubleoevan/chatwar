import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
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
  },

  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    Icon: AnthropicIcon,
    apiKeyUrl: "https://console.anthropic.com/dashboard",
  },

  gemini: {
    id: "gemini",
    label: "Gemini",
    Icon: GeminiIcon,
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
  },

  xai: {
    id: "xai",
    label: "xAI",
    Icon: XAIIcon,
    apiKeyUrl: "https://console.x.ai/",
  },

  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    Icon: DeepSeekIcon,
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
  },

  perplexity: {
    id: "perplexity",
    label: "Perplexity",
    Icon: PerplexityIcon,
    apiKeyUrl: "https://docs.perplexity.ai/guides/api-key-management",
  },
};
