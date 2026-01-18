import { z } from "zod";

import { chatParamsSchema, chatRequestSchema } from "../schemas/chat";

export type ChatParams = z.infer<typeof chatParamsSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
