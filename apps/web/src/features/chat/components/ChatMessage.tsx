import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub flavored Markdown

export function ChatMessage({ text }: { text: string }) {
  return (
    <article
      className="
        prose max-w-none
        text-[17px] leading-[1.6]

        prose-p:my-2
        prose-p:leading-[1.6]
        prose-strong:font-semibold
      "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </article>
  );
}
