import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@chatwar/ui";
import { MessageCircleOff } from "lucide-react";
import { useCredentials } from "@/providers/credentials";

export function RemoveApiKeyButton({
  provider,
  onApiKeyRemove,
  className,
}: {
  provider: Provider;
  onApiKeyRemove?: (providerId: ProviderId) => void;
  className?: string;
}) {
  const { deleteApiKey } = useCredentials();

  return (
    <TooltipProvider>
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
            aria-label={`Remove API Key`}
            onClick={() => {
              deleteApiKey(provider.id);
              onApiKeyRemove?.(provider.id);
            }}
          >
            <MessageCircleOff />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="bottom" align="end">
          <span>Remove API Key</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
