import type { ApiError, ChatParams } from "@chatwar/shared";
import { streamJson } from "@/api/client";

/**
 * POST /api/v1/providers/:providerId/chat
 * Used by ChatProvider
 */
export async function streamChat(
  args: ChatParams & {
    providerApiKey: string;
    modelId: string;
    message: string;
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    onError: (error: ApiError) => void;
    signal?: AbortSignal;
  },
) {
  const { providerId, providerApiKey, modelId, message, signal, onChunk, onComplete, onError } =
    args;
  return streamJson(
    `/api/v1/providers/${providerId}/chat`,
    {
      method: "POST",
      body: JSON.stringify({ modelId, message }),
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
