import type { ApiError, ChatMessage, ChatParams, ChatRequest } from "@chatwar/shared";
import { streamJson } from "@/api/client";

/**
 * POST /api/v1/providers/:providerId/chat
 * Used by ChatProvider
 */
export async function streamChat(
  args: ChatParams & {
    providerApiKey: string;
    modelId: string;
    messages: ChatMessage[];
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    onError: (error: ApiError) => void;
    signal?: AbortSignal;
  },
) {
  const { providerId, providerApiKey, modelId, messages, signal, onChunk, onComplete, onError } =
    args;
  const body = { modelId, messages } satisfies ChatRequest;
  return streamJson(
    `/api/v1/providers/${providerId}/chat`,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    {
      providerApiKey,
      signal,
    },
    {
      onChunk,
      onComplete,
      onError,
    },
  );
}
