import "dotenv/config";
import { buildApp } from "./app.js";
import colors from "picocolors";

const app = buildApp();
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });

  // print the api urls in dev
  if (process.env.NODE_ENV !== "production") {
    const apiUrl = `http://localhost:${port}`;
    const swaggerUrl = `${apiUrl}/api-docs`;
    const openapiUrl = `${apiUrl}/api-docs/json`;
    console.log();
    console.log(`  ${colors.green("API")}`);
    console.log(`  ${colors.green("➜")}  Swagger: ${swaggerUrl}`);
    console.log(`  ${colors.green("➜")}  OpenAPI: ${openapiUrl}`);
  }
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
