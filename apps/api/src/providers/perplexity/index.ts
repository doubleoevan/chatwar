import type { ProviderAdapter } from "../types";
import { createPerplexityChatStream, getPerplexityModels } from "./client";
import { normalizePerplexityModels } from "./adapters";
import { streamChatCompletions } from "../common/chat";

export const perplexityAdapter: ProviderAdapter = {
  id: "perplexity",

  async getModels({ apiKey, providerId }) {
    const payload = await getPerplexityModels({ apiKey });
    return normalizePerplexityModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, message, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createPerplexityChatStream({ apiKey, modelId, message, signal });
      yield* streamChatCompletions(response);
    }
    return stream();
  },
};
