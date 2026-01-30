import { useEffect, useMemo, useRef, useState } from "react";
import { Button, cn, ScrollArea } from "@chatwar/ui";
import { ChevronDownSquare, ChevronUpSquare } from "lucide-react";
import type { Provider } from "@/types/provider";
import { useChat } from "@/providers/chat/useChat";
import { ChatMessage } from "@/features/chat/components/ChatMessage";
import type { ChatMessage as ChatMessageType } from "@chatwar/shared";

const EMPTY_CHAT_MESSAGES: readonly ChatMessageType[] = [];

export function ProviderChat({
  provider,
  onStartChatClick,
}: {
  provider: Provider;
  onStartChatClick?: (providerId: Provider["id"]) => void;
}) {
  const { providerChats } = useChat();
  const [isExpanded, setIsExpanded] = useState(false);

  const providerId = provider.id;
  const chatMessages = providerChats[providerId] ?? EMPTY_CHAT_MESSAGES;
  const hasMessages = chatMessages.length > 0;

  // track changes in the current streaming message to trigger autoscroll
  const currentMessage = useMemo(() => {
    return chatMessages[chatMessages.length - 1]?.content ?? "";
  }, [chatMessages]);

  // use an anchor ref to scroll to the bottom as message tokens arrive
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMessages) {
      return;
    }

    // get the scroll area viewport element
    const scrollArea = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    ) as HTMLDivElement | null;
    if (!scrollArea) {
      return;
    }

    // scroll to the bottom to see new message tokens as they arrive
    scrollArea.scrollTo({
      top: scrollArea.scrollHeight,
      behavior: "auto",
    });
  }, [hasMessages, chatMessages.length, currentMessage]);

  return (
    <section className="relative group rounded-md border bg-background">
      {/* expand collapse button */}
      {hasMessages && (
        <div className="absolute right-2 top-2 z-20">
          <Button
            type="button"
            variant="ghost"
            aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="
              rounded-md
              items-center
              bg-accent
              opacity-0 group-hover:opacity-90 hover:opacity-100
              cursor-pointer
            "
          >
            {isExpanded ? (
              <>
                collapse
                <ChevronUpSquare />
              </>
            ) : (
              <>
                expand
                <ChevronDownSquare />
              </>
            )}
          </Button>
        </div>
      )}

      {/* scrolling chat area */}
      <ScrollArea
        ref={scrollAreaRef}
        className={cn("p-2", isExpanded ? "h-[80vh]" : hasMessages ? "h-72" : "h-auto")}
      >
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
          <div className="mx-auto max-w-4xl space-y-2">
            {chatMessages.map((message, index) => {
              const isUser = message.role === "user";
              return (
                <div key={index} className={cn("flex", isUser ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "rounded-xl p-2 wrap-break-word",
                      isUser
                        ? "max-w-[85%] bg-primary text-primary-foreground py-0"
                        : "w-full bg-background text-foreground",
                    )}
                  >
                    <ChatMessage text={message.content} />
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
