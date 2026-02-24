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
import { PROVIDERS, typedKeys } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { RemoveApiKeyButton } from "@/features/chat/components/RemoveApiKeyButton";
import { ProviderModelSelect } from "@/features/chat/components/ProviderModelSelect";
import { useCallback, useMemo, useRef, useState } from "react";
import { ChatComposer } from "@/features/chat/components/ChatComposer";
import { ProviderIcon } from "@/features/chat/components/ProviderIcon";
import { sortProviders } from "@/utils/provider";

export function ChatPage() {
  const { apiKeys } = useCredentials();
  const [openProviderIds, setOpenProviderIds] = useState<Set<ProviderId>>(new Set());
  const [shuffleSeed, setShuffleSeed] = useState(0);

  // sort providers with api keys to the top
  // shuffle if providers need to be voted on using a new seed for each round
  const providers = useMemo(() => PROVIDERS.map((id) => PROVIDER_CONFIGURATIONS[id]), []);
  const sortedProviders = useMemo(() => {
    return sortProviders(providers, apiKeys, shuffleSeed);
  }, [providers, apiKeys, shuffleSeed]);

  const openProvider = useCallback((providerId: ProviderId) => {
    setOpenProviderIds((providerIds) => {
      if (providerIds.has(providerId)) {
        return providerIds;
      }
      return new Set([...providerIds, providerId]);
    });
  }, []);

  const closeProvider = useCallback((providerId: ProviderId) => {
    setOpenProviderIds((providerIds) => {
      if (!providerIds.has(providerId)) {
        return providerIds;
      }
      const nextProviderIds = new Set([...providerIds]);
      nextProviderIds.delete(providerId);
      return nextProviderIds;
    });
  }, []);

  // opens the passed in providers and closes all other providers
  const openProviders = useCallback(
    (providerIds: ProviderId[]) => {
      const ids = new Set(providerIds);
      for (const provider of providers) {
        const providerId = provider.id;
        if (ids.has(providerId)) {
          openProvider(providerId);
        } else {
          closeProvider(providerId);
        }
      }
    },
    [providers, openProvider, closeProvider],
  );

  const onChat = useCallback(() => {
    // choose a new shuffle seed for each vote round
    setShuffleSeed((seed) => seed + 1);

    // open providers with api keys and close others
    const providerIds = typedKeys(apiKeys);
    openProviders(providerIds);
  }, [apiKeys, openProviders]);

  // focus the input in the composer component with a ref
  const composerInputRef = useRef<HTMLTextAreaElement | null>(null);
  const focusComposerInput = useCallback(() => {
    // defer until the accordion/layout settles
    requestAnimationFrame(() => {
      composerInputRef.current?.focus();
    });
  }, []);

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
              <Card className="p-0 gap-0 bg-accent dark:bg-muted relative">
                <header className="relative px-3 pt-2.5 min-h-10">
                  <AccordionTrigger className="w-full p-0 text-sm font-medium">
                    <ProviderIcon
                      provider={provider}
                      className="w-full"
                      onVoteResponse={(providerId) => {
                        openProviders([providerId]);
                      }}
                    />
                  </AccordionTrigger>

                  {apiKeys[provider.id] && (
                    <>
                      <ProviderModelSelect
                        provider={provider}
                        className="absolute right-20 top-1/2 -translate-y-1/2 w-auto"
                      />
                      <RemoveApiKeyButton
                        provider={provider}
                        className="
                          absolute right-10 top-5 -translate-y-1/2
                          h-6 w-6
                        "
                        onApiKeyRemove={(providerId) => {
                          closeProvider(providerId);
                        }}
                      />
                    </>
                  )}
                </header>

                <AccordionContent className="pt-0 pb-2">
                  <CardContent className="px-2 py-0 m-0">
                    {apiKeys[provider.id] ? (
                      <ProviderChat provider={provider} onStartChatClick={focusComposerInput} />
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
      <ChatComposer className="p-2 mb-3.5 mt-3" inputRef={composerInputRef} onChat={onChat} />
    </section>
  );
}
