import type { GetDeepseekModelsResponse } from "./client";
import type { Model, ProviderId, ProviderModels } from "@chatwar/shared";

const LIMIT_MODELS = 6; // limit the number of models to show

// converts a DeepSeek model ID into a human-readable label
// e.g., "deepseek-chat" -> "Deepseek Chat"
function toLabel(modelId: string): string {
  return modelId
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (firstLetter) => firstLetter.toUpperCase());
}

export function normalizeDeepseekModels(args: {
  providerId: ProviderId;
  payload: GetDeepseekModelsResponse;
}): ProviderModels {
  // convert the DeepSeek models into Chatwar models
  const requestModels = [...args.payload.data];
  const models: Model[] = requestModels
    .map((model) => ({
      id: model.id,
      label: toLabel(model.id),
      capabilities: { streaming: true },
    }))
    .slice(0, LIMIT_MODELS);

  // set the default model and return the models response
  const defaultModelId = models[0]?.id;
  return {
    providerId: args.providerId,
    defaultModelId,
    models,
  };
}
