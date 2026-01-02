import { useState } from "react";
import { type Provider } from "@chatwar/shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
  Input,
} from "@chatwar/ui";

export function ProviderCredentials({ provider }: { provider: Provider }) {
  const [apiKey, setApiKey] = useState("");
  const { Icon } = provider;

  return (
    <section aria-labelledby={`provider-${provider.id}-heading`} className="mb-2">
      <Accordion type="single" collapsible>
        <AccordionItem value={provider.id} className="border-0">
          <Card className="p-0 gap-0 bg-muted/70 dark:bg-muted">
            <AccordionTrigger className="px-3 py-2 text-sm font-medium">
              <div className="flex items-center gap-2">
                <span aria-hidden>
                  <Icon />
                </span>
                <h2 id={`provider-${provider.id}-heading`}>{provider.label}</h2>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pt-0 pb-2">
              <CardContent className="px-2 py-0 m-0">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!apiKey) {
                      return;
                    }
                    // saveApiKey(provider.id, apiKey);
                  }}
                  className="relative"
                >
                  <Input
                    id={`${provider.id}-key`}
                    type="password"
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
                    disabled={!apiKey}
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
              </CardContent>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
