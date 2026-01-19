import { z } from "zod";

import { chatMessageSchema, chatParamsSchema, chatRequestSchema } from "../schemas/chat";

export type ChatParams = z.infer<typeof chatParamsSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
