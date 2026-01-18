import type { ProviderAdapter } from "../types";
import { getDeepseekModels } from "./client";
import { normalizeDeepseekModels } from "./adapters";

export const deepseekAdapter: ProviderAdapter = {
  id: "deepseek",
  async getModels({ apiKey, providerId }) {
    const payload = await getDeepseekModels({ apiKey });
    return normalizeDeepseekModels({ providerId, payload });
  },
};
