import { Topbar } from "@/components/dashboard/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { StageFunnel } from "@/components/dashboard/charts/stage-funnel";
import { OwnerBarChart } from "@/components/dashboard/charts/owner-bar-chart";
import { TeamLeaderboard } from "@/components/dashboard/team-leaderboard";
import { StalledDealsWidget } from "@/components/dashboard/stalled-deals-widget";
import { createClient } from "@/lib/supabase/server";
import { getDealsByOwner, getPipelineKpis, getPipelineStages } from "@/lib/queries/pipeline";
import { getStageAgingSeverity, getStalledDeals } from "@/lib/queries/stalled-deals";
import { teamRoster } from "@/lib/mock/dashboard-data";

export default async function PipelineDashboard() {
  const supabase = await createClient();

  const [pipelineKpis, pipelineStages, dealsByOwner, stalledDeals, stageAgingMap] = await Promise.all([
    getPipelineKpis(supabase),
    getPipelineStages(supabase),
    getDealsByOwner(supabase),
    getStalledDeals(supabase),
    getStageAgingSeverity(supabase),
  ]);
  const stageAging = Object.fromEntries(stageAgingMap);

  return (
    <>
      <Topbar title="Pipeline" subtitle="Funnel health, stage velocity, and rep performance" />

      <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pipelineKpis.map((kpi, i) => (
            <KpiCard key={kpi.key} kpi={kpi} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <ChartCard
            title="Stage Funnel"
            subtitle="Deal count, value, and average time per stage"
            index={0}
            className="xl:col-span-2"
          >
            <StageFunnel data={pipelineStages} stageAging={stageAging} />
          </ChartCard>

          <ChartCard title="Quota Attainment" subtitle="Ranked by rep, this quarter" index={1}>
            <TeamLeaderboard members={teamRoster} />
          </ChartCard>
        </div>

        <ChartCard title="Deals by Owner" subtitle="Won, open, and lost by rep" index={2}>
          <OwnerBarChart data={dealsByOwner} />
        </ChartCard>

        <ChartCard title="Stalled Deals" subtitle="Aging well beyond their stage's normal pace" index={3}>
          <StalledDealsWidget deals={stalledDeals} />
        </ChartCard>
      </div>
    </>
  );
}
