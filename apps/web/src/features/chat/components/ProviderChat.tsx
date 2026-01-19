import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Button, cn, ScrollArea } from "@chatwar/ui";
import { ChevronDownSquare, ChevronUpSquare } from "lucide-react";
import type { Provider } from "@/types/provider";
import { useChat } from "@/providers/chat/useChat";
import { useAutoScroll } from "@/features/chat/hooks/useAutoScroll";
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
  const { scrollRef, scrollToBottom } = useAutoScroll();
  const [isExpanded, setIsExpanded] = useState(false);

  const providerId = provider.id;
  const chatMessages = providerChats[providerId] ?? EMPTY_CHAT_MESSAGES;
  const hasMessages = chatMessages.length > 0;

  // measure content with a ref to set the expanded height
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [expandedHeight, setExpandedHeight] = useState<number>(288); // tailwind class h-72 fallback

  // set the height and expanded height class
  const heightClass = isExpanded ? null : hasMessages ? "h-72" : "h-auto";
  const expandedHeightClass = isExpanded ? null : "max-h-72";

  // track changes in the current streaming message to trigger autoscroll
  const currentMessage = useMemo(() => {
    return chatMessages[chatMessages.length - 1]?.content ?? "";
  }, [chatMessages]);

  // scroll to the bottom if it's near
  useEffect(() => {
    if (!hasMessages) {
      return;
    }
    scrollToBottom();
  }, [hasMessages, chatMessages.length, currentMessage, scrollToBottom]);

  // set the expanded height dynamically
  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!isExpanded || !hasMessages || !content) {
      return;
    }

    // set the expanded height to the content height or viewport height if it's lower
    const measureViewport = () => {
      const contentHeight = content.scrollHeight;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      setExpandedHeight(Math.min(contentHeight, viewportHeight));
    };
    measureViewport();

    // update the expanded height when the window resizes
    const resizeObserver = new ResizeObserver(measureViewport);
    resizeObserver.observe(content);
    window.visualViewport?.addEventListener("resize", measureViewport);
    window.addEventListener("resize", measureViewport);
    return () => {
      resizeObserver.disconnect();
      window.visualViewport?.removeEventListener("resize", measureViewport);
      window.removeEventListener("resize", measureViewport);
    };
  }, [isExpanded, hasMessages, chatMessages.length]);

  // scroll to the bottom after expanding or collapsing
  const updateHeight = () => {
    setIsExpanded((wasExpanded) => {
      if (hasMessages) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            scrollToBottom();
          });
        });
      }
      return !wasExpanded;
    });
  };

  return (
    <section className="relative group rounded-md border bg-background">
      {/* expand collapse button */}
      {hasMessages && (
        <div className="absolute right-2 top-2 z-20">
          <Button
            type="button"
            variant="ghost"
            aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
            onClick={updateHeight}
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
        ref={scrollRef}
        className={cn("p-2", heightClass, expandedHeightClass)}
        style={isExpanded && hasMessages ? { height: expandedHeight } : undefined}
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
          <div ref={contentRef} className="mx-auto max-w-4xl space-y-2">
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
