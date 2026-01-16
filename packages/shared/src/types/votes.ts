import { z } from "zod";

import { providerModelVoteCreateSchema, providerModelVoteResponseSchema } from "../schemas/votes";

export type ProviderModelVoteCreate = z.infer<typeof providerModelVoteCreateSchema>;
export type ProviderModelVoteResponse = z.infer<typeof providerModelVoteResponseSchema>;
