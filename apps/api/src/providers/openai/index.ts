import type { ProviderAdapter } from "../types";
import { createOpenAIChatStream, getOpenAIModels } from "./client";
import { normalizeOpenAIModels } from "./adapters";
import { streamChatDeltas } from "../common/chat";

export const openaiAdapter: ProviderAdapter = {
  id: "openai",

  async getModels({ apiKey, providerId }) {
    const payload = await getOpenAIModels({ apiKey });
    return normalizeOpenAIModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, message, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createOpenAIChatStream({ apiKey, modelId, message, signal });
      yield* streamChatDeltas(response);
    }
    return stream();
  },
};
