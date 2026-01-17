import { Info, RefreshCw } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@chatwar/ui";
import { AnalyticsSection } from "@/features/analytics/components/AnalyticsSection";
import { useAnalytics } from "@/providers/analytics";
import { useEffect } from "react";
import { VoteProviderLeaders } from "@/features/analytics/components/VoteProviderLeaders";
import { VoteWordsCloud } from "@/features/analytics/components/VoteWordsCloud";
import { VoteProviderDays } from "@/features/analytics/components/VoteProviderDays";
import { VoteModelWinners } from "@/features/analytics/components/VoteModelWinners";
import { VoteProviderMap } from "@/features/analytics/components/VoteProviderMap";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip as ChartTooltip,
} from "chart.js";

// must run before any charts render
ChartJS.defaults.font.family = "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
ChartJS.defaults.font.size = 15;
ChartJS.defaults.color = "hsl(var(--foreground))";

// register chart components for all analytics charts
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  ChartTooltip,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
);

export function AnalyticsPage() {
  const { isAnalyticsLoading, fetchVotes } = useAnalytics();

  // initial load
  useEffect(() => {
    void fetchVotes();
  }, [fetchVotes]);

  return (
    <section aria-labelledby="analytics-heading" className="relative p-2 pb-4">
      <h1 id="analytics-heading" className="sr-only">
        Analytics
      </h1>

      {/* refresh button */}
      <div className="absolute top-4 right-4 z-10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="
                border
                flex items-center p-2 m-1
                cursor-pointer
                hover:bg-primary
                hover:text-primary-foreground
              "
              disabled={isAnalyticsLoading}
              onClick={fetchVotes}
            >
              <RefreshCw />
              <span>Refresh</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Refresh Votes</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-4">
        <AnalyticsSection
          title="Who Won"
          tooltip={
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-describedby="who-won-info"
                  className="
                    w-8 h-8
                    rounded-full
                    cursor-pointer
                    hover:bg-primary
                    hover:text-primary-foreground
                  "
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent id="who-won-info" side="top" align="start">
                Leaders based on percentage of competitions won
              </TooltipContent>
            </Tooltip>
          }
        >
          <VoteProviderLeaders className="min-h-64" />
        </AnalyticsSection>

        <div className="grid grid-cols-2 gap-4">
          <AnalyticsSection title="What Models">
            <VoteModelWinners className="min-h-48" />
          </AnalyticsSection>
          <AnalyticsSection title="What Words">
            <VoteWordsCloud className="min-h-48" />
          </AnalyticsSection>
        </div>

        <AnalyticsSection title="When they Won">
          <VoteProviderDays className="min-h-72" />
        </AnalyticsSection>

        <AnalyticsSection
          title="Where they Won"
          tooltip={
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-describedby="who-won-info"
                  className="
                    w-8 h-8
                    rounded-full
                    cursor-pointer
                    hover:bg-primary
                    hover:text-primary-foreground
                  "
                >
                  <Info />
                </Button>
              </TooltipTrigger>
              <TooltipContent id="who-won-info" side="top" align="start">
                Approximate location based on anonymized IP data
              </TooltipContent>
            </Tooltip>
          }
        >
          <VoteProviderMap className="min-h-72" />
        </AnalyticsSection>
      </div>
    </section>
  );
}
