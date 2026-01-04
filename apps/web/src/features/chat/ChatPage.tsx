import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Card,
  CardContent,
} from "@chatwar/ui";

import { ProviderChat } from "@/features/chat/components/ProviderChat";
import { useCredentials } from "@/providers/credentials";
import { ProviderCredentials } from "@/features/chat/components/ProviderCredentials";

import type { ProviderId } from "@chatwar/shared";
import { PROVIDERS } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { RemoveApiKeyButton } from "@/features/chat/components/RemoveApiKeyButton";
import { ProviderModelSelect } from "@/features/chat/components/ProviderModelSelect";
import { useState } from "react";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ProviderIcon } from "@/features/chat/components/ProviderIcon";
import { sortProviders } from "@/utils/provider";

export function ChatPage() {
  const [openProviderIds, setOpenProviderIds] = useState<Set<ProviderId>>(new Set());
  const { apiKeys } = useCredentials();

  // sort providers with api keys to the top
  // shuffle if providers need to be voted on
  const providers = PROVIDERS.map((id) => PROVIDER_CONFIGURATIONS[id]);
  const sortedProviders = sortProviders(providers, apiKeys);

  return (
    <section aria-labelledby="chat-heading">
      <h1 id="chat-heading" className="sr-only">
        Chat
      </h1>
      <Accordion
        type="multiple"
        className="pt-2"
        value={[...openProviderIds]}
        onValueChange={(providerIds: ProviderId[]) => setOpenProviderIds(new Set([...providerIds]))}
      >
        {sortedProviders.map((provider) => {
          return (
            <AccordionItem
              key={`${provider.id}`}
              value={provider.id}
              className="mb-2 mx-2 border-0"
            >
              <Card className="p-0 gap-0 bg-muted/70 dark:bg-muted relative">
                <header className="relative px-3 py-2">
                  <AccordionTrigger className="w-full p-0 text-sm font-medium">
                    <ProviderIcon
                      provider={provider}
                      className="w-full"
                      onVoteResponse={(providerId) => {
                        setOpenProviderIds(new Set([...openProviderIds, providerId]));
                      }}
                    />
                  </AccordionTrigger>

                  {apiKeys[provider.id] && (
                    <>
                      <ProviderModelSelect
                        provider={provider}
                        className="absolute right-20 top-1/2 -translate-y-1/2 w-auto"
                        onModelSelect={(providerId) => {
                          setOpenProviderIds(new Set([...openProviderIds, providerId]));
                        }}
                      />
                      <RemoveApiKeyButton
                        provider={provider}
                        className="
                          absolute right-10 top-5 -translate-y-1/2
                          h-6 w-6
                        "
                        onApiKeyRemove={(providerId) => {
                          openProviderIds.delete(providerId);
                          setOpenProviderIds(new Set([...openProviderIds]));
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
      <ChatComposer className="p-2 mb-3.5 mt-3" />
    </section>
  );
}
