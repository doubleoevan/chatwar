import { useEffect, useMemo } from "react";
import { Button, cn, ScrollArea } from "@chatwar/ui";
import type { Provider } from "@/types/provider";
import { useChat } from "@/providers/chat/useChat";
import { useAutoScroll } from "@/features/chat/hooks/useAutoScroll";
import { ChatMessage } from "@/features/chat/components/ChatMessage";

const EMPTY_CHAT_MESSAGES: readonly { role: string; message: string }[] = [];

export function ProviderChat({
  provider,
  onStartChatClick,
}: {
  provider: Provider;
  onStartChatClick?: (providerId: Provider["id"]) => void;
}) {
  const { providerChats } = useChat();
  const { scrollRef, scrollToBottom } = useAutoScroll();

  const providerId = provider.id;
  const chatMessages = providerChats[providerId] ?? EMPTY_CHAT_MESSAGES;
  const hasMessages = chatMessages.length > 0;

  // track changes in the current streaming message to trigger autoscroll
  const currentMessage = useMemo(() => {
    return chatMessages[chatMessages.length - 1]?.message ?? "";
  }, [chatMessages]);

  // scroll to the bottom if it is near
  useEffect(() => {
    if (!hasMessages) {
      return;
    }
    scrollToBottom();
  }, [hasMessages, chatMessages.length, currentMessage, scrollToBottom]);

  return (
    <section className="rounded-md border bg-background">
      <ScrollArea ref={scrollRef} className={cn("max-h-48 p-2", hasMessages ? "h-48" : "h-auto")}>
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
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/50 text-foreground",
                    )}
                  >
                    <ChatMessage text={message.message} />
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
