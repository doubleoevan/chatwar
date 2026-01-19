import { ChatMessage } from "@chatwar/shared";
import { toUpstreamError } from "../../lib/upstreamError";

export type AnthropicModel = {
  id: string;
  type: "model";
  created_at: string;
  display_name: string;
};

export type GetAnthropicModelsResponse = {
  data: AnthropicModel[];
};

export async function getAnthropicModels(args: {
  apiKey: string;
}): Promise<GetAnthropicModelsResponse> {
  // make the request
  const response = await fetch("https://api.anthropic.com/v1/models", {
    method: "GET",
    headers: {
      "x-api-key": args.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    throw await toUpstreamError({ message: "Anthropic get models failed", response });
  }
  return (await response.json()) as GetAnthropicModelsResponse;
}

export async function createAnthropicChatStream(args: {
  apiKey: string;
  modelId: string;
  messages: ChatMessage[];
  maxTokens?: number;
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": args.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: args.modelId,
      messages: args.messages,
      stream: true,
      max_tokens: args.maxTokens ?? 1024,
    }),
    signal: args.signal,
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    throw await toUpstreamError({ message: "Anthropic chat failed", response });
  }
  return response;
}
