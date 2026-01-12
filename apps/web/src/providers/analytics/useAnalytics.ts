import { useContext } from "react";
import { AnalyticsContext } from "@/providers/analytics/AnalyticsContext";

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error("useAnalytics must be used within <AnalyticsContext />");
  }
  return context;
}
