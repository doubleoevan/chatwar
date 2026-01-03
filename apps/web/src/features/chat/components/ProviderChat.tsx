import type { Provider } from "@chatwar/shared";

export function ProviderChat({ provider }: { provider: Provider }) {
  return <section className="px-1">Chat with {provider.label}</section>;
}
