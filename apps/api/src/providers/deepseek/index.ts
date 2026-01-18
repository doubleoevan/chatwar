import type { ProviderAdapter } from "../types";
import { createDeepseekChatStream, getDeepseekModels } from "./client";
import { normalizeDeepseekModels } from "./adapters";
import { streamChatDeltas } from "../common/chat";

export const deepseekAdapter: ProviderAdapter = {
  id: "deepseek",

  async getModels({ apiKey, providerId }) {
    const payload = await getDeepseekModels({ apiKey });
    return normalizeDeepseekModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, message, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createDeepseekChatStream({ apiKey, modelId, message, signal });
      yield* streamChatDeltas(response);
    }
    return stream();
  },
};
