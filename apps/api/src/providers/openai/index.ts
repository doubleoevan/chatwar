import type { ProviderAdapter } from "../types";
import { getOpenAIModels } from "./client";
import { normalizeOpenAIModels } from "./adapters";

export const openaiAdapter: ProviderAdapter = {
  id: "openai",
  async getModels({ apiKey, providerId }) {
    const payload = await getOpenAIModels({ apiKey });
    return normalizeOpenAIModels({ providerId, payload });
  },
};
