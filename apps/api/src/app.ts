import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import compress from "@fastify/compress";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { votesRoutes } from "./routes/votes.js";
import { modelsRoutes } from "./routes/models.js";
import { chatRoutes } from "./routes/chat.js";
import { CACHE_HEADER, PROVIDER_API_KEY_HEADER } from "@chatwar/shared";

export function buildApp() {
  const app = Fastify({
    logger: true,
    trustProxy: true, // trust proxy headers for ip location (Render / proxies)
  });

  // Zod validation and serialization
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // OpenAPI spec generator
  app.register(swagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: "ChatWar API",
        description: "ChatWar backend API (models, chat, votes).",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  // parse comma-separated allowed origins from the CORS_ORIGIN env var
  const allowedOrigins = new Set(
    (process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );

  // enforce strict CORS in production
  if (process.env.NODE_ENV === "production" && allowedOrigins.size === 0) {
    app.log.warn("CORS_ORIGIN is empty in production; no browser origins will be allowed");
  }
  app.register(cors, {
    origin: (origin, callback) => {
      // allow requests without an Origin header for curl and server-to-server
      if (!origin) {
        return callback(null, true);
      }

      // allow requests from our CORS_ORIGIN domains
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // reject everything else
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", PROVIDER_API_KEY_HEADER, CACHE_HEADER],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400,
  });

  // add compression globally but remember to disable for streaming routes
  app.register(compress, { global: true });

  // health check routes
  app.head("/health", async (_req, reply) => reply.status(200).send());
  app.get("/health", async () => ({ ok: true }));

  // routes typed by Zod
  app.withTypeProvider<ZodTypeProvider>().register(votesRoutes);
  app.withTypeProvider<ZodTypeProvider>().register(modelsRoutes);
  app.withTypeProvider<ZodTypeProvider>().register(chatRoutes);

  // swagger ui routes
  app.register(import("@fastify/swagger-ui"), {
    routePrefix: "/api-docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });
  return app;
}
