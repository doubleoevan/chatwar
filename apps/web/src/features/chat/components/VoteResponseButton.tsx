import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@chatwar/ui";
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
  const onVote = () => onVoteResponse?.(provider.id);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            role="button"
            tabIndex={0}
            aria-label="Vote for this response"
            onClick={(event) => {
              event.stopPropagation();
              onVote();
            }}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onVote();
              }
            }}
            className={cn(
              `
              inline-flex items-center justify-center
              rounded-md
              border border-input
              bg-background
              text-foreground
              hover:bg-primary hover:text-primary-foreground
              active:scale-95
              cursor-pointer select-none
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
            `,
              className,
            )}
          >
            <MessageCircleHeartIcon className="h-4 w-4" />
          </span>
        </TooltipTrigger>

        <TooltipContent side="top" align="start">
          <span>Vote for response</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
