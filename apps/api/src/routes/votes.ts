import type { FastifyPluginAsync } from "fastify";
import { prisma } from "../prisma.js";
import {
  getVotesQuerySchema,
  providerModelVoteCreateSchema,
  type ProviderModelVoteResponse,
  providerModelVoteResponseSchema,
} from "../schemas/votes.js";
import { RECENT_VOTES_LIMIT } from "@chatwar/shared";

// restrict the limit to > 0 and <= RECENT_VOTES_LIMIT
function clampLimit(limit: number | undefined) {
  const limitValue = limit ?? RECENT_VOTES_LIMIT;
  return Math.min(Math.max(limitValue, 1), RECENT_VOTES_LIMIT);
}

// converts a row of vote data into a vote response
function toVoteResponse(row: {
  id: string;
  winnerProviderId: string;
  winnerModelId: string;
  winnerModelLabel: string;
  competitors: unknown;
  message: string;
  createdAt: Date;
  latitude: number | null;
  longitude: number | null;
}): ProviderModelVoteResponse {
  const vote = {
    id: row.id,
    winnerProviderId: row.winnerProviderId,
    winnerModelId: row.winnerModelId,
    winnerModelLabel: row.winnerModelLabel,
    competitors: row.competitors,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };
  const parsed = providerModelVoteResponseSchema.safeParse(vote);
  if (!parsed.success) {
    throw new Error(`Invalid ProviderModelVoteResponse: ${parsed.error.message}`);
  }
  return parsed.data;
}

export const votesRoutes: FastifyPluginAsync = async (app) => {
  // GET /v1/provider-votes?limit=100
  app.get("/v1/provider-votes", async (request, reply) => {
    // parse the votes query
    const votesQuery = getVotesQuerySchema.safeParse(request.query);
    if (!votesQuery.success) {
      return reply.status(400).send({ code: "BAD_REQUEST", message: "Invalid query params" });
    }

    // query for the latest votes
    const limit = clampLimit(votesQuery.data.limit);
    const rows = await prisma.providerVote.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    // return the votes response
    const votes = rows.map((row) =>
      toVoteResponse({
        id: row.id,
        winnerProviderId: row.winnerProviderId,
        winnerModelId: row.winnerModelId,
        winnerModelLabel: row.winnerModelLabel,
        competitors: row.competitors,
        message: row.message,
        createdAt: row.createdAt,
        latitude: row.latitude,
        longitude: row.longitude,
      }),
    );
    return reply.status(200).send(votes);
  });

  // POST /v1/provider-votes
  app.post("/v1/provider-votes", async (request, reply) => {
    // parse the vote body
    const voteBody = providerModelVoteCreateSchema.safeParse(request.body);
    if (!voteBody.success) {
      return reply.status(400).send({
        code: "BAD_REQUEST",
        message: "Missing or invalid vote payload",
        issues: voteBody.error.issues,
      });
    }

    // hydrate the server fields
    const body = voteBody.data;
    const createdAt = body.createdAt ?? new Date();
    const latitude = typeof body.latitude === "number" ? body.latitude : undefined;
    const longitude = typeof body.longitude === "number" ? body.longitude : undefined;

    // save the vote data
    const voteCreated = await prisma.providerVote.create({
      data: {
        winnerProviderId: body.winnerProviderId,
        winnerModelId: body.winnerModelId,
        winnerModelLabel: body.winnerModelLabel,
        competitors: body.competitors,
        message: body.message,
        createdAt,
        latitude,
        longitude,
      },
    });

    // return the new vote
    return reply.status(201).send(
      toVoteResponse({
        id: voteCreated.id,
        winnerProviderId: voteCreated.winnerProviderId,
        winnerModelId: voteCreated.winnerModelId,
        winnerModelLabel: voteCreated.winnerModelLabel,
        competitors: voteCreated.competitors,
        message: voteCreated.message,
        createdAt: voteCreated.createdAt,
        latitude: voteCreated.latitude,
        longitude: voteCreated.longitude,
      }),
    );
  });
};
