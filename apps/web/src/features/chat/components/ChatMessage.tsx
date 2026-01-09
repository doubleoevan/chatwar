import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub flavored Markdown

export function ChatMessage({ text }: { text: string }) {
  return (
    <article
      className="
        max-w-none
        text-[16px]
        leading-[1.65]
        tracking-[-0.015em]
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: (props) => <p className="my-2 leading-[1.65]" {...props} />,
          strong: (props) => <strong {...props} />,
          em: (props) => <em {...props} />,
          h2: (props) => (
            <h2 className="mt-1 mb-3 text-[20px] font-semibold leading-tight" {...props} />
          ),
          h3: (props) => (
            <h3 className="mt-4 mb-2 text-[17px] font-semibold leading-tight" {...props} />
          ),
          h4: (props) => (
            <h4 className="mt-3 mb-1 text-[16px] font-semibold leading-tight" {...props} />
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </article>
  );
}
