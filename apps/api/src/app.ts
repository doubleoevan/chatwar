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

export function buildApp() {
  const app = Fastify({ logger: true });

  // Zod validation and serialization
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // openapi spec generator for apps to consume
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

  // fine for local dev, CORS doesn't matter when using vite proxy,
  // but enabling it keeps curl/browser direct calls painless.
  const corsOrigin = process.env.CORS_ORIGIN ?? true;
  app.register(cors, {
    origin: corsOrigin === "true" ? true : corsOrigin,
  });

  // health check route
  app.get("/health", async () => ({ ok: true }));

  // routes typed by Zod
  app.withTypeProvider<ZodTypeProvider>().register(votesRoutes);

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
