import { z } from "zod";

import { PROVIDERS } from "../types/providers";

export const providerIdSchema = z.enum(PROVIDERS);

const NonEmptyString = z.string().trim().min(1);

export const competitorSchema = z.object({
  providerId: providerIdSchema,
  modelId: NonEmptyString,
  modelLabel: NonEmptyString,
});

export const providerModelVoteCreateSchema = z.object({
  winnerProviderId: providerIdSchema,
  winnerModelId: NonEmptyString,
  winnerModelLabel: NonEmptyString,
  competitors: z.array(competitorSchema).min(1),
  message: NonEmptyString,
  createdAt: z.coerce.date().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const providerModelVoteResponseSchema = z.object({
  id: z.string(),
  winnerProviderId: providerIdSchema,
  winnerModelId: NonEmptyString,
  winnerModelLabel: NonEmptyString,
  competitors: z.array(competitorSchema),
  message: NonEmptyString,
  createdAt: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const getVotesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((value) => {
      const number = Number(value);
      return Number.isFinite(number) && number > 0 ? Math.floor(number) : undefined;
    }),
});
