import type { ProviderId } from "@chatwar/shared";

export const PROVIDER_CHATS: Record<ProviderId, string[]> = {
  openai: [
    "Certainly! Let's walk through the main differences between providers in ChatWar.",
    "Here's a quick overview of the architecture behind provider voting.\n",
    "In simple terms, each provider generates a response, and the user gets to vote.",
    "OpenAI’s models tend to be highly accurate, but slower than some others.\n",
    "We aggregate all the provider responses before enabling user voting.",
  ],
  anthropic: [
    "Absolutely. Claude models are designed for safe, aligned interactions.",
    "The streaming mechanism allows Claude to generate content token by token.\n",
    "Anthropic responses typically favor thoughtful, nuanced replies.",
    "Voting helps determine which provider performed best for the prompt.",
  ],
  gemini: [
    "Gemini is optimized for high-speed responses across long context windows.",
    "Its real strength lies in contextual coherence over extended conversations.\n",
    "Let's explore how Gemini performs compared to Claude or GPT-4.",
    "You’ll notice Gemini prioritizes concise answers unless prompted otherwise.",
  ],
  xai: [
    "Grok by xAI tends to offer edgy and informal takes on your query.",
    "The streaming speed is solid, though results can vary across topics.\n",
    "Let’s see how Grok responds compared to Gemini or GPT-4.",
    "Elon’s team designed this one to be a bit more opinionated.",
  ],
  deepseek: [
    // headings + bold + paragraphs
    "## DeepSeek: Developer-Oriented Responses\n\nDeepSeek often returns **structured, documentation-style Markdown** aimed at engineers.\n\nThis second paragraph checks paragraph spacing and rhythm.\n\n",
    // headings + list + nested list
    "### Typical Strengths\n\n- Clear explanations\n- Step-by-step breakdowns\n- Code-first answers\n- Minimal fluff\n  - Nested bullet\n  - Another nested bullet\n\n",
    // ordered list
    "### Example: How Provider Voting Works\n\nThe voting system can be summarized as follows:\n\n1. Collect responses from all providers\n2. Normalize them for display\n3. Allow the user to vote\n4. Persist the result for analytics\n\n",
    // inline code + emphasis + strikethrough
    "Inline code is common when explaining concepts, e.g. `Record<ProviderId, string[]>`, `useAutoScroll()`, and `scrollToBottom()`.\n\nSometimes they’ll call out ~~bad ideas~~ and *lightly emphasize* alternatives.\n\n",
    // blockquote + emoji
    "### Callouts\n\n> ⚠️ Treat streaming as an adversarial input. Render defensively.\n\nNormal text resumes here.\n\n",
    "### Emoji / Unicode\n\nEmoji inline should not jump or resize text: 😄🔥🚀 ✅\n\nUnicode symbols should render cleanly: → ← • ✓ © ™ — …\n\n",
    // fenced code block with language hint + backticks inside string
    '### Sample Implementation\n\n```ts\nimport type { ProviderId } from "@chatwar/shared";\n\nexport function submitVote(providerId: ProviderId) {\n  if (!providerId) {\n    throw new Error("Missing provider id");\n  }\n\n  const tricky = "`backticks` inside a string";\n  console.log("Vote submitted for\n\n", providerId, tricky);\n}\n```\n\nDeepSeek almost always includes a **language hint** on code blocks.',
    // fenced code block WITHOUT language hint
    "### Code Fence Without Language\n\n```\nconsole.log('no language hint here');\n```\n\n",
    // tables (GFM)
    "### Data Structures\n\nTables are frequently used to summarize technical tradeoffs:\n\n| Concept        | Purpose                    | Notes                  |\n|---------------|----------------------------|------------------------|\n| ProviderId    | Unique provider identifier | Enum-backed            |\n| Chat message  | Rendered markdown          | Streaming-safe         |\n| Vote payload  | User intent                | Stored server-side     |\n\n",
    // JSON mixed with prose (not fenced)
    '### Mixed JSON\n\nResult payload (often inline, not fenced):\n\n{"ok":true,"count":3,"provider":"deepseek"}\n',
    // pseudo-output in text fence
    "Sometimes you’ll see pseudo-output mixed in:\n\n```text\n[stream] token=42\n[stream] token=43\n[complete] provider=deepseek\n```\n\n",
    // HTML-ish content (should render as text, not execute)
    '### HTML-ish Content\n\nSome models output snippets like `<div class="note">hello</div>`.\n\nIt should be treated as plain text.',
    // --- intentionally broken / streaming partials (key for streaming) ---
    // unclosed emphasis
    "### Streaming Partial: Unclosed Bold\n\nThis chunk ends mid token: **bold starts here\n\n",
    // unclosed inline code
    "### Streaming Partial: Unclosed Inline Code\n\nHere is `inline code that never closes\n\n",
    // code fence started but not closed (classic streaming case)
    "### Streaming Partial: Unclosed Code Fence\n\n```ts\nexport function partialFence() {\n  return 123;\n}\n\n",
    // table header started but incomplete
    "### Streaming Partial: Incomplete Table\n\n| A | B |\n|---|\n\n",
    // list that may continue next chunk
    "### Streaming Partial: List Continues\n\n- item one\n- item two\n- item three\n\n",
  ],
  perplexity: [
    "Perplexity blends search and generation into a single chat experience.",
    "Its responses often reference recent web data and facts.\n",
    "This provider favors factual accuracy and citation-style replies.",
    "Notice how Perplexity leans toward informative, search-style answers.\n",
    "Ideal for when you want grounded, reference-backed responses.",
  ],
};
