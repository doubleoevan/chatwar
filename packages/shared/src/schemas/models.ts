import { z } from "zod";

import { NonEmptyString, providerIdSchema } from "./common";

export const modelSchema = z.object({
  /** provider model id verbatim */
  id: NonEmptyString,

  /** readable label for display */
  label: NonEmptyString,

  /** optional metadata for analytics */
  contextWindow: z.number().int().positive().optional(),
  inputCostPer1M: z.number().nonnegative().optional(),
  outputCostPer1M: z.number().nonnegative().optional(),

  capabilities: z
    .object({
      vision: z.boolean().optional(),
      tools: z.boolean().optional(),
      streaming: z.boolean().optional(),
    })
    .optional(),
});

export const providerModelsSchema = z.object({
  providerId: providerIdSchema,
  models: z.array(modelSchema),
  defaultModelId: NonEmptyString,
});

export const getProviderModelsParamsSchema = z.object({
  providerId: providerIdSchema,
});
