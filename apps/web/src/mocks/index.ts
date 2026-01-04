export async function enableMocks() {
  // only run mock service worker in dev
  if (import.meta.env.MODE !== "development") {
    return;
  }
  const { worker } = await import("./browser");
  await worker.start({
    onUnhandledRequest: "warn",
  });
}
