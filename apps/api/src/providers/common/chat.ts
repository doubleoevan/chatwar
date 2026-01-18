import { createParser } from "eventsource-parser";

type ChatCompletionChunk = {
  choices?: Array<{
    delta?: { content?: string };
    message?: { content?: string };
    text?: string;
  }>;
};

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

// streams server-side chat events as JSON objects
export async function* streamChatEvents(response: Response): AsyncIterable<unknown> {
  if (!response.body) {
    throw new Error("Missing response body");
  }

  // create the server-side event parser and event buffer
  const eventBuffer: string[] = [];
  const decoder = new TextDecoder();
  const parser = createParser({
    onEvent: (event) => {
      if (event.data) {
        eventBuffer.push(event.data);
      }
    },
  });

  // read the response body and emit parsed events
  const reader = response.body.getReader();
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      parser.feed(decoder.decode(value, { stream: true }));
      while (eventBuffer.length > 0) {
        const trimmed = eventBuffer.shift()!.trim();
        if (!trimmed) {
          continue;
        }
        try {
          yield JSON.parse(trimmed);
        } catch {
          // ignore non-JSON keepalives
        }
      }
    }
  } catch (err) {
    if (isAbortError(err)) {
      return;
    }
    throw err;
  } finally {
    try {
      await reader.cancel();
    } catch {
      // ignore
    }
  }
}

// streams chat completion deltas
export async function* streamChatCompletions(response: Response): AsyncIterable<string> {
  if (!response.ok) {
    const error = await response.text().catch(() => "");
    throw new Error(
      `Chat request failed: ${response.status} ${response.statusText} ${error}`.trim(),
    );
  }

  // stream chat completion events and track whether any text was streamed
  let yieldedContent = false;
  for await (const event of streamChatEvents(response)) {
    if (event === "[DONE]") {
      return;
    }
    if (typeof event !== "object" || event === null) {
      continue;
    }

    // extract the text delta from the primary choice
    const chunkEvent = event as ChatCompletionChunk;
    const choice = chunkEvent.choices?.[0];
    const delta = choice?.delta?.content ?? choice?.message?.content ?? choice?.text;
    if (typeof delta !== "string" || delta.length === 0) {
      continue;
    }
    yieldedContent = true;
    yield delta;
  }

  // throw an error if the stream completed without content
  if (!yieldedContent) {
    throw new Error("Chat stream ended without any content");
  }
}
