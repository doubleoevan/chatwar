import type { ProviderAdapter } from "../types";
import { createGeminiChatStream, getGeminiModels } from "./client";
import { normalizeGeminiModels } from "./adapters";
import { streamGeminiChat } from "./chat";

export const geminiAdapter: ProviderAdapter = {
  id: "gemini",

  async getModels({ apiKey, providerId }) {
    const payload = await getGeminiModels({ apiKey });
    return normalizeGeminiModels({ providerId, payload });
  },

  streamChat({ apiKey, modelId, messages, signal }) {
    async function* stream(): AsyncIterable<string> {
      const response = await createGeminiChatStream({ apiKey, modelId, messages, signal });
      yield* streamGeminiChat(response);
    }
    return stream();
  },
};
