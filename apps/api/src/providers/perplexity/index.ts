import type { ProviderAdapter } from "../types";
import { createPerplexityChatStream, getPerplexityModels } from "./client";
import { normalizePerplexityModels } from "./adapters";
import { streamChatDeltas } from "../common/chat";

export const perplexityAdapter: ProviderAdapter = {
  id: "perplexity",

  async getModels({ apiKey, providerId }) {
    const payload = await getPerplexityModels({ apiKey });
    return normalizePerplexityModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, messages, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createPerplexityChatStream({ apiKey, modelId, messages, signal });
      yield* streamChatDeltas(response);
    }
    return stream();
  },
};
