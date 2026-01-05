import { randomDelay } from "@/mocks";

/** Adds latency in dev mode to mock handlers. */
export async function withLatency<T>(fn: () => Promise<T>): Promise<T> {
  await randomDelay();
  return fn();
}
