import { RefreshCw } from "lucide-react";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "@chatwar/ui";
import { AnalyticsSection } from "@/features/analytics/components/AnalyticsSection";
import { useAnalytics } from "@/providers/analytics";
import { useEffect } from "react";

export function AnalyticsPage() {
  const { fetchVotes } = useAnalytics();

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
                flex items-center p-2
                cursor-pointer
                hover:bg-primary
                hover:text-primary-foreground
              "
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
        <AnalyticsSection title="Who Won">Winners Bar Chart</AnalyticsSection>

        <div className="grid grid-cols-2 gap-4">
          <AnalyticsSection title="What Models">Models Pie Chart</AnalyticsSection>
          <AnalyticsSection title="What Words">Words Tag Cloud</AnalyticsSection>
        </div>

        <AnalyticsSection title="When they Won">Winners by Day Line Chart</AnalyticsSection>
      </div>
    </section>
  );
}
