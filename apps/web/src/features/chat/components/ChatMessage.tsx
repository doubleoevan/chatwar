import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // GitHub flavored Markdown
import rehypeHighlight from "rehype-highlight"; // Code syntax highlighting
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { normalizeMarkdown } from "@/utils/markdown";

// block potential javascript links and XSS
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "br"],
  attributes: {
    ...(defaultSchema.attributes ?? {}),
    a: ["href", "title", "target", "rel"],
  },
};

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

  // code with syntax highlighting
  code: ({ className, children, ...props }) => {
    if (className) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="
          w-fit
          rounded-md
          bg-accent/50
          font-mono
          text-[0.9em]
          text-foreground/90
          whitespace-nowrap
        "
        {...props}
      >
        {children}
      </code>
    );
  },

  pre: (props) => (
    <pre
      className="
        w-fit
        mt-3 mb-1
        p-2
        overflow-x-auto
        rounded-lg
        bg-accent/50
        text-[13px]
        leading-5
      "
      {...props}
    />
  ),

  table: (props) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-[14px]" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-border" {...props} />,
  tr: (props) => <tr className="border-b last:border-0" {...props} />,
  th: (props) => (
    <th
      className="
        border-r last:border-r-0
        px-3 py-2
        text-left
        font-semibold
        text-foreground/90
        whitespace-nowrap
      "
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="
        border-r last:border-r-0
        px-3 py-2
        align-top
        text-foreground/80
      "
      {...props}
    />
  ),
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
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, sanitizeSchema],
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
        components={components}
      >
        {normalizeMarkdown(text)}
      </ReactMarkdown>
    </article>
  );
}
