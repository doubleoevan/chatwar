import type { ProviderId } from "@chatwar/shared";
import { streamJson } from "@/api/client";

export async function streamChat(args: {
  providerId: ProviderId;
  providerApiKey: string;
  modelId: string;
  message: string;
  onChunk: (chunk: string) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
  signal?: AbortSignal;
}) {
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
      onError: (apiError) => {
        onError(new Error(apiError.message));
      },
    },
  );
}
