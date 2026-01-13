import type { ProviderId } from "@chatwar/shared";
import type { Provider } from "@/types/provider";
import { cn, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@chatwar/ui";
import { useCredentials } from "@/providers/credentials";
import { useChat } from "@/providers/chat";

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
  const { selectProviderModel, selectedProviderModels, respondingProviderIds, votingProviderIds } =
    useChat();

  // hide the select while loading, responding or voting
  const isLoading = loadingProviderIds.has(provider.id);
  const isResponding = respondingProviderIds.has(provider.id);
  const isVoting = votingProviderIds.has(provider.id);
  const modelsMetadata = providerModels[provider.id];
  const modelId = selectedProviderModels[provider.id]?.id ?? modelsMetadata?.defaultModelId;
  if (isLoading || isResponding || isVoting || !modelsMetadata || !modelId) {
    return null;
  }

  return (
    <Select
      value={modelId}
      onValueChange={(modelId) => {
        const model = modelsMetadata.models.find((model) => model.id === modelId);
        if (!model) {
          return;
        }
        selectProviderModel(provider.id, model);
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
          bg-background
          cursor-pointer
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
        className="w-auto min-w-(--radix-select-trigger-width) bg-background"
      >
        {modelsMetadata.models.map((model) => (
          <SelectItem key={model.id} value={model.id} className="cursor-pointer">
            {model.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
