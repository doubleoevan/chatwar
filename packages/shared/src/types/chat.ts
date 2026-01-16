import { z } from "zod";

import {
  chatParamsSchema,
  chatRequestSchema,
  chatStreamChunkSchema,
  chatStreamDoneSchema,
} from "../schemas/chat";

export type ChatParams = z.infer<typeof chatParamsSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type ChatStreamChunk = z.infer<typeof chatStreamChunkSchema>;
export type ChatStreamDone = z.infer<typeof chatStreamDoneSchema>;
