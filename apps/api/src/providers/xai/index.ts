import type { ProviderAdapter } from "../types";
import { createXAIChatStream, getXAIModels } from "./client";
import { normalizeXAIModels } from "./adapters";
import { streamChatCompletions } from "../common/chat";

export const xaiAdapter: ProviderAdapter = {
  id: "xai",

  async getModels({ apiKey, providerId }) {
    const payload = await getXAIModels({ apiKey });
    return normalizeXAIModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, message, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createXAIChatStream({ apiKey, modelId, message, signal });
      yield* streamChatCompletions(response);
    }
    return stream();
  },
};
