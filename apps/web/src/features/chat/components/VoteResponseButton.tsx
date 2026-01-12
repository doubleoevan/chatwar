import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { cn } from "@chatwar/ui";
import { MessageCircleHeartIcon } from "lucide-react";
import { useChat } from "@/providers/chat";
import { useCredentials } from "@/providers/credentials";

export function VoteResponseButton({
  provider,
  className,
  onVoteResponse,
}: {
  provider: Provider;
  className?: string;
  onVoteResponse?: (providerId: ProviderId) => void;
}) {
  const { apiKeys } = useCredentials();
  const { voteProviderChat, selectedProviderModels } = useChat();

  const onVote = () => {
    const providerId = provider.id;
    const providerApiKey = apiKeys[providerId];
    const model = selectedProviderModels[providerId];
    if (!providerApiKey || !model) {
      return;
    }
    voteProviderChat({ providerId, model });
    onVoteResponse?.(providerId);
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label="Vote for this response"
      onClick={(event) => {
        event.stopPropagation(); // prevent accordion toggle
        onVote();
      }}
      onPointerDown={(event) => {
        event.stopPropagation(); // prevent accordion toggle on press
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
        inline-flex items-center gap-1.5
        w-fit!
        cursor-pointer select-none
      `,
        className,
      )}
    >
      <MessageCircleHeartIcon className="h-6 w-6 hover:opacity-90" aria-hidden />
      <span>Vote for this</span>
    </span>
  );
}
