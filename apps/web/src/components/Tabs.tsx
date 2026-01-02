import { NavLink } from "react-router-dom";
import { cn } from "@chatwar/ui";
import { ChartColumnIncreasing, MessageSquareMore } from "lucide-react";

const tabBase = "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors";
const tabActive = "bg-accent text-accent-foreground";
const tabInactive = "opacity-70 hover:opacity-100 hover:bg-accent/50";

export function Tabs() {
  return (
    <nav aria-label="Primary" className="flex gap-2 p-2">
      <NavLink
        to="/chat"
        className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
      >
        <MessageSquareMore className="h-4 w-4" aria-hidden />
        <span>Chat</span>
      </NavLink>
      <NavLink
        to="/analytics"
        className={({ isActive }) => cn(tabBase, isActive ? tabActive : tabInactive)}
      >
        <ChartColumnIncreasing className="h-4 w-4" aria-hidden />
        <span>Analytics</span>
      </NavLink>
    </nav>
  );
}
