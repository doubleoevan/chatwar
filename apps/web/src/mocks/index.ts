export * from "./utils/latency";

export async function enableMocks() {
  if (import.meta.env.MODE !== "mock") {
    return;
  }

  const { worker } = await import("./browser");
  await worker.start();
}
