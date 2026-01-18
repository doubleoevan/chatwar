import type { ProviderAdapter } from "../types";
import { createAnthropicChatStream, getAnthropicModels } from "./client";
import { normalizeAnthropicModels } from "./adapters";
import { streamAnthropicChat } from "./chat";

export const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",

  async getModels({ apiKey, providerId }) {
    const payload = await getAnthropicModels({ apiKey });
    return normalizeAnthropicModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, message, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createAnthropicChatStream({ apiKey, modelId, message, signal });
      yield* streamAnthropicChat(response);
    }
    return stream();
  },
};
