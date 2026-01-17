import React, { useEffect, useState } from "react";
import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@chatwar/ui";
import { ChartOptions, TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
import { ProviderId, PROVIDERS } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { useAnalytics } from "@/providers/analytics";
import { useTheme } from "@/providers/theme";
import { getTooltip } from "@/features/analytics/chart/providerTooltip";
import { useLoadingRefresh } from "@/features/analytics/hooks/useLoadingRefresh";
import { toCssColor } from "@/utils/color";

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

  // track the width to hide the x-axis on mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const onChange = () => setIsMobile(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  // track the provider ids to hide and show
  const [hideProviderIds, setHideProviderIds] = useState<Set<ProviderId>>(() => new Set());
  const providerIds = [...PROVIDERS].reverse();
  const showProviderIds = providerIds.filter((id) => !hideProviderIds.has(id));
  const refreshKey = `${refreshCount}-${Array.from(hideProviderIds).sort().join(",")}`;

  // map provider ids to win counts
  const providerWins = providerIds.reduce<Record<ProviderId, number>>(
    (map, id) => {
      map[id] = 0;
      return map;
    },
    {} as Record<ProviderId, number>,
  );

  // map provider ids to competition counts
  const providerCompetitions = providerIds.reduce<Record<ProviderId, number>>(
    (map, id) => {
      map[id] = 0;
      return map;
    },
    {} as Record<ProviderId, number>,
  );

  // iterate through the votes to update the win counts and competition counts
  for (const vote of votes) {
    providerWins[vote.winnerProviderId]++;
    for (const competitor of vote.competitors) {
      const providerId = competitor.providerId as ProviderId;
      if (providerId in providerCompetitions) {
        providerCompetitions[providerId]++;
      }
    }
  }

  // map provider ids to their win percents
  const providerWinPercents = providerIds.reduce<Record<ProviderId, number>>(
    (map, id) => {
      const competitions = providerCompetitions[id] || 0;
      if (competitions === 0) {
        map[id] = 0;
        return map;
      }
      map[id] = (providerWins[id] / competitions) * 100;
      return map;
    },
    {} as Record<ProviderId, number>,
  );

  // set the chart data from visible provider ids
  const data = showProviderIds.map((id) => providerWinPercents[id] ?? 0);
  const labels = showProviderIds.map((id) => PROVIDER_CONFIGURATIONS[id].label);
  const colors = showProviderIds.map((id) => PROVIDER_CONFIGURATIONS[id].color);
  const chartData = {
    labels,
    datasets: [
      {
        data,
        borderColor: colors.map((color) => toCssColor(color)),
        backgroundColor: colors.map((color) => toCssColor(color, 0.7)),
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };

  // set the chart options
  const isDark = theme === "dark";
  const getProviderId = (context: TooltipItem<"bar">) => showProviderIds[context.dataIndex];
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
        options: {
          // @ts-expect-error - partial tooltip callbacks are okay at runtime
          callbacks: {
            label: (item) => {
              const percentage = item.parsed.y as number;
              const providerId = showProviderIds[item.dataIndex];
              const wins = providerWins[providerId] ?? 0;
              const competitions = providerCompetitions[providerId] ?? 0;
              return `  ${percentage.toFixed(0)}% – ${wins} of ${competitions} votes`;
            },
          },
        },
      }),
    },
    scales: {
      x: {
        display: !isMobile, // hide the x-axis on mobile
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

  // show or hide the passed in provider
  const onShowHideProvider = (providerId: ProviderId) => {
    setHideProviderIds((providerIds) => {
      const nextProviderIds = new Set(providerIds);
      if (nextProviderIds.has(providerId)) {
        nextProviderIds.delete(providerId);
      } else {
        nextProviderIds.add(providerId);
      }
      return nextProviderIds;
    });
  };

  // return the bar chart
  return (
    <div className={cn("pt-3 flex-col", className)}>
      {/* provider legend */}
      <div className="pb-3 flex flex-wrap items-center justify-center">
        {providerIds.map((providerId) => {
          const provider = PROVIDER_CONFIGURATIONS[providerId];
          const { color, Icon } = provider;
          return (
            <Tooltip key={providerId}>
              <TooltipTrigger asChild>
                <button
                  key={providerId}
                  type="button"
                  onClick={() => onShowHideProvider(providerId)}
                  className={cn(
                    "inline-flex items-center",
                    "gap-2 px-2 py-2.5",
                    "rounded-sm text-sm",
                    "transition-[background-color,border-color,opacity] cursor-pointer",
                    "border border-border/0 hover:border-input hover:bg-muted",
                    !hideProviderIds.has(providerId)
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-100",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-4 rounded-xs border"
                    style={{
                      borderColor: toCssColor(color),
                      backgroundColor: toCssColor(color, 0.7),
                    }}
                  />
                  <span
                    className={cn(
                      "whitespace-nowrap",
                      hideProviderIds.has(providerId) && "line-through",
                    )}
                  >
                    {provider.label}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" align="start">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>Click to hide {provider.label} results</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <Bar key={refreshKey} data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
