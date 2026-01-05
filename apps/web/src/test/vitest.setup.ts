import { Storage } from "happy-dom";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { server } from "@/mocks/server";

// mock local storage and session storage
globalThis.localStorage = new Storage();
globalThis.sessionStorage = new Storage();
if (typeof window !== "undefined") {
  Object.defineProperty(window, "localStorage", {
    value: globalThis.localStorage,
    configurable: true,
  });
  Object.defineProperty(window, "sessionStorage", {
    value: globalThis.sessionStorage,
    configurable: true,
  });
}

beforeAll(() => {
  // start mock service worker
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  // clear storage before tests
  localStorage.clear();
  sessionStorage.clear();
});

afterEach(() => {
  // reset mock service workers and restore test mocks
  server.resetHandlers();
  vi.restoreAllMocks();
});

afterAll(() => {
  // stop mock service worker
  server.close();
});
