export * from "./latency";

export async function enableMocks() {
  if (import.meta.env.MODE !== "development") {
    return;
  }

  const { worker } = await import("./browser");
  await worker.start();
}
