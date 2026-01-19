import {
  type ProviderId,
  type ProviderModelVoteCreate,
  type ProviderModelVoteResponse,
  RECENT_VOTES_LIMIT,
} from "@chatwar/shared";
import { fetchJson } from "@/api/client";

/**
 * GET /v1/provider-votes
 * Used by AnalyticsProvider
 */
export async function getProviderVotes({
  limit = RECENT_VOTES_LIMIT,
  signal,
}: {
  limit?: number;
  signal?: AbortSignal;
}): Promise<ProviderModelVoteResponse[]> {
  // set the limit to the lower of the passed in limit and the max limit
  // enforce the same limit on the api side
  const params = new URLSearchParams();
  limit = Math.floor(limit > 0 ? limit : RECENT_VOTES_LIMIT);
  params.set("limit", String(Math.min(limit, RECENT_VOTES_LIMIT)));
  const query = params.toString();

  // fetch the votes
  return fetchJson<ProviderModelVoteResponse[]>(
    `/v1/provider-votes${query ? `?${query}` : ""}`,
    { method: "GET" },
    { signal },
  );
}

/**
 * POST /v1/provider-votes
 * Used by ChatProvider
 */
export async function createProviderVote(args: {
  winnerProviderId: ProviderId;
  winnerModelId: string;
  winnerModelLabel: string;
  competitors: ProviderModelVoteCreate["competitors"];
  message: string;
  signal?: AbortSignal;
}): Promise<ProviderModelVoteCreate> {
  return fetchJson<ProviderModelVoteCreate>(
    "/v1/provider-votes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        winnerProviderId: args.winnerProviderId,
        winnerModelId: args.winnerModelId,
        winnerModelLabel: args.winnerModelLabel,
        competitors: args.competitors,
        message: args.message,
      }),
    },
    { signal: args.signal },
  );
}
