import { http, HttpResponse } from "msw";
import { PROVIDER_API_KEY_HEADER, ProviderId } from "@chatwar/shared";
import { PROVIDER_CHATS } from "@/mocks/data/providerChats";
import { randomDelay } from "@/mocks";

export const chatHandlers = [
  http.post("/api/v1/providers/:providerId/chat", async ({ params, request }) => {
    // throw an error for a missing providerId
    const providerId = params.providerId as ProviderId | undefined;
    if (!providerId) {
      return HttpResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing providerId" } },
        { status: 400 },
      );
    }

    // throw an error for a missing apiKey
    const apiKey = request.headers.get(PROVIDER_API_KEY_HEADER)?.trim();
    if (!apiKey) {
      return HttpResponse.json(
        { code: "BAD_REQUEST", message: "Provider API Key is required" },
        { status: 400 },
      );
    }

    // throw an error for a missing message
    const { message } = (await request.json()) as { message?: string };
    if (!message?.trim()) {
      return HttpResponse.json(
        { error: { code: "BAD_REQUEST", message: "Missing message" } },
        { status: 400 },
      );
    }

    // throw an error for a missing messages
    const messages = PROVIDER_CHATS[providerId];
    if (!messages?.length) {
      return HttpResponse.json(
        { error: { code: "BAD_REQUEST", message: `Unknown provider: ${providerId}` } },
        { status: 400 },
      );
    }

    // stream the messages with random latency
    const stream = new ReadableStream<string>({
      async start(controller) {
        for (const message of messages) {
          await randomDelay({ minimum: 300, range: 100 });
          controller.enqueue(message);
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
