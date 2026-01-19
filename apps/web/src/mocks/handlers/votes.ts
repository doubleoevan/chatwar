import { http, HttpResponse } from "msw";
import type {
  ProviderId,
  ProviderModelVoteCreate,
  ProviderModelVoteResponse,
} from "@chatwar/shared";
import { PROVIDERS, RECENT_VOTES_LIMIT } from "@chatwar/shared";
import { withLatency } from "@/mocks/utils/withLatency";
import { PROVIDER_VOTES } from "@/mocks/data/providerVotes";

const votes: ProviderModelVoteResponse[] = [...PROVIDER_VOTES]; // local state for testing

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProviderId(value: unknown): value is ProviderId {
  return typeof value === "string" && PROVIDERS.includes(value as ProviderId);
}

function validateVoteBody(body: unknown): body is ProviderModelVoteCreate {
  if (!body || typeof body !== "object") {
    return false;
  }
  const voteBody = body as Partial<ProviderModelVoteCreate>;
  return (
    isProviderId(voteBody.winnerProviderId) &&
    isNonEmptyString(voteBody.winnerModelId) &&
    isNonEmptyString(voteBody.winnerModelLabel) &&
    isNonEmptyString(voteBody.message) &&
    Array.isArray(voteBody.competitors) &&
    voteBody.competitors.length > 0 &&
    voteBody.competitors.every(
      (competitor) =>
        competitor &&
        typeof competitor === "object" &&
        isProviderId(competitor.providerId) &&
        isNonEmptyString(competitor.modelId) &&
        isNonEmptyString(competitor.modelLabel),
    )
  );
}

export const voteHandlers = [
  // POST /v1/provider-votes
  http.post("/v1/provider-votes", async ({ request }) =>
    withLatency(async () => {
      // validate the vote request body
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return HttpResponse.json(
          { code: "BAD_REQUEST", message: "Invalid JSON body" },
          { status: 400 },
        );
      }
      if (!validateVoteBody(body)) {
        return HttpResponse.json(
          { code: "BAD_REQUEST", message: "Missing or invalid vote payload" },
          { status: 400 },
        );
      }

      // hydrate server-side fields
      const voteBody: ProviderModelVoteResponse = {
        ...body,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        latitude: body.latitude ?? Math.random() * 180 - 90,
        longitude: body.longitude ?? Math.random() * 360 - 180,
      };

      // return the votes with the new one added
      votes.unshift(voteBody);
      votes.splice(RECENT_VOTES_LIMIT);
      return HttpResponse.json(votes, { status: 201 });
    }),
  ),

  // GET /v1/provider-votes
  http.get("/v1/provider-votes", async ({ request }) =>
    withLatency(async () => {
      // sort the results by created at time
      const results = [...votes].sort((first, second) => {
        const firstCreatedAt = first.createdAt ?? "";
        const secondCreatedAt = second.createdAt ?? "";
        return firstCreatedAt < secondCreatedAt ? 1 : -1;
      });

      // slice the results by the limit
      const url = new URL(request.url);
      const limitNumber = Number(url.searchParams.get("limit"));
      const limit = Math.floor(limitNumber > 0 ? limitNumber : RECENT_VOTES_LIMIT);
      const limitResults = results.slice(0, Math.min(limit, RECENT_VOTES_LIMIT));
      return HttpResponse.json(limitResults, { status: 200 });
    }),
  ),
];
