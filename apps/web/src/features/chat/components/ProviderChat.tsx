import { Button, cn, ScrollArea } from "@chatwar/ui";
import type { Provider } from "@/types/provider";
import { useChat } from "@/providers/chat/useChat";

export function ProviderChat({
  provider,
  onStartChatClick,
}: {
  provider: Provider;
  onStartChatClick?: (providerId: Provider["id"]) => void;
}) {
  const { providerChats } = useChat();

  const providerId = provider.id;
  const chatMessages = providerChats[providerId] ?? [];
  const hasMessages = chatMessages.length > 0;

  return (
    <section className="rounded-md border bg-background">
      <ScrollArea className={cn("max-h-48 p-2", hasMessages ? "h-48" : "h-auto")}>
        {!hasMessages ? (
          <Button
            variant="link"
            onClick={() => onStartChatClick?.(providerId)}
            className="
              m-0 p-0
              w-full
              justify-start
              text-left
              text-muted-foreground
              cursor-pointer
            "
          >
            Ask a question to start chatting with {provider.label}.
          </Button>
        ) : (
          <div className="space-y-2">
            {chatMessages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div
                  key={index}
                  className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 leading-6 whitespace-pre-wrap wrap-break-word",
                      isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                    )}
                  >
                    {message.message}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </section>
  );
}
