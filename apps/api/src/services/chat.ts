import { getProviderAdapter } from "../providers";

export async function* streamProviderChat(args: {
  providerId: string;
  apiKey: string;
  modelId: string;
  message: string;
  signal?: AbortSignal;
}): AsyncIterable<string> {
  const { apiKey, providerId, modelId, message, signal } = args;
  if (!apiKey) {
    throw new Error("Missing provider API key");
  }
  const adapter = getProviderAdapter(providerId);
  yield* adapter.streamChat({ apiKey, modelId, message, signal });
}
