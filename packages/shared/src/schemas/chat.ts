import { z } from "zod";

import { NonEmptyString, providerIdSchema } from "./common";

export const chatParamsSchema = z.object({
  providerId: providerIdSchema,
});

export const chatRequestSchema = z.object({
  modelId: NonEmptyString,
  message: NonEmptyString,
});

// Each streamed line is one JSON object
export const chatStreamChunkSchema = z.object({
  chunk: z.string(),
});

// Optional final “done” line (nice for clients)
export const chatStreamDoneSchema = z.object({
  done: z.literal(true),
});
