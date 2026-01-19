import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  platform: "node",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  // keep runtime dependencies external to prevent bundling weirdness
  external: ["@prisma/client", "pg", "geoip-lite"],
});
