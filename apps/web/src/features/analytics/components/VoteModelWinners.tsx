import { cn } from "@chatwar/ui";
import type { ChartData, ChartOptions, TooltipItem } from "chart.js";
import { Pie } from "react-chartjs-2";

import type { ProviderId, ProviderModelVoteResponse } from "@chatwar/shared";
import { typedKeys } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { useAnalytics } from "@/providers/analytics";
import { useTheme } from "@/providers/theme";
import { useLoadingRefresh } from "@/features/analytics/hooks/useLoadingRefresh";
import { getTooltip } from "@/features/analytics/chart/providerTooltip";
import { toCssColor } from "@/utils/color";

type ProviderModelKey = `${ProviderId}:${string}`;
type ProviderModelWins = {
  providerId: ProviderId;
  modelId: string;
  modelLabel: string;
  wins: number;
};

export function VoteModelWinners({
  className,
  options,
}: {
  className?: string;
  options?: ChartOptions<"pie">;
}) {
  const { theme } = useTheme();
  const { votes, isAnalyticsLoading } = useAnalytics();
  const refreshCount = useLoadingRefresh(isAnalyticsLoading);

  // map provider models to their win counts
  const providerModelWins = new Map<ProviderModelKey, ProviderModelWins>();
  for (const vote of (votes ?? []) as ProviderModelVoteResponse[]) {
    const { winnerProviderId, winnerModelId, winnerModelLabel } = vote;
    const providerModel = `${winnerProviderId}:${winnerModelId}` as const;
    const wins = providerModelWins.get(providerModel);
    if (wins) {
      wins.wins += 1;
    } else {
      providerModelWins.set(providerModel, {
        providerId: winnerProviderId,
        modelId: winnerModelId,
        modelLabel: winnerModelLabel,
        wins: 1,
      });
    }
  }

  // group and sort wins by provider
  const modelWins = Array.from(providerModelWins.values());
  const providerIds: ProviderId[] = typedKeys(PROVIDER_CONFIGURATIONS);
  const providerIndices = new Map<ProviderId, number>(
    providerIds.map((providerId, index) => [providerId, index]),
  );
  modelWins.sort((firstWin, secondWin) => {
    const firstIndex = providerIndices.get(firstWin.providerId) ?? Number.POSITIVE_INFINITY; // push unknown providers to the end
    const secondIndex = providerIndices.get(secondWin.providerId) ?? Number.POSITIVE_INFINITY;
    if (firstIndex !== secondIndex) {
      return firstIndex - secondIndex;
    }
    return firstWin.modelLabel.localeCompare(secondWin.modelLabel);
  });

  // set chart data
  const totalWins = modelWins.reduce((sum, model) => sum + model.wins, 0);
  const modelLabels = modelWins.map((model) => model.modelLabel);
  const data = modelWins.map((model) => model.wins);
  const colors = modelWins.map((model) => PROVIDER_CONFIGURATIONS[model.providerId].color);
  const isDark = theme === "dark";
  const chartData: ChartData<"pie"> = {
    labels: modelLabels,
    datasets: [
      {
        data,
        backgroundColor: colors.map((color) => toCssColor(color)),
        hoverBackgroundColor: colors.map((color) => toCssColor(color, 0.7)),
        borderWidth: 1,
        borderColor: isDark ? "#e5e7eb" : "#eceff6",
        hoverOffset: 8,
      },
    ],
  };

  // set chart options
  const getProviderId = (context: TooltipItem<"pie">) => modelWins[context.dataIndex]?.providerId;
  const chartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10,
    },
    animation: false,
    onHover: (_event, elements, chart) => {
      chart.canvas.style.cursor = elements.length ? "pointer" : "default";
    },
    plugins: {
      legend: { display: false },
      tooltip: getTooltip({
        isDark,
        getProviderId,
        options: {
          position: "nearest",
          filter: (context) => context.parsed !== 0,
          // @ts-expect-error - partial tooltip callbacks are okay at runtime
          callbacks: {
            title(items) {
              const i = items?.[0]?.dataIndex ?? 0;
              return modelLabels[i] ?? "";
            },
            label(context) {
              const model = modelWins[context.dataIndex];
              if (!model) {
                return "";
              }
              const wins = model.wins;
              const percentage = totalWins > 0 ? Math.round((wins / totalWins) * 100) : 0;
              return `  ${percentage}% – ${wins} ${wins === 1 ? "win" : "wins"}`;
            },
          },
        },
      }),
    },
    ...options,
  };

  // return the pie chart
  return (
    <div className={cn("p-2 items-center justify-center", className)}>
      {isAnalyticsLoading ? (
        <>Loading...</>
      ) : votes.length === 0 ? (
        <>No models yet</>
      ) : (
        <Pie key={refreshCount} data={chartData} options={chartOptions} />
      )}
    </div>
  );
}
