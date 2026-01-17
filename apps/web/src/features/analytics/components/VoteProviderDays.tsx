import { cn } from "@chatwar/ui";
import { type ChartOptions, type TooltipItem } from "chart.js";
import { eachDayOfInterval, format, parse, parseISO, startOfDay } from "date-fns";
import { Line } from "react-chartjs-2";
import { ProviderId, ProviderModelVoteResponse, PROVIDERS } from "@chatwar/shared";
import { PROVIDER_CONFIGURATIONS } from "@/config/provider-configurations";
import { useAnalytics } from "@/providers/analytics";
import { useTheme } from "@/providers/theme";
import { getTooltip } from "@/features/analytics/chart/providerTooltip";
import { useLoadingRefresh } from "@/features/analytics/hooks/useLoadingRefresh";
import { toCssColor } from "@/utils/color";

// converts the timestamp to a key as the start of its day in local time
function toDayKey(timestamp: string) {
  const date = startOfDay(parseISO(timestamp));
  return format(date, "yyyy-MM-dd");
}

// converts the day key to a date for formatting
function toDate(dayKey: string) {
  return parse(dayKey, "yyyy-MM-dd", new Date());
}

// converts the day key to an axis label: Jan 12
function toAxisLabel(dayKey: string) {
  const date = toDate(dayKey);
  return format(date, "MMM d");
}

// converts the day key to a tooltip label: Jan 12, 2026
function toTooltipLabel(dayKey: string) {
  const date = toDate(dayKey);
  return format(date, "MMM d, yyyy");
}

type DayKey = string;
type DayWins = Partial<Record<DayKey, number>>;
type ProviderDayWins = Record<ProviderId, DayWins>;

// converts the votes into labels, day keys, and provider day wins
function toChartData(votes: ProviderModelVoteResponse[], providerIds: ProviderId[]) {
  // map provider ids to day win counts
  const providerDayWins: ProviderDayWins = providerIds.reduce((map, id) => {
    map[id] = {};
    return map;
  }, {} as ProviderDayWins);

  // iterate through the votes to update the provider day wins
  // and set the minimum and maximum day to use for the day range
  let minDay: string | null = null;
  let maxDay: string | null = null;
  for (const vote of votes) {
    const dayKey = toDayKey(vote.createdAt);
    const providerId = vote.winnerProviderId;
    providerDayWins[providerId][dayKey] = (providerDayWins[providerId][dayKey] ?? 0) + 1;
    if (!minDay || dayKey < minDay) {
      minDay = dayKey;
    }
    if (!maxDay || dayKey > maxDay) {
      maxDay = dayKey;
    }
  }

  // return labels, day keys, and provider day win counts for the day range
  const dayKeys =
    minDay && maxDay
      ? eachDayOfInterval({
          start: toDate(minDay),
          end: toDate(maxDay),
        }).map((day) => format(day, "yyyy-MM-dd"))
      : [];
  const labels = dayKeys.map(toAxisLabel);
  return { labels, dayKeys, providerDayWins };
}

export function VoteProviderDays({
  className,
  options,
}: {
  className?: string;
  options?: ChartOptions<"line">;
}) {
  const { theme } = useTheme();
  const { votes, isAnalyticsLoading } = useAnalytics();
  const refreshCount = useLoadingRefresh(isAnalyticsLoading);

  // set the chart data
  const providerIds = [...PROVIDERS].reverse();
  const { labels, dayKeys, providerDayWins } = toChartData(votes, providerIds);
  const datasets = providerIds.map((id) => {
    const { color } = PROVIDER_CONFIGURATIONS[id];
    const borderColor = toCssColor(color);
    const backgroundColor = toCssColor(color, 0.7);
    const data = dayKeys.map((dayKey) => providerDayWins[id][dayKey] ?? 0);
    return {
      label: PROVIDER_CONFIGURATIONS[id].label,
      data,
      borderColor,
      backgroundColor,
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
      tension: 0.35,
      fill: true,
    };
  });
  const chartData = { labels, datasets };

  // set the chart options
  const isDark = theme === "dark";
  const getProviderId = (context: TooltipItem<"line">) => providerIds[context.datasetIndex];
  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 650, easing: "easeOutQuart" },
    interaction: {
      mode: "index",
      intersect: false,
    },
    onHover: (event, elements) => {
      const canvas = event?.native?.target as HTMLCanvasElement | undefined;
      if (!canvas) {
        return;
      }
      canvas.style.cursor = elements.length ? "pointer" : "default";
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "center",
        labels: {
          color: isDark ? "#e5e7eb" : "#0f172a",
          usePointStyle: true,
          pointStyle: "line",
          boxWidth: 10,
          boxHeight: 10,
          padding: 15,
        },
      },
      tooltip: getTooltip({
        isDark,
        getProviderId,
        options: {
          position: "nearest",
          filter: (context) => context.parsed.y !== 0,
          // @ts-expect-error - partial tooltip callbacks are okay at runtime
          callbacks: {
            title: (items: TooltipItem<"line">[]) => {
              const index = items[0]?.dataIndex;
              return index == null ? "" : toTooltipLabel(dayKeys[index]);
            },
            label: (context) => {
              const winCount = Number(context.parsed.y ?? 0);
              return `  ${winCount} ${winCount === 1 ? "win" : "wins"}`;
            },
          },
        },
      }),
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: isDark ? "#e5e7eb" : "#0f172a",
          maxRotation: 0,
          autoSkip: true,
        },
        border: {
          display: true,
          color: isDark ? "#e5e7eb" : "#0f172a",
          width: 1,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: isDark ? "#e5e7eb" : "#0f172a",
          precision: 0,
        },
        grid: {
          color: isDark ? "rgba(63, 73, 89)" : "rgba(229, 231, 235, 1)",
        },
        border: {
          display: true,
          color: isDark ? "#e5e7eb" : "#0f172a",
          width: 1,
        },
      },
    },
    ...options,
  };

  // return the line chart
  return (
    <div className={cn("p-4 items-center justify-center", className)}>
      <Line key={refreshCount} data={chartData} options={chartOptions} />
    </div>
  );
}
