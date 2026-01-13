import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";

// @ts-expect-error - vite svg imports are handled at build time
import OpenAIIcon from "@/assets/icons/providers/openai.svg?react";
import OpenAISvg from "@/assets/icons/providers/openai.svg?raw";

// @ts-expect-error - vite svg imports are handled at build time
import AnthropicIcon from "@/assets/icons/providers/anthropic.svg?react";
import AnthropicSvg from "@/assets/icons/providers/anthropic.svg?raw";

// @ts-expect-error - vite svg imports are handled at build time
import GeminiIcon from "@/assets/icons/providers/gemini.svg?react";
import GeminiSvg from "@/assets/icons/providers/gemini.svg?raw";

// @ts-expect-error - vite svg imports are handled at build time
import XAIIcon from "@/assets/icons/providers/xai.svg?react";
import XAISvg from "@/assets/icons/providers/xai.svg?raw";

// @ts-expect-error - vite svg imports are handled at build time
import DeepSeekIcon from "@/assets/icons/providers/deepseek.svg?react";
import DeepSeekSvg from "@/assets/icons/providers/deepseek.svg?raw";

// @ts-expect-error - vite svg imports are handled at build time
import PerplexityIcon from "@/assets/icons/providers/perplexity.svg?react";
import PerplexitySvg from "@/assets/icons/providers/perplexity.svg?raw";

export const PROVIDER_CONFIGURATIONS: Record<ProviderId, Provider> = {
  openai: {
    id: "openai",
    label: "OpenAI",
    Icon: OpenAIIcon,
    iconSvg: OpenAISvg,
    apiKeyUrl: "https://platform.openai.com/account/api-keys",
    color: [203, 213, 225], // slate-200  (#e5e7eb)
  },

  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    Icon: AnthropicIcon,
    iconSvg: AnthropicSvg,
    apiKeyUrl: "https://console.anthropic.com/dashboard",
    color: [252, 211, 77], // amber-300 (#FCD34D)
  },

  gemini: {
    id: "gemini",
    label: "Gemini",
    Icon: GeminiIcon,
    iconSvg: GeminiSvg,
    apiKeyUrl: "https://aistudio.google.com/app/apikey",
    color: [253, 164, 175], // rose-300 (#FDA4AF)
  },

  xai: {
    id: "xai",
    label: "xAI",
    Icon: XAIIcon,
    iconSvg: XAISvg,
    apiKeyUrl: "https://console.x.ai/",
    color: [148, 163, 184], // slate-400 (#94A3B8)
  },

  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    Icon: DeepSeekIcon,
    iconSvg: DeepSeekSvg,
    apiKeyUrl: "https://platform.deepseek.com/api_keys",
    color: [147, 197, 253], // blue-300 (#93c5fd)
  },

  perplexity: {
    id: "perplexity",
    label: "Perplexity",
    Icon: PerplexityIcon,
    iconSvg: PerplexitySvg,
    apiKeyUrl: "https://docs.perplexity.ai/guides/api-key-management",
    color: [110, 231, 183], // emerald-300 (#6ee7b7)
  },
};
