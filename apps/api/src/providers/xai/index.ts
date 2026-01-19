import type { ProviderAdapter } from "../types";
import { createXAIChatStream, getXAIModels } from "./client";
import { normalizeXAIModels } from "./adapters";
import { streamChatDeltas } from "../common/chat";

export const xaiAdapter: ProviderAdapter = {
  id: "xai",

  async getModels({ apiKey, providerId }) {
    const payload = await getXAIModels({ apiKey });
    return normalizeXAIModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, messages, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createXAIChatStream({ apiKey, modelId, messages, signal });
      yield* streamChatDeltas(response);
    }
    return stream();
  },
};
