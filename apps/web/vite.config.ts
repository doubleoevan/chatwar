import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const isLocalServer = mode === "localserver";

  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          // optional, but nice defaults
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
      proxy: isLocalServer
        ? {
            "/api": {
              target: "http://localhost:3001",
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ""),
            },
          }
        : undefined,
    },
  };
});
