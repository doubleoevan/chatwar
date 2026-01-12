import { NavLink } from "react-router-dom";
import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@chatwar/ui";
import { ChartColumnIncreasing, MessageSquareMore, Video } from "lucide-react";
import { RECENT_VOTES_LIMIT } from "@chatwar/shared";
import { useAnalytics } from "@/providers/analytics";
import { Spinner } from "@/components/Spinner";

const tabBase =
  "flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition-[background-color,border-color,opacity]";
const tabActive = "bg-accent text-accent-foreground border-input";
const tabInactive =
  "opacity-70 border-border/0 hover:opacity-100 hover:bg-accent/50 hover:border-input";

export function Tabs() {
  const { isAnalyticsLoading } = useAnalytics();
  return (
    <nav aria-label="Primary" className="flex gap-2 p-2 pt-4">
      <NavLink
        to="/chat"
        className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
      >
        <MessageSquareMore className="h-4 w-4" aria-hidden />
        <span>Chat</span>
      </NavLink>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <NavLink
              to="/analytics"
              className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
            >
              {isAnalyticsLoading ? (
                <Spinner>
                  <ChartColumnIncreasing className="h-4 w-4" aria-hidden />
                </Spinner>
              ) : (
                <ChartColumnIncreasing className="h-4 w-4" aria-hidden />
              )}
              <span>Analytics</span>
            </NavLink>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          See results from the last {RECENT_VOTES_LIMIT} votes
        </TooltipContent>
      </Tooltip>
      <NavLink
        to="/demo"
        className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
      >
        <Video className="h-4 w-4" aria-hidden />
        <span>Demo</span>
      </NavLink>
    </nav>
  );
}
