import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "../prisma.js";
import {
  getVotesQuerySchema,
  providerModelVoteCreateSchema,
  providerModelVoteResponseSchema,
  RECENT_VOTES_LIMIT,
} from "@chatwar/shared";
import { getLocation } from "../lib/location";

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
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
}) {
  const vote = {
    id: row.id,
    winnerProviderId: row.winnerProviderId,
    winnerModelId: row.winnerModelId,
    winnerModelLabel: row.winnerModelLabel,
    competitors: row.competitors,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    country: row.country ?? undefined,
    region: row.region ?? undefined,
    city: row.city ?? undefined,
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
  };

  // keep to catch database shape drift
  const validVote = providerModelVoteResponseSchema.safeParse(vote);
  if (!validVote.success) {
    throw new Error(`Invalid ProviderModelVoteResponse: ${validVote.error.message}`);
  }
  return validVote.data;
}

export const votesRoutes: FastifyPluginAsyncZod = async (app) => {
  // GET /v1/provider-votes?limit=100
  app.get(
    "/v1/provider-votes",
    {
      schema: {
        tags: ["Votes"],
        summary: "Get recent provider/model votes",
        description: `Returns up to ${RECENT_VOTES_LIMIT} most recent votes.`,
        querystring: getVotesQuerySchema,
        response: {
          200: z.array(providerModelVoteResponseSchema),
        },
      },
    },
    async (request, reply) => {
      // fetch the votes data
      const limit = clampLimit(request.query.limit);
      const voteRows = await prisma.providerVote.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // return the votes response
      const votes = voteRows.map(toVoteResponse);
      return reply.status(200).send(votes);
    },
  );

  // POST /v1/provider-votes
  app.post(
    "/v1/provider-votes",
    {
      schema: {
        tags: ["Votes"],
        summary: "Create a provider/model vote",
        description: `Returns the new provider/model vote.`,
        body: providerModelVoteCreateSchema,
        response: {
          201: providerModelVoteResponseSchema,
        },
      },
    },
    async (request, reply) => {
      // hydrate fields to add to the vote
      const body = request.body;
      const createdAt = new Date();
      const location = getLocation(request);
      const { country, region, city, latitude, longitude } = location ?? {};

      // save the new vote
      const vote = await prisma.providerVote.create({
        data: {
          winnerProviderId: body.winnerProviderId,
          winnerModelId: body.winnerModelId,
          winnerModelLabel: body.winnerModelLabel,
          competitors: body.competitors,
          message: body.message,
          createdAt,
          country,
          region,
          city,
          latitude,
          longitude,
        },
      });

      // return the saved vote
      return reply.status(201).send(toVoteResponse(vote));
    },
  );
};
