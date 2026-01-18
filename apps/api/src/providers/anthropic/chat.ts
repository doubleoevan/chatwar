import { streamChatEvents } from "../common/chat";

type AnthropicStreamEvent = {
  type?: unknown;
  delta?: {
    type?: unknown;
    text?: unknown;
  };
};

// streams Anthropic chat events
export async function* streamAnthropicChat(response: Response): AsyncIterable<string> {
  for await (const event of streamChatEvents(response)) {
    // filter for content delta events
    if (
      typeof event !== "object" ||
      event === null ||
      (event as AnthropicStreamEvent).type !== "content_block_delta"
    ) {
      continue;
    }

    // filter for text deltas
    const streamEvent = event as AnthropicStreamEvent;
    const delta = streamEvent.delta;
    if (!delta || delta.type !== "text_delta") {
      continue;
    }

    // emit the text content
    const text = delta.text;
    if (typeof text !== "string" || text.length === 0) {
      continue;
    }
    yield text;
  }
}
