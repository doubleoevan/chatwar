import { getProviderAdapter } from "../providers";
import { ChatMessage } from "@chatwar/shared";

export async function* streamProviderChat(args: {
  providerId: string;
  apiKey: string;
  modelId: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
}): AsyncIterable<string> {
  const { apiKey, providerId, modelId, messages, signal } = args;
  if (!apiKey) {
    throw new Error("Missing provider API key");
  }
  const adapter = getProviderAdapter(providerId);
  yield* adapter.streamChat({ apiKey, modelId, messages, signal });
}
