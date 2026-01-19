import Fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { votesRoutes } from "./routes/votes.js";
import { modelsRoutes } from "./routes/models.js";
import { chatRoutes } from "./routes/chat.js";

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

  // build a normalized CORS allowlist from the CORS_ORIGIN env var
  const allowlist = new Set(
    (process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  );
  if (!allowlist.size && process.env.NODE_ENV === "production") {
    app.log.warn("CORS_ORIGIN is empty in production");
  }

  // enforce a strict CORS policy with an explicit origin allowlist
  app.register(cors, {
    origin: (origin, originCallback) => {
      // allow requests without an Origin header for curl and server-to-server
      if (!origin) {
        originCallback(null, true);
        return;
      }
      if (allowlist.has(origin)) {
        originCallback(null, true);
        return;
      }
      app.log.warn({ origin }, "CORS origin blocked");
      originCallback(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "content-type",
      "x-provider-api-key", // provider api key header
    ],
    credentials: false,
    maxAge: 86400, // cache preflight for 24h
  });

  // health check route
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
