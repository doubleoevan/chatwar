import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { votesRoutes } from "./routes/votes.js";

const app = Fastify({ logger: true });

// For local dev, this is fine. When using the Vite proxy, CORS doesn't matter,
// but enabling it keeps curl/browser direct calls painless.
const corsOrigin = process.env.CORS_ORIGIN ?? true;
await app.register(cors, {
  origin: corsOrigin === "true" ? true : corsOrigin,
});

// health check
app.get("/health", async () => ({ ok: true }));

// register API routes
await app.register(votesRoutes);

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  app.log.info(`🚀 API listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
