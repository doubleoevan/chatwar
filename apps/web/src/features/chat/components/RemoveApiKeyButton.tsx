import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger } from "@chatwar/ui";
import { MessageCircleOff } from "lucide-react";
import { useCredentials } from "@/providers/credentials";
import { useChat } from "@/providers/chat";

export function RemoveApiKeyButton({
  provider,
  onApiKeyRemove,
  className,
}: {
  provider: Provider;
  onApiKeyRemove?: (providerId: ProviderId) => void;
  className?: string;
}) {
  const { deleteApiKey, loadingProviderIds } = useCredentials();
  const { removeProviderChat, respondingProviderIds, votingProviderIds } = useChat();

  // hide the remove button while loading, responding or voting
  const isLoading = loadingProviderIds.has(provider.id);
  const isResponding = respondingProviderIds.has(provider.id);
  const isVoting = votingProviderIds.has(provider.id);
  if (isLoading || isResponding || isVoting) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            `
              border border-input
              bg-background
              hover:bg-primary
              hover:text-primary-foreground
              cursor-pointer
            `,
            className,
          )}
          aria-label={`Remove this API Key`}
          onClick={() => {
            deleteApiKey(provider.id);
            removeProviderChat(provider.id);
            onApiKeyRemove?.(provider.id);
          }}
        >
          <MessageCircleOff />
        </Button>
      </TooltipTrigger>

      <TooltipContent side="bottom" align="end">
        <span>Remove this API Key</span>
      </TooltipContent>
    </Tooltip>
  );
}
