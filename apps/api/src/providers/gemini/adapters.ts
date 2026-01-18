import type { GeminiModel, GetGeminiModelsResponse } from "./client";
import type { Model, ProviderId, ProviderModels } from "@chatwar/shared";

const LIMIT_MODELS = 6; // limit the number of models to show

// strips the "models/" prefix from the model name
function toModelName(name: string): string {
  return name.replace(/^models\//, "");
}

// removes suffixes like "-001", "-latest", "-preview", "-experimental"
function toModelId(id: string): string {
  return toModelName(id)
    .toLowerCase()
    .replace(/-\d{3}$/, "") // -001
    .replace(/-latest$/, "") // -latest
    .replace(/-preview$/, "") // -preview
    .replace(/-experimental$/, ""); // -experimental
}

// group models by base model id or name
function toGroupId(model: GeminiModel): string {
  const groupId = model.baseModelId ? toModelName(model.baseModelId) : toModelName(model.name);
  return toModelId(groupId);
}

/**
 * chat model for our purposes:
 * - can generate chat content
 * - is not preview/experimental
 * - is not special-purpose (e.g., image generation)
 */
function isChatModel(model: GeminiModel): boolean {
  const modelId = toModelName(model.name).toLowerCase();
  const isChatCapable = model.supportedGenerationMethods?.includes("generateContent") ?? false;
  if (!isChatCapable) {
    return false;
  }
  const isStable = !modelId.includes("preview") && !modelId.includes("experimental");
  if (!isStable) {
    return false;
  }
  return !modelId.includes("image-generation");
}

// returns true if the model supports streaming generation
function isStreaming(model: GeminiModel): boolean {
  return model.supportedGenerationMethods?.includes("streamGenerateContent") ?? false;
}

// converts a version string like "001" to a number like 1
function toVersionNumber(version: string | undefined): number {
  const versionNumber = Number(version);
  return Number.isFinite(versionNumber) ? versionNumber : 0;
}

/**
 * Prefer Gemini major/minor (2.5 > 2.0 > 1.5 > unversioned)
 * from either the model id or display name.
 * Returns a sortable number like 205 for "2.5".
 */
function toNameVersionNumber(modelName: string): number {
  // id style: gemini-2.5-...
  const name = modelName.toLowerCase();
  const hyphenatedVersion = name.match(/gemini-(\d+)(?:\.(\d+))?/);
  if (hyphenatedVersion) {
    const major = Number(hyphenatedVersion[1]);
    const minor = Number(hyphenatedVersion[2] ?? 0);
    if (Number.isFinite(major) && Number.isFinite(minor)) {
      return major * 100 + minor;
    }
  }

  // display style: gemini 2.5 ...
  const spacedVersion = name.match(/gemini\s+(\d+)(?:\.(\d+))?/);
  if (spacedVersion) {
    const major = Number(spacedVersion[1]);
    const minor = Number(spacedVersion[2] ?? 0);
    if (Number.isFinite(major) && Number.isFinite(minor)) return major * 100 + minor;
  }
  return 0;
}

// score a Gemini model based on its features and capabilities
function toModelScore(model: GeminiModel): number {
  // 1) Prefer newer family: 2.5 > 2.0 > 1.5 > unversioned
  let score = 0;
  const modelName = toModelName(model.name);
  const family = Math.max(
    toNameVersionNumber(modelName),
    toNameVersionNumber(model.displayName ?? ""),
  );
  score += family * 10;

  // 2) Prefer tier: pro > flash > others
  const modelId = toModelId(modelName);
  if (modelId.includes("pro")) {
    score += 300;
  }
  if (modelId.includes("flash")) {
    score += 200;
  }

  // 3) De-prioritize lower tiers
  if (modelId.includes("lite")) {
    score -= 10;
  }
  if (modelId.includes("nano")) {
    score -= 20;
  }

  // 4) Prefer streaming-capable (but don't require it)
  if (isStreaming(model)) {
    score += 25;
  }

  // 5) Prefer a higher numeric suffix version if present (001/002)
  score += toVersionNumber(model.version) * 10;
  return score;
}

// filter unique models for an id and label
function toUniqueModels(models: Model[]): Model[] {
  const modelIds = new Set<string>();
  const modelLabels = new Set<string>();
  const uniqueModels: Model[] = [];
  for (const model of models) {
    const modelId = toModelId(model.id);
    const modelLabel = model.label.trim().toLowerCase();
    if (modelIds.has(modelId)) {
      continue;
    }
    if (modelLabels.has(modelLabel)) {
      continue;
    }
    modelIds.add(modelId);
    modelLabels.add(modelLabel);
    uniqueModels.push(model);
  }
  return uniqueModels;
}

export function normalizeGeminiModels(args: {
  providerId: ProviderId;
  payload: GetGeminiModelsResponse;
}): ProviderModels {
  // filter to chat models
  const requestModels = args.payload.models ?? [];
  const chatModels = requestModels.filter(isChatModel);

  // choose the best model per group (first in ranked order)
  const groupModels = new Map<string, GeminiModel>();
  for (const model of chatModels) {
    const groupId = toGroupId(model);
    const current = groupModels.get(groupId);
    if (!current || toModelScore(model) > toModelScore(current)) {
      groupModels.set(groupId, model);
    }
  }

  // sort models by a rank score default to lexicographic name in case of a tie
  const topModels = [...groupModels.values()].sort((firstModel, secondModel) => {
    const score = toModelScore(secondModel) - toModelScore(firstModel);
    if (score !== 0) {
      return score;
    }
    return toModelName(secondModel.name).localeCompare(toModelName(firstModel.name));
  });

  // convert the top Gemini models into Chatwar models
  const chatwarModels = topModels.map((model) => {
    const id = toModelName(model.name);
    return {
      id,
      label: model.displayName ?? id,
      capabilities: { streaming: isStreaming(model) },
    };
  });
  const models = toUniqueModels(chatwarModels).slice(0, LIMIT_MODELS);

  // set the default model and return the models response
  const defaultModelId =
    models[0]?.id ??
    toModelName(chatModels[0]?.name ?? requestModels[0]?.name ?? "gemini-1.5-flash");
  return {
    providerId: args.providerId,
    defaultModelId,
    models,
  };
}
