import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@chatwar/ui";
import { useState } from "react";
import { useCredentials } from "@/providers/credentials";
import { useChat } from "@/providers/chat/useChat";

export function ProviderModelSelect({
  provider,
  onModelSelect,
  className,
}: {
  provider: Provider;
  onModelSelect?: (providerId: ProviderId, modelId: string) => void;
  className?: string;
}) {
  const { providerModels, loadingProviderIds } = useCredentials();
  const { respondingProviderIds, votingProviderIds } = useChat();
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  // hide the select while loading responding or voting
  const isLoading = loadingProviderIds.has(provider.id);
  const isResponding = respondingProviderIds.has(provider.id);
  const isVoting = votingProviderIds.has(provider.id);
  const modelsMetadata = providerModels[provider.id];
  const selectedModelId = modelId ?? modelsMetadata?.defaultModelId;
  if (isLoading || isResponding || isVoting || !selectedModelId) {
    return null;
  }

  return (
    <Select
      value={selectedModelId}
      onValueChange={(modelId) => {
        setModelId(modelId);
        onModelSelect?.(provider.id, modelId);
      }}
    >
      <SelectTrigger
        className={cn(
          `h-6
          w-auto
          inline-flex
          px-2
          py-0
          text-xs
          gap-2
        `,
          className,
        )}
        aria-label={`${provider.label} model`}
      >
        <SelectValue placeholder="Select a model…" />
      </SelectTrigger>

      <SelectContent
        align="start"
        sideOffset={8}
        className="w-auto min-w-(--radix-select-trigger-width)"
      >
        {modelsMetadata?.models.map((model) => (
          <SelectItem key={model.id} value={model.id}>
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
