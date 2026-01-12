import { setupWorker } from "msw/browser";
import { handlers } from "@/mocks/handlers";

export const worker = setupWorker(...handlers);

const IGNORED_PATHS = new Set(["/site.webmanifest", "/chat", "/analytics", "/demo"]);
worker.start({
  onUnhandledRequest(request) {
    // ignore route paths
    const url = new URL(request.url);
    if (IGNORED_PATHS.has(url.pathname)) {
      return;
    }
    console.warn("[MSW] Unhandled request:", request.method, url.pathname);
  },
});
