import type { ChatMessage, ProviderId, ProviderModels } from "@chatwar/shared";

export type GetModelsArgs = {
  apiKey: string;
  providerId: ProviderId;
};

export type ProviderChatArgs = {
  apiKey: string;
  modelId: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
};

export type ProviderAdapter = {
  id: ProviderId;
  getModels: (args: GetModelsArgs) => Promise<ProviderModels>;
  streamChat: (args: ProviderChatArgs) => AsyncIterable<string>;
};
