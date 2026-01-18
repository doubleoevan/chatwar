import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  apiErrorSchema,
  chatParamsSchema,
  chatRequestSchema,
  chatStreamChunkSchema,
  chatStreamDoneSchema,
  PROVIDER_API_KEY_HEADER,
} from "@chatwar/shared";
import { streamProviderChat } from "../services/chat";

export const chatRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/v1/providers/:providerId/chat",
    {
      schema: {
        tags: ["Chat"],
        summary: "Stream chat response",
        description: `
          Streams a newline-delimited JSON response as chunks. 
          Each line is a { chunk: string }. 
          Final line is { done: true }. 
        `,
        params: chatParamsSchema,
        body: chatRequestSchema,
        response: {
          // Swagger can’t represent a stream well; we document the *event* schema.
          200: z.union([chatStreamChunkSchema, chatStreamDoneSchema]),
          400: apiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      // validate the API key header
      const apiKey = request.headers[PROVIDER_API_KEY_HEADER] as string | undefined;
      if (!apiKey) {
        return reply.status(400).send({
          code: "INVALID_API_KEY",
          message: `Missing required header: ${PROVIDER_API_KEY_HEADER}`,
        });
      }

      // validate the message
      const { modelId, message } = request.body;
      if (!message.trim()) {
        return reply.status(400).send({
          code: "INVALID_MESSAGE",
          message: "Message cannot be empty.",
        });
      }

      // add headers for streaming
      reply.raw.writeHead(200, {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      });

      // stop streaming if the client disconnects
      let closed = false;
      request.raw.on("close", () => {
        closed = true;
        abortController.abort();
      });

      // stream the chat response
      const abortController = new AbortController();
      const { providerId } = request.params;
      try {
        for await (const chunk of streamProviderChat({
          providerId,
          apiKey,
          modelId,
          message,
          signal: abortController.signal,
        })) {
          if (closed) {
            return;
          }
          reply.raw.write(JSON.stringify({ chunk }) + "\n");
        }
        if (!closed) {
          reply.raw.write(JSON.stringify({ done: true }) + "\n");
          reply.raw.end();
        }
      } catch (err) {
        app.log.error(err);
        if (!closed) {
          // end the stream with an error
          reply.raw.write(JSON.stringify({ done: true }) + "\n");
          reply.raw.end();
        }
      }
    },
  );
};
