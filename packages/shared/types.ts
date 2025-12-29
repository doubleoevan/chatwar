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

export type Provider = {
  id: ProviderId;
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

export type ProviderModel = {
  providerId: ProviderId;
  modelId: string;
};

export type ProviderResponse = {
  providerId: ProviderId;
  modelId: string;

  /** The actual LLM output */
  text: string;

  /** Timing / usage metadata (best-effort) */
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;

  /** Present if the provider failed */
  error?: {
    code: string;
    message: string;
    retryable?: boolean;
  };
};

/* Chats */
export type ChatRequest = {
  prompt: string;

  /** Which providers + models to compare */
  providerModels: ProviderModel[];

  /**
   * BYOK — keys sent per request only.
   * Backend must never store or log these.
   */
  keys: Partial<Record<ProviderId, string>>;

  /** Safety / cost controls */
  maxOutputTokens?: number;
  temperature?: number;
};

export type ChatResponse = {
  /** Optional until DB is wired */
  promptId?: string;
  responses: ProviderResponse[];
};

/* Votes */
export type VoteRequest = {
  promptId: string;
  winner: ProviderModel;
  losers: ProviderModel[];

  /** Optional qualitative tags */
  tags?: string[];
};

export type VoteResponse = {
  ok: true;
};

export type RecentVote = {
  promptId: string;
  winnerProviderId: ProviderId;
  winnerModelId: string;
  createdAt: string; // ISO 8601
};

/* Stats */
export type StatsResponse = {
  totalVotes: number;
  providerStats: ProviderStats[];
  modelStats: ProviderStats[];
  recentVotes: RecentVote[];
};

export type ProviderStats = {
  providerId: ProviderId;
  modelId?: string;
  wins: number;
  losses: number;
  winRate: number; // 0..1
  selectionRate?: number; // 0..1
};
