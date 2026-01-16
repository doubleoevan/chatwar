import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  apiErrorSchema,
  chatParamsSchema,
  chatRequestSchema,
  chatStreamChunkSchema,
  chatStreamDoneSchema,
} from "@chatwar/shared";

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

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
      const { providerId } = request.params;
      const { modelId, message } = request.body;

      // validate the message
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
      });

      // mock the streaming for now TODO: replace with real provider calls
      const chunks = [
        `Mock stream from ${providerId}/${modelId}.\n\n`,
        `You said: "${message}"\n\n`,
        `Next: real provider calls + real streaming.\n`,
      ];
      for (const chunk of chunks) {
        if (closed) {
          return;
        }
        reply.raw.write(JSON.stringify({ chunk }) + "\n");
        await sleep(200);
      }

      if (!closed) {
        reply.raw.write(JSON.stringify({ done: true }) + "\n");
        reply.raw.end();
      }
    },
  );
};
