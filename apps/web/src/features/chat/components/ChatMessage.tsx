import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub flavored Markdown

const components: Components = {
  p: (props) => <p className="my-2 leading-[1.65]" {...props} />,
  strong: (props) => <strong {...props} />,
  em: (props) => <em {...props} />,
  h2: (props) => <h2 className="mt-1 mb-3 text-[20px] font-semibold leading-tight" {...props} />,
  h3: (props) => <h3 className="mt-4 mb-2 text-[17px] font-semibold leading-tight" {...props} />,
  h4: (props) => <h4 className="mt-3 mb-1 text-[16px] font-semibold leading-tight" {...props} />,
  ul: (props) => <ul className="my-2 ml-5 list-disc space-y-1" {...props} />,
  ol: (props) => <ol className="my-2 ml-5 list-decimal space-y-1" {...props} />,
  li: (props) => <li className="leading-[1.6]" {...props} />,
  blockquote: (props) => (
    <blockquote
      className="
          my-3
          border-l-2
          border-border
          pl-3
          text-muted-foreground
          leading-[1.6]
        "
      {...props}
    />
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = typeof className === "string" && className.includes("language-");
    if (isBlock) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code
        className="
            rounded-md
            bg-background
            p-1.5
            font-mono
            text-[0.9em]
            text-foreground/80
          "
        {...props}
      >
        {children}
      </code>
    );
  },
};

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
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </article>
  );
}
