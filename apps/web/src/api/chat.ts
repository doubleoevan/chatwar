import type { ChatParams, ChatRequest } from "@chatwar/shared";
import { streamJson } from "@/api/client";

/**
 * POST /api/v1/providers/:providerId/chat
 * Used by ChatProvider
 */
export async function streamChat(
  args: ChatParams & {
    providerApiKey: string;
    body: ChatRequest;
    onChunk: (chunk: string) => void;
    onComplete: () => void;
    onError: (error: Error) => void;
    signal?: AbortSignal;
  },
) {
  const { providerId, providerApiKey, body, signal, onChunk, onComplete, onError } = args;

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
      onError: (apiError) => {
        onError(new Error(apiError.message));
      },
    },
  );
}
