import { z } from "zod";

import {
  getProviderModelsParamsSchema,
  modelSchema,
  providerModelsSchema,
} from "../schemas/models";

export type GetProviderModelsParams = z.infer<typeof getProviderModelsParamsSchema>;
export type Model = z.infer<typeof modelSchema>;
export type ProviderModels = z.infer<typeof providerModelsSchema>;
