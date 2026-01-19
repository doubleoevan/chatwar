import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import {
  apiErrorSchema,
  chatParamsSchema,
  chatRequestSchema,
  chatStreamChunkSchema,
  chatStreamDoneSchema,
  chatStreamErrorSchema,
  PROVIDER_API_KEY_HEADER,
  typedEntries,
} from "@chatwar/shared";
import { streamProviderChat } from "../services/chat";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type CorsResult = {
  headers?: Record<string, string | string[]>;
};
type CorsOptionsFunction = (req: FastifyRequest) => Promise<CorsResult>;

// manually apply cors headers to streaming responses
async function addCorsHeaders(app: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const corsOptions = (app as unknown as { corsOptions?: CorsOptionsFunction }).corsOptions;
  if (!corsOptions) {
    return;
  }
  const cors = await corsOptions(request);
  for (const [key, value] of typedEntries(cors.headers ?? {})) {
    reply.header(key, value);
  }
}

export const chatRoutes: FastifyPluginAsyncZod = async (app) => {
  app.options("/v1/providers/:providerId/chat", async (request, reply) => {
    await addCorsHeaders(app, request, reply);
    return reply.code(204).send();
  });

  app.post(
    "/v1/providers/:providerId/chat",
    {
      config: { compress: false }, // streaming responses must not be compressed
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
          200: z.union([chatStreamChunkSchema, chatStreamDoneSchema, chatStreamErrorSchema]),
          400: apiErrorSchema,
          502: apiErrorSchema,
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

      // stop streaming if the client disconnects
      let closed = false;
      let started = false;
      const abortController = new AbortController();
      request.raw.on("aborted", () => {
        closed = true;
        abortController.abort();
      });
      reply.raw.on("close", () => {
        closed = true;
        if (!reply.raw.writableEnded) {
          abortController.abort();
        }
      });

      // write the response as newline-delimited JSON
      const write = (event: unknown) => {
        reply.raw.write(`${JSON.stringify(event)}\n`);
      };
      try {
        // add headers for streaming
        await addCorsHeaders(app, request, reply);
        reply
          .code(200)
          .header("Content-Type", "application/x-ndjson; charset=utf-8")
          .header("Cache-Control", "no-cache, no-transform")
          .header("Connection", "keep-alive")
          .header("X-Accel-Buffering", "no");
        reply.hijack();
        // ensure headers go out immediately
        reply.raw.flushHeaders?.();
        started = true;

        // stream the chat response
        const { modelId, messages } = request.body;
        for await (const chunk of streamProviderChat({
          providerId: request.params.providerId,
          apiKey,
          modelId,
          messages,
          signal: abortController.signal,
        })) {
          if (closed) {
            return;
          }
          write({ chunk });
        }
        write({ done: true });
        reply.raw.end();
      } catch (error) {
        // ignore errors if the client disconnected
        app.log.error(error);
        if (closed) {
          return;
        }

        // write an error response if streaming failed
        const message = error instanceof Error ? error.message : "Provider request failed";
        if (started) {
          write({
            error: {
              code: "UPSTREAM_UNAVAILABLE",
              message,
            },
          });
          write({ done: true });
          reply.raw.end();
          return;
        }

        // return a 502 error if streaming didn't start
        reply.status(502).send({
          code: "UPSTREAM_UNAVAILABLE",
          message,
        });
      }
    },
  );
};
