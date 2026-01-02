import { PROVIDERS } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { ProviderChat } from "@/components/ProviderChat";

export function ChatPage() {
  const providers = PROVIDERS.map((id) => PROVIDER_CONFIGURATIONS[id]);

  return (
    <section aria-labelledby="chat-heading">
      <h1 id="chat-heading" className="sr-only">
        Chat
      </h1>
      {providers.map((provider) => {
        return <ProviderChat key={`${provider.id}`} provider={provider} />;
      })}
    </section>
  );
}
