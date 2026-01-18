import type { ProviderAdapter } from "../types";
import { getXAIModels } from "./client";
import { normalizeXAIModels } from "./adapters";

export const xaiAdapter: ProviderAdapter = {
  id: "xai",
  async getModels({ apiKey, providerId }) {
    const payload = await getXAIModels({ apiKey });
    return normalizeXAIModels({ providerId, payload });
  },
};
