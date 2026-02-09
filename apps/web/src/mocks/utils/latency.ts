import { delay } from "msw";

/**
 * provides a random delay within a range for testing
 */
export async function randomDelay({
  minimum = 350,
  range = 400,
}: {
  minimum?: number;
  range?: number;
} = {}) {
  // apps/web/.env.local must have VITE_MSW_DISABLE_LATENCY=on to opt out
  const isLatencyDisabled = import.meta.env.VITE_MSW_DISABLE_LATENCY === "on";
  if (isLatencyDisabled) {
    return delay(0);
  }
  const maximum = minimum + Math.max(0, range);
  const randomMilliseconds = Math.floor(minimum + Math.random() * (maximum - minimum + 1));
  return delay(randomMilliseconds);
}
