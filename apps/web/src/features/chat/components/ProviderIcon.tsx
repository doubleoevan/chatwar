import { cn } from "@chatwar/ui";
import { Provider } from "@chatwar/shared";
import { Spinner } from "@/components/Spinner";
import { useApiKeys } from "@/providers/credentials";

export function ProviderIcon({ provider, className }: { provider: Provider; className?: string }) {
  const { Icon } = provider;
  const { loadingProviderIds } = useApiKeys();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span aria-hidden>
        {loadingProviderIds.has(provider.id) ? (
          <Spinner>
            <Icon />
          </Spinner>
        ) : (
          <Icon />
        )}
      </span>
      <h2 id={`provider-${provider.id}-heading`}>{provider.label}</h2>
    </div>
  );
}
