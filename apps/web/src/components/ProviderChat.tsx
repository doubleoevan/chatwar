import { ProviderCredentials } from "@/components/ProviderCredentials";
import type { Provider } from "@chatwar/shared";

export function ProviderChat({ provider }: { provider: Provider }) {
  return (
    <section aria-labelledby={`provider-${provider.id}-heading`} className="mx-2 mb-2">
      <ProviderCredentials provider={provider} />
    </section>
  );
}
