import type { Provider, ProviderId } from "@chatwar/shared";
import { Button, cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@chatwar/ui";
import { MessageCircleHeartIcon } from "lucide-react";

export function VoteResponseButton({
  provider,
  className,
  onVoteResponse,
}: {
  provider: Provider;
  className?: string;
  onVoteResponse?: (providerId: ProviderId) => void;
}) {
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
            aria-label="Vote for this response"
            onClick={() => {
              onVoteResponse?.(provider.id);
            }}
          >
            <MessageCircleHeartIcon />
          </Button>
        </TooltipTrigger>

        <TooltipContent side="top" align="start">
          <span>Vote for response</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
