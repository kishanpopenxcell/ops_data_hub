import { Topbar } from "@/components/dashboard/topbar";
import { MetricIsland } from "@/components/dashboard/metric-island";
import { IslandChartCard } from "@/components/dashboard/island-chart-card";
import { RevenueTrendChart } from "@/components/dashboard/charts/revenue-trend-chart";
import { SourceDonutChart } from "@/components/dashboard/charts/source-donut-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AiInsightsWidget } from "@/components/dashboard/ai-insights-widget";
import { StalledDealsWidget } from "@/components/dashboard/stalled-deals-widget";
import { createClient } from "@/lib/supabase/server";
import { getDealSourceMix, getExecutiveKpis, getRecentActivity, getRevenueTrend } from "@/lib/queries/executive";
import { getStalledDeals } from "@/lib/queries/stalled-deals";
import { aiInsights } from "@/lib/mock/insights-data";

export default async function ExecutiveDashboard() {
  const supabase = await createClient();

  const [executiveKpis, revenueTrend, dealSourceMix, recentActivity, stalledDeals] = await Promise.all([
    getExecutiveKpis(supabase),
    getRevenueTrend(supabase),
    getDealSourceMix(supabase),
    getRecentActivity(supabase),
    getStalledDeals(supabase),
  ]);

  return (
    <>
      <Topbar
        title="Executive Overview"
        subtitle="Operational health across pipeline, service, and productivity"
      />

      <div className="grid grid-cols-1 gap-5 px-2 pb-16 sm:grid-cols-2 lg:grid-cols-12">
        {/* Row 1 — Metric Islands, sets the rhythm */}
        {executiveKpis.map((kpi, i) => (
          <MetricIsland key={kpi.key} kpi={kpi} index={i} className="lg:col-span-3" />
        ))}

        {/* Row 2 — Revenue trend, wide */}
        <IslandChartCard
          title="Revenue vs. Target"
          subtitle="Closed-won revenue against monthly target"
          index={0}
          className="lg:col-span-8"
        >
          <RevenueTrendChart data={revenueTrend} />
        </IslandChartCard>

        <IslandChartCard
          title="Deal Source Mix"
          subtitle="Share of pipeline by source"
          index={1}
          className="lg:col-span-4"
        >
          <SourceDonutChart data={dealSourceMix} />
        </IslandChartCard>

        {/* Row 3 — Stalled Deals demands attention next; AI Insights is the companion */}
        <IslandChartCard
          title="Stalled Deals"
          subtitle="Aging well beyond their stage's normal pace"
          index={2}
          className="lg:col-span-8"
        >
          <StalledDealsWidget deals={stalledDeals} />
        </IslandChartCard>

        <AiInsightsWidget insights={aiInsights} className="lg:col-span-4" />

        {/* Row 4 — Activity closes out the page */}
        <IslandChartCard
          title="Recent Activity"
          subtitle="Latest signals across the operation"
          index={3}
          className="sm:col-span-2 lg:col-span-12"
        >
          <ActivityFeed items={recentActivity} />
        </IslandChartCard>
      </div>
    </>
  );
}
