import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@chatwar/ui";
import { useState } from "react";
import { useCredentials } from "@/providers/credentials";

export function ProviderModelSelect({
  provider,
  onModelSelect,
  className,
}: {
  provider: Provider;
  onModelSelect?: (providerId: ProviderId, modelId: string) => void;
  className?: string;
}) {
  const { providerModels } = useCredentials();
  const [modelId, setModelId] = useState<string | undefined>(undefined);

  // hide the select while loading
  const modelsMetadata = providerModels[provider.id];
  const selectedModelId = modelId ?? modelsMetadata?.defaultModelId;
  if (!selectedModelId) {
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
