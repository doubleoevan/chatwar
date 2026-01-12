import type { ProviderModelVote } from "@chatwar/shared";

// helper
function toHoursAgoDate(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export const PROVIDER_VOTES: ProviderModelVote[] = [
  // openai
  {
    winnerProviderId: "openai",
    winnerModelId: "gpt-4o-mini",
    winnerModelLabel: "GPT-4o mini",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
      { providerId: "anthropic", modelId: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet" },
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
    ],
    message: "Explain Temporal vs cron in simple terms.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(2),
  },
  {
    winnerProviderId: "openai",
    winnerModelId: "gpt-4o",
    winnerModelLabel: "GPT-4o",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
      { providerId: "perplexity", modelId: "pplx-70b", modelLabel: "Perplexity 70B" },
    ],
    message: "Summarize the pros and cons of server-side rendering.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(18),
  },
  {
    winnerProviderId: "openai",
    winnerModelId: "gpt-4o-mini",
    winnerModelLabel: "GPT-4o mini",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
      { providerId: "xai", modelId: "grok-2", modelLabel: "Grok 2" },
    ],
    message: "Generate a SQL query to find duplicate rows.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(36),
  },

  // anthropic
  {
    winnerProviderId: "anthropic",
    winnerModelId: "claude-3-5-sonnet",
    winnerModelLabel: "Claude 3.5 Sonnet",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
      { providerId: "anthropic", modelId: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet" },
    ],
    message: "Write a commit message for analytics layout.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(26),
  },
  {
    winnerProviderId: "anthropic",
    winnerModelId: "claude-3-opus",
    winnerModelLabel: "Claude 3 Opus",
    competitors: [
      { providerId: "anthropic", modelId: "claude-3-opus", modelLabel: "Claude 3 Opus" },
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
    ],
    message: "Rewrite this paragraph to be more concise.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(52),
  },

  // gemini
  {
    winnerProviderId: "gemini",
    winnerModelId: "gemini-1.5-pro",
    winnerModelLabel: "Gemini 1.5 Pro",
    competitors: [
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
    ],
    message: "Explain how transformers work at a high level.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(74),
  },

  // xai
  {
    winnerProviderId: "xai",
    winnerModelId: "grok-2",
    winnerModelLabel: "Grok 2",
    competitors: [
      { providerId: "xai", modelId: "grok-2", modelLabel: "Grok 2" },
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
    ],
    message: "Give a sarcastic explanation of blockchain.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(90),
  },

  // deepseek
  {
    winnerProviderId: "deepseek",
    winnerModelId: "deepseek-coder",
    winnerModelLabel: "DeepSeek Coder",
    competitors: [
      { providerId: "deepseek", modelId: "deepseek-coder", modelLabel: "DeepSeek Coder" },
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
    ],
    message: "Convert this Python function to TypeScript.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(110),
  },

  // perplexity
  {
    winnerProviderId: "perplexity",
    winnerModelId: "pplx-70b",
    winnerModelLabel: "Perplexity 70B",
    competitors: [
      { providerId: "perplexity", modelId: "pplx-70b", modelLabel: "Perplexity 70B" },
      { providerId: "anthropic", modelId: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet" },
    ],
    message: "Find sources for recent AI regulation changes.",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: toHoursAgoDate(132),
  },
];
