import { Topbar } from "@/components/dashboard/topbar";
import { MetricIsland } from "@/components/dashboard/metric-island";
import { IslandChartCard } from "@/components/dashboard/island-chart-card";
import { RevenueTrendChart } from "@/components/dashboard/charts/revenue-trend-chart";
import { SourceDonutChart } from "@/components/dashboard/charts/source-donut-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { AiInsightsWidget } from "@/components/dashboard/ai-insights-widget";
import { SystemHealthWidget } from "@/components/dashboard/system-health-widget";
import {
  executiveKpis,
  revenueTrend,
  dealSourceMix,
  recentActivity,
} from "@/lib/mock/dashboard-data";
import { aiInsights, systemHealth } from "@/lib/mock/insights-data";

export default function ExecutiveDashboard() {
  return (
    <>
      <Topbar
        title="Executive Overview"
        subtitle="Operational health across pipeline, service, and productivity"
      />

      <div className="grid grid-cols-1 gap-5 px-2 pb-16 sm:grid-cols-2 xl:grid-cols-12">
        {/* Row 1 — Metric Islands, sets the rhythm */}
        {executiveKpis.map((kpi, i) => (
          <MetricIsland key={kpi.key} kpi={kpi} index={i} className="xl:col-span-3" />
        ))}

        {/* Row 2 — Revenue dominates; Activity is the tall companion */}
        <IslandChartCard
          title="Revenue vs. Target"
          subtitle="Closed-won revenue against monthly target"
          index={0}
          className="xl:col-span-8"
        >
          <RevenueTrendChart data={revenueTrend} />
        </IslandChartCard>

        <IslandChartCard
          title="Recent Activity"
          subtitle="Latest signals across the operation"
          index={1}
          className="sm:col-span-2 xl:col-span-4 xl:row-span-2"
        >
          <ActivityFeed items={recentActivity} />
        </IslandChartCard>

        {/* Row 3 — Deal Source medium, AI Insights compact, both sit under Revenue since Activity spans two rows */}
        <IslandChartCard
          title="Deal Source Mix"
          subtitle="Share of pipeline by source"
          index={2}
          className="xl:col-span-5"
        >
          <SourceDonutChart data={dealSourceMix} />
        </IslandChartCard>

        <AiInsightsWidget insights={aiInsights} className="xl:col-span-3" />

        {/* Row 4 — System Health, wide horizontal */}
        <SystemHealthWidget metrics={systemHealth} className="sm:col-span-2 xl:col-span-12" />
      </div>
    </>
  );
}
