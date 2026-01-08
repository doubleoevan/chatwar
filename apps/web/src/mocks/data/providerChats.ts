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
    "## DeepSeek: Developer-Oriented Responses\n\nDeepSeek often returns **structured, documentation-style Markdown** aimed at engineers.",
    "### Typical Strengths\n\n- Clear explanations\n- Step-by-step breakdowns\n- Code-first answers\n- Minimal fluff",
    "### Example: How Provider Voting Works\n\nThe voting system can be summarized as follows:\n\n1. Collect responses from all providers\n2. Normalize them for display\n3. Allow the user to vote\n4. Persist the result for analytics",
    "Inline code is common when explaining concepts, e.g. `Record<ProviderId, string[]>` or `useAutoScroll()`.",
    '### Sample Implementation\n\n```ts\nimport type { ProviderId } from "@chatwar/shared";\n\nexport function submitVote(providerId: ProviderId) {\n  if (!providerId) {\n    throw new Error("Missing provider id");\n  }\n\n  console.log("Vote submitted for", providerId);\n}\n```\n\nDeepSeek almost always includes a **language hint** on code blocks.',
    "### Data Structures\n\nTables are frequently used to summarize technical tradeoffs:\n\n| Concept        | Purpose                    | Notes                  |\n|---------------|----------------------------|------------------------|\n| ProviderId    | Unique provider identifier | Enum-backed            |\n| Chat message  | Rendered markdown          | Streaming-safe         |\n| Vote payload  | User intent                | Stored server-side     |",
    "⚠️ **Edge cases to consider**:\n\n- Unclosed code fences during streaming\n- Partial JSON snippets\n- Logs mixed with prose",
    "Sometimes you’ll see pseudo-output mixed in:\n\n```text\n[stream] token=42\n[stream] token=43\n[complete] provider=deepseek\n```",
    "Deprecated approaches may be called out explicitly using strikethrough:\n\n~~Parse Markdown into state~~ → Render directly at the UI layer.",
  ],
  perplexity: [
    "Perplexity blends search and generation into a single chat experience.",
    "Its responses often reference recent web data and facts.\n",
    "This provider favors factual accuracy and citation-style replies.",
    "Notice how Perplexity leans toward informative, search-style answers.\n",
    "Ideal for when you want grounded, reference-backed responses.",
  ],
};
