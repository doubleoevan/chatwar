import { RefreshCw } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@chatwar/ui";
import { AnalyticsSection } from "@/features/analytics/components/AnalyticsSection";
import { useAnalytics } from "@/providers/analytics";
import { useEffect } from "react";
import { VoteWordsCloud } from "@/features/analytics/components/VoteWordsCloud";
import { VoteProviderLeaders } from "@/features/analytics/components/VoteProviderLeaders";
import { Chart as ChartJS } from "chart.js";

// must run before any charts render
ChartJS.defaults.font.family = "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
ChartJS.defaults.font.size = 15;
ChartJS.defaults.color = "hsl(var(--foreground))";

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
        <AnalyticsSection title="Who Won" className="pt-5">
          <VoteProviderLeaders className="min-h-64" />
        </AnalyticsSection>

        <div className="grid grid-cols-2 gap-4">
          <AnalyticsSection title="What Models">Models Pie Chart</AnalyticsSection>
          <AnalyticsSection title="What Words">
            <VoteWordsCloud className="min-h-44" />
          </AnalyticsSection>
        </div>

        <AnalyticsSection title="When they Won">Winners by Day Line Chart</AnalyticsSection>
      </div>
    </section>
  );
}
