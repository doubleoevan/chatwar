import { z } from "zod";
import { PROVIDERS } from "@chatwar/shared";

/**
 * Matches:
 * export const PROVIDERS = [...] as const;
 * export type ProviderId = (typeof PROVIDERS)[number];
 */
export const providerIdSchema = z.enum(PROVIDERS);

const NonEmptyString = z.string().trim().min(1);

export const competitorSchema = z.object({
  providerId: providerIdSchema,
  modelId: NonEmptyString,
  modelLabel: NonEmptyString,
});

/**
 * What client POSTs when voting for a winner
 */
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

/**
 * Internal representation (API → DB)
 */
export type ProviderModelVoteCreate = z.infer<typeof providerModelVoteCreateSchema>;

/**
 * What API returns to the client
 */
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

export type ProviderModelVoteResponse = z.infer<typeof providerModelVoteResponseSchema>;

export const getVotesQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((value) => {
      const number = Number(value);
      return Number.isFinite(number) && number > 0 ? Math.floor(number) : undefined;
    }),
});
