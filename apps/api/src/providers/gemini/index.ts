import type { ProviderAdapter } from "../types";
import { getGeminiModels } from "./client";
import { normalizeGeminiModels } from "./adapters";

export const geminiAdapter: ProviderAdapter = {
  id: "gemini",
  async getModels({ apiKey, providerId }) {
    const payload = await getGeminiModels({ apiKey });
    return normalizeGeminiModels({ providerId, payload });
  },
};
