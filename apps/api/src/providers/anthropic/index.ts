import type { ProviderAdapter } from "../types";
import { getAnthropicModels } from "./client";
import { normalizeAnthropicModels } from "./adapters";

export const anthropicAdapter: ProviderAdapter = {
  id: "anthropic",
  async getModels({ apiKey, providerId }) {
    const payload = await getAnthropicModels({ apiKey });
    return normalizeAnthropicModels({ providerId, payload });
  },
};
