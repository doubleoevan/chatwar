import { http, HttpResponse } from "msw";
import { chatParamsSchema, chatRequestSchema, PROVIDER_API_KEY_HEADER } from "@chatwar/shared";
import { PROVIDER_CHATS } from "@/mocks/data/providerChats";
import { randomDelay } from "@/mocks";

const BREAK_MID_WORD_PROBABILITY = 0.3; // 30% probability of breaking in the middle of a word

function toChunks(
  message: string,
  options: { minimum: number; range: number } = { minimum: 15, range: 45 },
): string[] {
  const { minimum, range } = options;
  const chunks: string[] = [];
  let startIndex = 0;
  while (startIndex < message.length) {
    // set the end index
    const length = Math.floor(Math.random() * range) + minimum;
    let endIndex = Math.min(startIndex + length, message.length);

    // randomly break in the middle of a word
    const shouldBreakMidWord = Math.random() < BREAK_MID_WORD_PROBABILITY;
    if (!shouldBreakMidWord) {
      const lastSpace = message.lastIndexOf(" ", endIndex);
      if (lastSpace > startIndex + 5) {
        endIndex = lastSpace + 1;
      }
    }

    // push a message slice and update the start index
    chunks.push(message.slice(startIndex, endIndex));
    startIndex = endIndex;
  }
  return chunks;
}

export const chatHandlers = [
  http.post("/v1/providers/:providerId/chat", async ({ params, request }) => {
    // throw an error for a missing providerId
    const validParams = chatParamsSchema.safeParse(params);
    if (!validParams.success) {
      return HttpResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing providerId" } },
        { status: 400 },
      );
    }

    // throw an error for a missing apiKey
    const apiKey = request.headers.get(PROVIDER_API_KEY_HEADER)?.trim();
    if (!apiKey) {
      return HttpResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Provider API Key is required" } },
        { status: 401 },
      );
    }

    // throw an error for an invalid request body
    const validBody = chatRequestSchema.safeParse(await request.json());
    if (!validBody.success) {
      return HttpResponse.json(
        { error: { code: "BAD_REQUEST", message: "Invalid request body" } },
        { status: 400 },
      );
    }

    // throw an error for a provider missing messages
    const { providerId } = validParams.data;
    const messages = PROVIDER_CHATS[providerId];
    if (!messages?.length) {
      return HttpResponse.json(
        { error: { code: "BAD_REQUEST", message: `Unknown provider: ${providerId}` } },
        { status: 400 },
      );
    }

    // return the response as one text if streaming is disabled
    // apps/web/.env.local must have VITE_MSW_DISABLE_STREAMING=on to opt out
    const isStreamingDisabled = import.meta.env.VITE_MSW_DISABLE_STREAMING === "on";
    if (isStreamingDisabled) {
      const responseText = messages.join(" ");
      return HttpResponse.json({ chunk: responseText }, { status: 200 });
    }

    // stream the messages as chunks of random length with random latency
    const stream = new ReadableStream<string>({
      async start(controller) {
        for (const message of messages) {
          const chunks = toChunks(message);
          for (const chunk of chunks) {
            await randomDelay({ minimum: 20, range: 80 });
            controller.enqueue(JSON.stringify({ chunk }));
            controller.enqueue("\n");
          }

          // preserve the original spaces between message strings
          controller.enqueue(JSON.stringify({ chunk: " " }));
          controller.enqueue("\n");
        }
        controller.close();
      },
    }).pipeThrough(new TextEncoderStream());

    // return the stream
    return new HttpResponse(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }),
];
