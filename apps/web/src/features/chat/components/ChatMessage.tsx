import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub flavored Markdown

export function ChatMessage({ text }: { text: string }) {
  return (
    <article
      className="
        prose max-w-none
        text-[16px]
        leading-[1.65]
        tracking-[-0.015em]

        prose-p:my-2
        prose-strong:font-medium
        prose-strong:text-foreground/90
        prose-em:not-italic
        prose-em:text-muted-foreground
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </article>
  );
}
