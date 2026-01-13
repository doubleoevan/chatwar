import { cn } from "@chatwar/ui";
import type { ChartOptions, TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
import type { ProviderId } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { useAnalytics } from "@/providers/analytics";
import { useTheme } from "@/providers/theme";
import { typedKeys } from "@/utils/object";
import { getTooltip } from "@/features/analytics/chart/providerTooltip";
import { useLoadingRefresh } from "@/features/analytics/hooks/useLoadingRefresh";

export function VoteProviderLeaders({
  className,
  options,
}: {
  className?: string;
  options?: ChartOptions<"bar">;
}) {
  const { theme } = useTheme();
  const { votes, isAnalyticsLoading } = useAnalytics();
  const refreshCount = useLoadingRefresh(isAnalyticsLoading); // for rerendering on refresh

  // map provider ids to win counts
  const providerIds: ProviderId[] = typedKeys(PROVIDER_CONFIGURATIONS).reverse();
  const providerWins = providerIds.reduce<Record<ProviderId, number>>(
    (map, id) => {
      map[id] = 0;
      return map;
    },
    {} as Record<ProviderId, number>,
  );
  for (const vote of votes) {
    providerWins[vote.winnerProviderId]++;
  }

  // set the chart data
  const labels = providerIds.map((id) => PROVIDER_CONFIGURATIONS[id].label);
  const data = providerIds.map((id) => providerWins[id]);
  const colors = providerIds.map((id) => PROVIDER_CONFIGURATIONS[id].color);
  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: colors.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`),
        backgroundColor: colors.map(([r, g, b]) => `rgba(${r}, ${g}, ${b}, 0.7)`),
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  // set the chart options
  const isDark = theme === "dark";
  const getProviderId = (context: TooltipItem<"bar">) => providerIds[context.dataIndex];
  const chartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 650,
      easing: "easeOutQuart",
    },
    onHover: (event, elements) => {
      const canvas = event?.native?.target as HTMLCanvasElement | undefined;
      if (!canvas) {
        return;
      }
      canvas.style.cursor = elements.length ? "pointer" : "default";
    },
    plugins: {
      legend: { display: false },
      tooltip: getTooltip({
        isDark,
        getProviderId,
      }),
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#e5e7eb" : "#0f172a",
        },
        border: {
          display: true,
          color: isDark ? "rgba(63, 73, 89)" : "rgba(229, 231, 235, 1)",
          width: 1,
        },
      },
      y: {
        display: false,
      },
    },
    ...options,
  };

  // return the chart
  return (
    <div
      className={cn(
        "pt-4",
        "bg-background",
        "rounded-xl",
        "flex h-full w-full",
        "items-center justify-center",
        className,
      )}
    >
      <Bar key={refreshCount} data={chartData} options={chartOptions} />
    </div>
  );
}
