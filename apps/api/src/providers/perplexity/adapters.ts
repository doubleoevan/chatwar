import type { GetPerplexityModelsResponse, PerplexityModel } from "./client";
import type { Model, ProviderId, ProviderModels } from "@chatwar/shared";

const LIMIT_MODELS = 6;

// converts a Perplexity model ID into a human-readable label
function toLabel(modelId: string): string {
  return modelId
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// provides a rank score to sort Perplexity models
function rankModel(model: PerplexityModel): number {
  switch (model.id) {
    case "sonar-pro":
      return 400;
    case "sonar-reasoning-pro":
      return 300;
    case "sonar-deep-research":
      return 200;
    case "sonar":
      return 100;
    default:
      return 0;
  }
}

export function normalizePerplexityModels(args: {
  providerId: ProviderId;
  payload: GetPerplexityModelsResponse;
}): ProviderModels {
  // sort response models by rank
  const responseModels = [...args.payload.data].sort(
    (firstModel, secondModel) =>
      rankModel(secondModel) - rankModel(firstModel) || firstModel.id.localeCompare(secondModel.id),
  );

  // convert the Perplexity models into Chatwar models
  const topModels = responseModels.slice(0, LIMIT_MODELS);
  const models: Model[] = topModels.map((model) => ({
    id: model.id,
    label: toLabel(model.id),
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
