import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
} from "@chatwar/ui";

import { ProviderChat } from "@/features/chat/components/ProviderChat";
import { useApiKeys } from "@/providers/credentials";
import { ProviderCredentials } from "@/features/chat/components/ProviderCredentials";
import { Spinner } from "@/components/Spinner";

import { ProviderId, PROVIDERS } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { RemoveApiKeyButton } from "@/features/chat/components/RemoveApiKeyButton";
import { ProviderModelSelect } from "@/features/chat/components/ProviderModelSelect";
import { useState } from "react";

export function ChatPage() {
  const [openProviderIds, setOpenProviderIds] = useState<Set<ProviderId>>(new Set());
  const { apiKeys, loadingProviderIds } = useApiKeys();

  // sort providers with api keys to the top
  const providers = PROVIDERS.map((id) => PROVIDER_CONFIGURATIONS[id]);
  const sortedProviders = [
    ...providers.filter((provider) => apiKeys[provider.id]),
    ...providers.filter((provider) => !apiKeys[provider.id]),
  ];

  return (
    <section aria-labelledby="chat-heading">
      <h1 id="chat-heading" className="sr-only">
        Chat
      </h1>
      <Accordion
        type="multiple"
        value={Array.from(openProviderIds)}
        onValueChange={(providerIds: ProviderId[]) => setOpenProviderIds(new Set([...providerIds]))}
      >
        {sortedProviders.map((provider) => {
          const { Icon } = provider;
          return (
            <AccordionItem
              key={`${provider.id}`}
              value={provider.id}
              className="mb-2 mx-2 border-0"
            >
              <Card className="p-0 gap-0 bg-muted/70 dark:bg-muted relative">
                <header className="relative px-3 py-2">
                  <AccordionTrigger className="w-full p-0 text-sm font-medium">
                    <div className="flex w-full items-center gap-2 pr-44">
                      <span aria-hidden>
                        {loadingProviderIds.has(provider.id) ? (
                          <Spinner>
                            <Icon />
                          </Spinner>
                        ) : (
                          <Icon />
                        )}
                      </span>
                      <h2 id={`provider-${provider.id}-heading`}>{provider.label}</h2>
                    </div>
                  </AccordionTrigger>

                  {apiKeys[provider.id] && (
                    <>
                      <ProviderModelSelect
                        provider={provider}
                        className="absolute right-20 top-1/2 -translate-y-1/2 w-auto"
                        onModelSelect={(providerId, modelId) => {
                          console.log(modelId);
                          setOpenProviderIds(new Set([...openProviderIds, providerId]));
                        }}
                      />
                      <RemoveApiKeyButton
                        provider={provider}
                        className="
                          absolute right-10 top-4.5 -translate-y-1/2
                          h-6 w-6
                        "
                        onApiKeyRemove={(providerId) => {
                          setOpenProviderIds(new Set([...openProviderIds, providerId]));
                        }}
                      />
                    </>
                  )}
                </header>

                <AccordionContent className="pt-0 pb-2">
                  <CardContent className="px-2 py-0 m-0">
                    {apiKeys[provider.id] ? (
                      <ProviderChat provider={provider} />
                    ) : (
                      <ProviderCredentials provider={provider} />
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
