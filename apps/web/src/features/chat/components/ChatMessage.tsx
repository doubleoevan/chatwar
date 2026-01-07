import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // github flavored markdown

export function ChatMessage({ text }: { text: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
}
