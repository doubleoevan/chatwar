import type { Provider } from "@/types/provider";

export function ProviderChat({ provider }: { provider: Provider }) {
  return <section className="px-1">Chat with {provider.label}...</section>;
}
