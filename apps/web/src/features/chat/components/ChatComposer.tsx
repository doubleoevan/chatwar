import { Button, cn, Textarea } from "@chatwar/ui";
import React, { useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { useCredentials } from "@/providers/credentials";
import { useChat } from "@/providers/chat";
import { typedEntries } from "@/utils/object";

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
  const { selectedProviderModels, startProviderChat } = useChat();
  const [message, setMessage] = useState("");

  // use an internal textarea ref for auto resize
  // and set it to the external textarea ref if one is passed in
  const internalInputRef = useRef<HTMLTextAreaElement | null>(null);
  const setInputRef = (node: HTMLTextAreaElement | null) => {
    internalInputRef.current = node;
    if (externalInputRef) {
      externalInputRef.current = node;
    }
  };

  const isInputDisabled = !Object.keys(apiKeys).length;
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

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onChat?.(message);

        // start a chat for each providers with an api key
        for (const [providerId, providerApiKey] of typedEntries(apiKeys)) {
          const model = selectedProviderModels[providerId];
          if (!providerApiKey || !model) {
            return;
          }
          startProviderChat({ providerId, providerApiKey, model, message });
        }

        // clear the message and reset the textarea height
        setMessage("");
        requestAnimationFrame(autoResize);
      }}
      className={cn("sticky", className)}
    >
      <Textarea
        ref={setInputRef}
        placeholder={isInputDisabled ? "Enter an API key to chat" : "Ask anything"}
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

      <Button
        type="submit"
        size="icon"
        disabled={!message.trim()}
        className="absolute bottom-4 right-4 h-7 w-7 rounded-full cursor-pointer"
      >
        <ArrowUp />
      </Button>
    </form>
  );
}
