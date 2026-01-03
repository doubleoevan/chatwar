import { Button, cn, Textarea } from "@chatwar/ui";
import { useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";

const MAX_HEIGHT_TEXTAREA = 200;

export function ChatComposer({
  onChat,
  className,
}: {
  onChat?: (message: string) => void;
  className?: string;
}) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const autoResize = () => {
    const textarea = textareaRef.current;
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
      }}
      className={cn("sticky", className)}
    >
      <Textarea
        ref={textareaRef}
        placeholder="Ask anything"
        rows={1}
        className={cn("resize-none pr-12", "min-h-11 max-h-50", "overflow-hidden")}
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          requestAnimationFrame(autoResize); // auto-resize immediately
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            onChat?.(message);
          }
        }}
      />

      <Button
        type="submit"
        size="icon"
        disabled={!message.trim()}
        className="absolute bottom-4 right-4 h-7 w-7"
      >
        {message.trim().length ? <ArrowUp /> : <Square />}
      </Button>
    </form>
  );
}
