import { delay } from "msw";

/**
 * provides a random delay within a range for testing
 */
export async function randomDelay({
  minimum = 150,
  range = 500,
}: {
  minimum?: number;
  range?: number;
} = {}) {
  const isEnabled = import.meta.env.VITE_MSW_LATENCY !== "off";
  if (!isEnabled) {
    return delay(0);
  }
  const maximum = minimum + Math.max(0, range);
  const random = Math.floor(minimum + Math.random() * (maximum - minimum + 1));
  return delay(random);
}
