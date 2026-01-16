import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "happy-dom",
    setupFiles: ["src/test/vitest.setup.ts"],

    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "coverage",

      // include all src files in the coverage report
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.d.ts",
        "src/**/__generated__/**",
        "src/**/mocks/**",
        "src/**/stories/**",
        "src/**/index.ts", // ignore index files
      ],
    },
  },
});
