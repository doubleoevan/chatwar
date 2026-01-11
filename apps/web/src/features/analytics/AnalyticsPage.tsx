import { AnalyticsSection } from "@/features/analytics/components/AnalyticsSection";

export function AnalyticsPage() {
  return (
    <section aria-labelledby="analytics-heading" className="p-2 pb-4">
      <h1 id="analytics-heading" className="sr-only">
        Analytics
      </h1>

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
