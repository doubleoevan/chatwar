import { subHours } from "date-fns";
import type { ProviderModelVoteResponse } from "@chatwar/shared";

export const PROVIDER_VOTES: ProviderModelVoteResponse[] = [
  // openai — San Francisco (SoMa)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "openai",
    winnerModelId: "gpt-4o",
    winnerModelLabel: "GPT-4o",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
      { providerId: "anthropic", modelId: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet" },
    ],
    message:
      "Explain the difference between Temporal workflows and traditional cron jobs, including retries, state management, and failure handling.",
    latitude: 37.7786,
    longitude: -122.4059,
    createdAt: subHours(new Date(), 6).toISOString(),
  },

  // openai — San Francisco (Mission)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "openai",
    winnerModelId: "gpt-4o-mini",
    winnerModelLabel: "GPT-4o mini",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
    ],
    message:
      "Generate a SQL query that finds duplicate rows based on multiple columns and explains why those duplicates exist.",
    latitude: 37.7599,
    longitude: -122.4148,
    createdAt: subHours(new Date(), 14).toISOString(),
  },

  // openai — Oakland
  {
    id: crypto.randomUUID(),
    winnerProviderId: "openai",
    winnerModelId: "gpt-4o",
    winnerModelLabel: "GPT-4o",
    competitors: [
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
      { providerId: "perplexity", modelId: "pplx-70b", modelLabel: "Perplexity 70B" },
    ],
    message:
      "Summarize the pros and cons of server-side rendering versus client-side rendering, focusing on performance, SEO, and developer experience.",
    latitude: 37.8044,
    longitude: -122.2712,
    createdAt: subHours(new Date(), 22).toISOString(),
  },

  // anthropic — New York City (Midtown)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "anthropic",
    winnerModelId: "claude-3-5-sonnet",
    winnerModelLabel: "Claude 3.5 Sonnet",
    competitors: [
      { providerId: "anthropic", modelId: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet" },
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
    ],
    message:
      "Rewrite this commit message to clearly describe an analytics layout refactor while keeping it concise and professional.",
    latitude: 40.7549,
    longitude: -73.984,
    createdAt: subHours(new Date(), 30).toISOString(),
  },

  // anthropic — Brooklyn
  {
    id: crypto.randomUUID(),
    winnerProviderId: "anthropic",
    winnerModelId: "claude-3-opus",
    winnerModelLabel: "Claude 3 Opus",
    competitors: [
      { providerId: "anthropic", modelId: "claude-3-opus", modelLabel: "Claude 3 Opus" },
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
    ],
    message:
      "Rewrite this paragraph to be more concise while preserving tone, intent, and technical accuracy.",
    latitude: 40.6782,
    longitude: -73.9442,
    createdAt: subHours(new Date(), 60).toISOString(),
  },

  // gemini — Austin (Downtown)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "gemini",
    winnerModelId: "gemini-1.5-pro",
    winnerModelLabel: "Gemini 1.5 Pro",
    competitors: [
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
    ],
    message:
      "Explain how transformer models work at a high level, including attention mechanisms and why they scale well.",
    latitude: 30.2672,
    longitude: -97.7431,
    createdAt: subHours(new Date(), 80).toISOString(),
  },

  // gemini — Austin (East Side)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "gemini",
    winnerModelId: "gemini-1.5-pro",
    winnerModelLabel: "Gemini 1.5 Pro",
    competitors: [
      { providerId: "gemini", modelId: "gemini-1.5-pro", modelLabel: "Gemini 1.5 Pro" },
      { providerId: "anthropic", modelId: "claude-3-5-sonnet", modelLabel: "Claude 3.5 Sonnet" },
    ],
    message:
      "Explain the difference between synchronous and asynchronous rendering in modern frontend frameworks.",
    latitude: 30.2553,
    longitude: -97.7115,
    createdAt: subHours(new Date(), 92).toISOString(),
  },

  // xai — Seattle (South Lake Union)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "xai",
    winnerModelId: "grok-2",
    winnerModelLabel: "Grok 2",
    competitors: [
      { providerId: "xai", modelId: "grok-2", modelLabel: "Grok 2" },
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
    ],
    message:
      "Give a sarcastic explanation of blockchain technology, highlighting hype, buzzwords, and real-world tradeoffs.",
    latitude: 47.6231,
    longitude: -122.3386,
    createdAt: subHours(new Date(), 100).toISOString(),
  },

  // deepseek — San Jose
  {
    id: crypto.randomUUID(),
    winnerProviderId: "deepseek",
    winnerModelId: "deepseek-coder",
    winnerModelLabel: "DeepSeek Coder",
    competitors: [
      { providerId: "deepseek", modelId: "deepseek-coder", modelLabel: "DeepSeek Coder" },
      { providerId: "openai", modelId: "gpt-4o", modelLabel: "GPT-4o" },
    ],
    message:
      "Convert this Python function to TypeScript, explaining how types improve safety and readability.",
    latitude: 37.3382,
    longitude: -121.8863,
    createdAt: subHours(new Date(), 120).toISOString(),
  },

  // perplexity — New York City (Lower Manhattan)
  {
    id: crypto.randomUUID(),
    winnerProviderId: "perplexity",
    winnerModelId: "pplx-70b",
    winnerModelLabel: "Perplexity 70B",
    competitors: [
      { providerId: "perplexity", modelId: "pplx-70b", modelLabel: "Perplexity 70B" },
      { providerId: "openai", modelId: "gpt-4o-mini", modelLabel: "GPT-4o mini" },
    ],
    message:
      "Find sources for recent AI regulation changes and summarize how they impact model training and deployment.",
    latitude: 40.7075,
    longitude: -74.0113,
    createdAt: subHours(new Date(), 144).toISOString(),
  },
];
