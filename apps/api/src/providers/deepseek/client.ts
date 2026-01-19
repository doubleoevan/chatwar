import { ChatMessage } from "@chatwar/shared";
import { toUpstreamError } from "../../lib/upstreamError";

export type DeepseekModel = {
  id: string;
  object: "model";
  owned_by: string;
};

export type GetDeepseekModelsResponse = {
  object: "list";
  data: DeepseekModel[];
};

export async function getDeepseekModels(args: {
  apiKey: string;
}): Promise<GetDeepseekModelsResponse> {
  // make the request
  const response = await fetch("https://api.deepseek.com/v1/models", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      Accept: "application/json",
    },
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    throw await toUpstreamError({ message: "Deepseek get models failed", response });
  }
  return (await response.json()) as GetDeepseekModelsResponse;
}

export async function createDeepseekChatStream(args: {
  apiKey: string;
  modelId: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "x-api-key": args.apiKey,
      "deepseek-version": "2023-06-01",
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: args.modelId,
      messages: args.messages,
      stream: true,
    }),
    signal: args.signal,
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    throw await toUpstreamError({ message: "Deepseek chat failed", response });
  }
  return response;
}
