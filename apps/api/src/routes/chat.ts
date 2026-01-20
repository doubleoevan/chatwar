import type { OutgoingHttpHeaders } from "node:http";
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
} from "@chatwar/shared";
import { streamProviderChat } from "../services/chat";
import { FastifyInstance, FastifyRequest } from "fastify";

type CorsResult = {
  headers?: Record<string, string | string[]>;
};
type CorsOptionsFunction = (req: FastifyRequest) => Promise<CorsResult>;

// return cors headers for the request
async function toCorsHeaders(
  app: FastifyInstance,
  request: FastifyRequest,
): Promise<OutgoingHttpHeaders> {
  const corsOptions = (app as unknown as { corsOptions?: CorsOptionsFunction }).corsOptions;
  const cors = corsOptions ? await corsOptions(request) : undefined;
  const headers = { ...(cors?.headers ?? {}) };
  const origin = request.headers.origin;
  if (typeof origin === "string" && headers["access-control-allow-origin"] === undefined) {
    headers["access-control-allow-origin"] = origin;
    headers["vary"] = "Origin";
  }
  return headers;
}

export const chatRoutes: FastifyPluginAsyncZod = async (app) => {
  app.options("/v1/providers/:providerId/chat", async (request, reply) => {
    const corsHeaders = await toCorsHeaders(app, request);
    for (const [key, value] of Object.entries(corsHeaders) as Array<
      [string, OutgoingHttpHeaders[string]]
    >) {
      if (value !== undefined) {
        reply.header(key, value);
      }
    }
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
        const corsHeaders = await toCorsHeaders(app, request);
        reply.hijack();
        reply.raw.writeHead(200, {
          ...corsHeaders,
          "content-type": "application/x-ndjson; charset=utf-8",
          "cache-control": "no-cache, no-transform",
          connection: "keep-alive",
          "x-accel-buffering": "no",
        });
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
        if (closed) {
          return;
        }

        // write an error response if streaming failed
        app.log.error(error);
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
