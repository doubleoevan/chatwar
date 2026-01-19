import { ChatMessage } from "@chatwar/shared";
import { toUpstreamError } from "../../lib/upstreamError";

export type GeminiModel = {
  // resource name, e.g. "models/gemini-1.5-flash-001"
  name: string;

  // e.g. "gemini-1.5-flash"
  baseModelId: string;

  // e.g. "001"
  version: string;

  // e.g. "Gemini 1.5 Flash"
  displayName: string;

  // useful metadata (optional)
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;

  // e.g. ["generateContent", "embedContent"]
  supportedGenerationMethods?: string[];
};

export type GetGeminiModelsResponse = {
  models: GeminiModel[];
  nextPageToken?: string;
};

// converts Chatwar messages into Gemini contents
function toGeminiContents(messages: ChatMessage[]) {
  return messages
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    }))
    .filter((content) => content.parts[0].text.trim().length > 0);
}

export async function getGeminiModels(args: { apiKey: string }): Promise<GetGeminiModelsResponse> {
  // make the request
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
    method: "GET",
    headers: {
      "x-goog-api-key": args.apiKey,
      "Content-Type": "application/json",
    },
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    throw await toUpstreamError({ message: "Gemini get models failed", response });
  }
  return (await response.json()) as GetGeminiModelsResponse;
}

export async function createGeminiChatStream(args: {
  apiKey: string;
  modelId: string; // "gemini-2.0-flash" or "models/gemini-2.0-flash"
  messages: ChatMessage[];
  signal?: AbortSignal;
}): Promise<Response> {
  // post the chat message
  const modelPath = args.modelId.startsWith("models/") ? args.modelId : `models/${args.modelId}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:streamGenerateContent?alt=sse`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "x-goog-api-key": args.apiKey,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      contents: toGeminiContents(args.messages),
    }),
    signal: args.signal,
  });

  // throw an error if the request failed or return the response
  if (!response.ok) {
    throw await toUpstreamError({ message: "Gemini chat failed", response });
  }
  return response;
}
