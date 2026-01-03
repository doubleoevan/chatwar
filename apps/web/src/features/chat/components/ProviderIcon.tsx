import { cn } from "@chatwar/ui";
import { Provider, type ProviderId } from "@chatwar/shared";
import { Spinner } from "@/components/Spinner";
import { useApiKeys } from "@/providers/credentials";
import { MessageCircleHeartIcon } from "lucide-react";
import { VoteResponseButton } from "@/features/chat/components/VoteResponseButton";
import { StopPropagation } from "@/components/StopPropagation";

export function ProviderIcon({
  provider,
  className,
  onVoteResponse,
}: {
  provider: Provider;
  className?: string;
  onVoteResponse?: (providerId: ProviderId) => void;
}) {
  const { Icon } = provider;
  const { loadingProviderIds } = useApiKeys();

  // TODO: get these from the chat context useChat()
  const respondingProviderIds = new Set();
  const votingProviderIds = new Set();

  const isLoading = loadingProviderIds.has(provider.id);
  const isResponding = respondingProviderIds.has(provider.id);
  const isVoting = votingProviderIds.has(provider.id);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {isLoading ? (
        <>
          <span aria-hidden>
            <Spinner>
              <Icon />
            </Spinner>
          </span>
          <h2 id={`provider-${provider.id}-heading`}>{provider.label}</h2>
        </>
      ) : isResponding ? (
        <Spinner>
          <MessageCircleHeartIcon aria-label="Waiting for response" />
        </Spinner>
      ) : isVoting ? (
        <StopPropagation>
          <VoteResponseButton
            provider={provider}
            className="h-6 w-6"
            onVoteResponse={onVoteResponse}
          />
        </StopPropagation>
      ) : (
        <>
          <span aria-hidden>
            <Icon />
          </span>
          <h2 id={`provider-${provider.id}-heading`}>{provider.label}</h2>
        </>
      )}
    </div>
  );
}
