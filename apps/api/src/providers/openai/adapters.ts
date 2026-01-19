import type { GetOpenAIModelsResponse, OpenAIModel } from "./client";
import type { Model, ProviderId, ProviderModels } from "@chatwar/shared";

// use model ID tokens to filter out non-chat models
const NON_CHAT_MODEL_ID_TOKENS = [
  "embedding",
  "moderation",
  "dall-e",
  "image",
  "audio",
  "tts",
  "transcribe",
  "whisper",
  "realtime",
  "search", // drop this to support search models
  "codex",
  "pro",
  "sora",
] as const;
const LIMIT_MODELS = 6; // limit the number of models to show

// filters out non-chat models
function toChatModels(models: OpenAIModel[]): OpenAIModel[] {
  return models.filter(
    (model) =>
      !NON_CHAT_MODEL_ID_TOKENS.some((excludeModelId) => model.id.includes(excludeModelId)),
  );
}

// converts the model ID to a human-readable label
function toModelLabel(modelId: string): string {
  return modelId.replace(/^gpt/i, "GPT").replaceAll("-", " ");
}

// collapses aliases like "gpt-5.2" and "gpt-5.2-2025-12-11" into one
function toAliasId(modelId: string): string {
  return modelId.replace(/-\d{4}-\d{2}-\d{2}$/, "");
}

export function normalizeOpenAIModels(args: {
  providerId: ProviderId;
  payload: GetOpenAIModelsResponse;
}): ProviderModels {
  // filter response models to chat models and prioritize the newest system-owned models
  const responseModels = [...args.payload.data];
  const chatModels = toChatModels(responseModels).sort((firstModel, secondModel) => {
    // prioritize system-owned models
    const systemModel =
      Number(secondModel.owned_by === "system") - Number(firstModel.owned_by === "system");
    if (systemModel !== 0) {
      return systemModel;
    }
    // prioritize newer models
    return secondModel.created - firstModel.created;
  });

  // deduplicate outdated variants with the same alias ids
  const aliasModels = new Map<string, (typeof chatModels)[number]>();
  for (const model of chatModels) {
    const aliasId = toAliasId(model.id);
    if (!aliasModels.has(aliasId)) {
      aliasModels.set(aliasId, model);
    }
  }

  // convert the top OpenAI models into Chatwar models
  const topModels = [...aliasModels.values()].slice(0, LIMIT_MODELS);
  const models: Model[] = topModels.map((model) => ({
    id: model.id,
    label: toModelLabel(model.id),
    capabilities: { streaming: true },
  }));

  // set the default model and return the models response
  const defaultModelId = models[0]?.id ?? "gpt-4o-mini";
  return {
    providerId: args.providerId,
    defaultModelId,
    models,
  };
}
