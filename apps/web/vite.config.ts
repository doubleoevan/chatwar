import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import * as path from "node:path";

export default defineConfig(({ mode }) => {
  const isLocalServer = mode === "localserver";

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
          ref: true,
        },
      }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      proxy: isLocalServer
        ? {
            "/v1": {
              target: "http://localhost:3001",
              changeOrigin: true,
              rewrite: (urlPath) => urlPath.replace(/^\/api/, ""),
            },
          }
        : undefined,
    },
  };
});
