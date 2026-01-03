import type { Provider, ProviderId } from "@chatwar/shared";
import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@chatwar/ui";
import { MessageCircleOff } from "lucide-react";
import { useApiKeys } from "@/providers/credentials";

export function RemoveApiKeyButton({
  provider,
  onApiKeyRemove,
  className,
}: {
  provider: Provider;
  onApiKeyRemove?: (providerId: ProviderId) => void;
  className?: string;
}) {
  const { deleteApiKey } = useApiKeys();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              `
              bg-background
              hover:bg-primary
              hover:text-primary-foreground
              cursor-pointer
            `,
              className,
            )}
            aria-label={`Remove ${provider.label} API Key`}
            onClick={() => {
              deleteApiKey(provider.id);
              onApiKeyRemove?.(provider.id);
            }}
          >
            <MessageCircleOff />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="bottom" align="end">
          <span>Remove {provider.label} API Key</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
