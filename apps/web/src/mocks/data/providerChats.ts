import type { ProviderId } from "@chatwar/shared";

export const PROVIDER_CHATS: Record<ProviderId, string[]> = {
  openai: [
    "Certainly! Let's walk through the main differences between providers in ChatWar.\n",
    "Here's a quick overview of the architecture behind provider voting.\n",
    "In simple terms, each provider generates a response, and the user gets to vote.\n",
    "OpenAI’s models tend to be highly accurate, but slower than some others.\n",
    "We aggregate all the provider responses before enabling user voting.\n",
  ],
  anthropic: [
    "Absolutely. Claude models are designed for safe, aligned interactions.\n",
    "The streaming mechanism allows Claude to generate content token by token.\n",
    "Anthropic responses typically favor thoughtful, nuanced replies.\n",
    "Voting helps determine which provider performed best for the prompt.\n",
  ],
  gemini: [
    "Gemini is optimized for high-speed responses across long context windows.\n",
    "Its real strength lies in contextual coherence over extended conversations.\n",
    "Let's explore how Gemini performs compared to Claude or GPT-4.\n",
    "You’ll notice Gemini prioritizes concise answers unless prompted otherwise.\n",
  ],
  xai: [
    "Grok by xAI tends to offer edgy and informal takes on your query.\n",
    "The streaming speed is solid, though results can vary across topics.\n",
    "Let’s see how Grok responds compared to Gemini or GPT-4.\n",
    "Elon’s team designed this one to be a bit more opinionated.\n",
  ],
  deepseek: [
    "DeepSeek excels at developer-focused prompts and technical breakdowns.\n",
    "If you're writing code, you might find DeepSeek surprisingly helpful.\n",
    "This provider emphasizes clarity and structured responses.\n",
    "DeepSeek often outperforms others in documentation-style answers.\n",
    "Let's see how it handles this use case in comparison.\n",
  ],
  perplexity: [
    "Perplexity blends search and generation into a single chat experience.\n",
    "Its responses often reference recent web data and facts.\n",
    "This provider favors factual accuracy and citation-style replies.\n",
    "Notice how Perplexity leans toward informative, search-style answers.\n",
    "Ideal for when you want grounded, reference-backed responses.\n",
  ],
};
