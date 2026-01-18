import { streamChatEvents } from "../common/chat";

type GeminiStreamEvent = {
  error?: { message?: unknown };
  candidates?: Array<{
    content?: { parts?: Array<{ text?: unknown }> };
  }>;
};

// streams Gemini chat events
export async function* streamGeminiChat(response: Response): AsyncIterable<string> {
  let yieldedContent = false;
  for await (const event of streamChatEvents(response)) {
    if (typeof event !== "object" || event === null) {
      continue;
    }

    // throw any provider errors
    const streamEvent = event as GeminiStreamEvent;
    const message = streamEvent.error?.message;
    if (typeof message === "string" && message.length > 0) {
      throw new Error(`Gemini chat failed: ${message}`);
    }

    // emit the text content
    const parts = streamEvent.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) {
      continue;
    }
    for (const part of parts) {
      const text = part?.text;
      if (typeof text !== "string" || text.length === 0) {
        continue;
      }
      yieldedContent = true;
      yield text;
    }
  }

  // throw an error if the stream completed without content
  if (!yieldedContent) {
    throw new Error("Gemini chat stream ended without any content");
  }
}
