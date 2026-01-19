import { z } from "zod";

import { apiErrorSchema, NonEmptyString, providerIdSchema } from "./common";

export const chatParamsSchema = z.object({
  providerId: providerIdSchema,
});

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "error"]),
  content: NonEmptyString,
});

export const chatRequestSchema = z.object({
  modelId: NonEmptyString,
  messages: z.array(chatMessageSchema).min(1),
});

// chunk sent as a stream
export const chatStreamChunkSchema = z.object({
  chunk: z.string(),
});

// final chunk sent after stream is closed
export const chatStreamDoneSchema = z.object({
  done: z.literal(true),
});

// error chunk sent during stream
export const chatStreamErrorSchema = z.object({
  error: apiErrorSchema,
});
