import type { ProviderAdapter } from "../types";
import { getPerplexityModels } from "./client";
import { normalizePerplexityModels } from "./adapters";

export const perplexityAdapter: ProviderAdapter = {
  id: "perplexity",
  async getModels({ apiKey, providerId }) {
    const payload = await getPerplexityModels({ apiKey });
    return normalizePerplexityModels({ providerId, payload });
  },
};
