import type { AnthropicModel, GetAnthropicModelsResponse } from "./client";
import type { Model, ProviderId, ProviderModels } from "@chatwar/shared";

const LIMIT_MODELS = 6; // limit the number of models to show

// returns the family ID for a model ID
function toFamilyId(modelId: string): string {
  if (modelId.includes("opus")) {
    return "opus";
  }
  if (modelId.includes("sonnet")) {
    return "sonnet";
  }
  if (modelId.includes("haiku")) {
    return "haiku";
  }
  return modelId;
}

export function normalizeAnthropicModels(args: {
  providerId: ProviderId;
  payload: GetAnthropicModelsResponse;
}): ProviderModels {
  // sort newest models first
  const responseModels = [...args.payload.data];
  const newestModels = responseModels.sort(
    (firstModel, secondModel) =>
      Date.parse(secondModel.created_at) - Date.parse(firstModel.created_at),
  );

  // choose the newest model per family
  const familyModels = new Map<string, AnthropicModel>();
  for (const model of newestModels) {
    const family = toFamilyId(model.id);
    if (!familyModels.has(family)) {
      familyModels.set(family, model);
    }
  }

  // convert the top Anthropic models into Chatwar models
  const topModels = [...familyModels.values()].slice(0, LIMIT_MODELS);
  const models: Model[] = topModels.map((model) => ({
    id: model.id,
    label: model.display_name,
    capabilities: { streaming: true },
  }));

  // set the default model and return the models response
  const defaultModelId = models[0]?.id;
  return {
    providerId: args.providerId,
    defaultModelId,
    models,
  };
}
