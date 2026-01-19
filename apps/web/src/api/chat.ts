import type { ApiError, ChatMessage, ChatParams, ChatRequest } from "@chatwar/shared";
import { streamJson } from "@/api/client";

/**
 * POST /v1/providers/:providerId/chat
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
    onEventError?: (error: ApiError) => void; // errors to display in the chat
    signal?: AbortSignal;
  },
) {
  const {
    providerId,
    providerApiKey,
    modelId,
    messages,
    signal,
    onChunk,
    onComplete,
    onError,
    onEventError,
  } = args;
  const body = { modelId, messages } satisfies ChatRequest;
  return streamJson(
    `/v1/providers/${providerId}/chat`,
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
      onEventError,
    },
  );
}
