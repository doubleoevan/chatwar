import { GetXAIModelsResponse, XAIModel } from "./client";
import type { Model, ProviderId, ProviderModels } from "@chatwar/shared";

// use model ID tokens to convert to label names
const WORD_NAME: Record<string, string> = {
  grok: "Grok",
  xai: "xAI",
  ai: "AI",
};
const LIMIT_MODELS = 6; // limit the number of models to show

// filters out non-chat models
function toChatModels(models: XAIModel[]) {
  return models.filter((model) => {
    const modelId = model.id.toLowerCase();
    if (modelId.includes("image")) {
      return false;
    }
    if (modelId.includes("vision")) {
      return false;
    }
    if (modelId.includes("code")) {
      return false;
    }
    return !modelId.includes("embedding");
  });
}

// converts an xAI model ID into a human-readable label
function toLabel(modelId: string): string {
  // "grok-3-fast-reasoning" -> "Grok 3 Fast Reasoning"
  const label = modelId
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      const name = WORD_NAME[word.toLowerCase()];
      if (name) {
        return name;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");

  // Special-case "Grok 4 1" -> "Grok 4.1" (also works for Grok 5 2, etc.)
  return label.replace(/\b(Grok)\s+(\d+)\s+(\d+)\b/g, "$1 $2.$3");
}

// returns the major version of an xAI model ID
function toMajorVersion(modelId: string): number {
  const version = modelId.toLowerCase().match(/\bgrok-(\d+)\b/);
  if (!version) {
    return -1;
  }
  return Number.parseInt(version[1]!, 10);
}

// returns the minor version of an xAI model ID
function toMinorVersion(modelId: string): number {
  const version = modelId.toLowerCase().match(/\bgrok-\d+-(\d+)\b/);
  if (!version) {
    return 0;
  }
  const versionNumber = Number.parseInt(version[1]!, 10);
  return versionNumber <= 20 ? versionNumber : 0;
}

// returns if the model ID contains a token
function hasToken(modelId: string, token: string): boolean {
  return modelId.toLowerCase().includes(token);
}

// returns a score to sort an xAI model based on its features and capabilities
function rankModel(model: XAIModel): number {
  // 1) Score by major version
  const modelId = model.id;
  const major = toMajorVersion(modelId);
  const majorScore = Math.max(major, 0) * 1_000_000;

  // 2) Score by minor version
  const minor = toMinorVersion(modelId);
  const minorScore = minor * 10_000;

  // 3) Score by reasoning label
  const reasoningScore = hasToken(modelId, "reason") && !hasToken(modelId, "non") ? 1_000 : 0;

  // 4) Score by fast label
  const fastScore = hasToken(modelId, "fast") ? 100 : 0;
  return majorScore + minorScore + reasoningScore + fastScore;
}

export function normalizeXAIModels(args: {
  providerId: ProviderId;
  payload: GetXAIModelsResponse;
}): ProviderModels {
  // filter response models to chat models
  const responseModels = [...args.payload.data];
  const chatModels = toChatModels(responseModels);

  // convert the most recent xAI models into Chatwar models
  const topModels = chatModels
    .sort(
      (firstModel, secondModel) =>
        rankModel(secondModel) - rankModel(firstModel) ||
        secondModel.id.localeCompare(firstModel.id),
    )
    .slice(0, LIMIT_MODELS);
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
