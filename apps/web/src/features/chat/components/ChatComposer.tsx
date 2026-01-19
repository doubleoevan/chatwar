import { Button, cn, Textarea } from "@chatwar/ui";
import React, { useCallback, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import { useCredentials } from "@/providers/credentials";
import { useChat } from "@/providers/chat";
import { typedEntries, typedKeys } from "@chatwar/shared";

const MAX_HEIGHT_TEXTAREA = 200;

export function ChatComposer({
  onChat,
  className,
  inputRef: externalInputRef,
}: {
  onChat?: (message: string) => void;
  className?: string;
  inputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const { apiKeys } = useCredentials();
  const { respondingProviderIds, selectedProviderModels, startProviderChat, stopProviderChat } =
    useChat();
  const [message, setMessage] = useState("");

  // use an internal textarea ref for auto resize
  // and set it to the external textarea ref if one is passed in
  const internalInputRef = useRef<HTMLTextAreaElement | null>(null);
  const setInputRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalInputRef.current = node;
      if (externalInputRef) {
        externalInputRef.current = node;
      }
    },
    [externalInputRef],
  );

  const autoResize = () => {
    const textarea = internalInputRef.current;
    if (!textarea) {
      return;
    }
    textarea.style.height = "auto";
    const height = Math.min(textarea.scrollHeight, MAX_HEIGHT_TEXTAREA);
    textarea.style.height = `${height}px`;
    textarea.style.overflowY = textarea.scrollHeight > MAX_HEIGHT_TEXTAREA ? "auto" : "hidden";
  };

  // start a chat for each provider with an api key
  const startChats = useCallback(
    (message: string) => {
      for (const [providerId, providerApiKey] of typedEntries(apiKeys)) {
        const model = selectedProviderModels[providerId];
        if (!providerApiKey || !model) {
          continue;
        }
        startProviderChat({ providerId, providerApiKey, model, message });
      }
    },
    [apiKeys, selectedProviderModels, startProviderChat],
  );

  // stop chats for each provider with an api key
  const stopChats = useCallback(() => {
    for (const providerId of typedKeys(apiKeys)) {
      stopProviderChat(providerId);
    }

    // focus the input after the next render
    requestAnimationFrame(() => {
      internalInputRef?.current?.focus?.();
    });
  }, [apiKeys, stopProviderChat]);

  const isResponding = !!respondingProviderIds.size;
  const isApiKeysEmpty = !Object.keys(apiKeys).length;
  const isInputDisabled = isResponding || isApiKeysEmpty;

  return (
    <form
      onSubmit={(event) => {
        // start chats
        event.preventDefault();
        if (!message.trim()) {
          return;
        }
        onChat?.(message);
        startChats(message);

        // clear the message and reset the textarea height
        setMessage("");
        requestAnimationFrame(autoResize);
      }}
      className={cn("sticky", className)}
    >
      <Textarea
        ref={setInputRef}
        placeholder={isApiKeysEmpty ? "Enter an API key to chat" : "Ask anything"}
        disabled={isInputDisabled}
        rows={1}
        className={cn(
          "rounded-[20px] resize-none pt-2.5 pr-12",
          "min-h-11 max-h-50",
          "overflow-hidden",
        )}
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          requestAnimationFrame(autoResize); // auto-resize immediately
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault(); // submit on enter
            if (!message.trim()) {
              return;
            }
            event.currentTarget.form?.requestSubmit();
          }
        }}
      />

      {isResponding ? (
        <Button
          type="button"
          size="icon"
          className="absolute bottom-4 right-4 h-7 w-7 rounded-full cursor-pointer"
          onClick={stopChats}
          onMouseDown={(event) => event.preventDefault()}
        >
          <Square className="fill-current stroke-none" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim()}
          className="absolute bottom-4 right-4 h-7 w-7 rounded-full cursor-pointer"
        >
          <ArrowUp />
        </Button>
      )}
    </form>
  );
}
