import { useState } from "react";

import type { Provider } from "@/types/provider";
import { Input } from "@chatwar/ui";

import { useCredentials } from "@/providers/credentials";

export function ProviderCredentials({ provider }: { provider: Provider }) {
  const [apiKey, setApiKey] = useState("");
  const { saveApiKey, loadingProviderIds } = useCredentials();

  return (
    <section>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!apiKey) {
            return;
          }
          saveApiKey(provider.id, apiKey);
        }}
        className="relative"
      >
        <Input
          id={`${provider.id}-key`}
          type="password"
          disabled={loadingProviderIds.has(provider.id)}
          placeholder="Enter your API key"
          name="apiKey"
          className="
            rounded-full
            bg-background
            border border-input
            focus-visible:outline-none
            focus-visible:ring-0
            focus-visible:border-ring
          "
          autoComplete="off"
          value={apiKey}
          onChange={(event) => setApiKey(event.target.value)}
        />
        <button
          type="submit"
          disabled={!apiKey || loadingProviderIds.has(provider.id)}
          aria-label="Save your API key"
          className="
            absolute right-1.5 top-1/2 -translate-y-1/2
            h-6 w-6 rounded-full
            bg-primary text-primary-foreground
            hover:bg-primary/90
            disabled:bg-muted disabled:text-muted-foreground
            disabled:cursor-not-allowed
            focus-visible:ring-2 focus-visible:ring-ring
            transition
            cursor-pointer
          "
        >
          →
        </button>
      </form>
      <a
        href={provider.apiKeyUrl}
        target="_blank"
        rel="noreferrer"
        className="block pt-2 px-1 pb-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        Get your {provider.label} API key →
      </a>
    </section>
  );
}
