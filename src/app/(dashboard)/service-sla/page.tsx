import { Topbar } from "@/components/dashboard/topbar";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { TicketVolumeChart } from "@/components/dashboard/charts/ticket-volume-chart";
import { SlaPriorityChart } from "@/components/dashboard/charts/sla-priority-chart";
import { BacklogAgeChart } from "@/components/dashboard/charts/backlog-age-chart";
import { createClient } from "@/lib/supabase/server";
import { getBacklogAgeBands, getSlaByPriority, getSlaKpis, getTicketVolumeTrend } from "@/lib/queries/service-sla";

export default async function ServiceSlaDashboard() {
  const supabase = await createClient();

  const [slaKpis, ticketVolumeTrend, slaByPriority, backlogAgeBands] = await Promise.all([
    getSlaKpis(supabase),
    getTicketVolumeTrend(supabase),
    getSlaByPriority(supabase),
    getBacklogAgeBands(supabase),
  ]);

  return (
    <>
      <Topbar title="Service SLA" subtitle="Response times, attainment, and backlog health" />

      <div className="flex flex-col gap-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {slaKpis.map((kpi, i) => (
            <KpiCard key={kpi.key} kpi={kpi} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard
            title="Ticket Volume"
            subtitle="Created vs. resolved, last 7 days"
            index={0}
            className="lg:col-span-2"
          >
            <TicketVolumeChart data={ticketVolumeTrend} />
          </ChartCard>

          <ChartCard title="SLA Attainment by Priority" subtitle="Share resolved within target" index={1}>
            <SlaPriorityChart data={slaByPriority} />
          </ChartCard>
        </div>

        <ChartCard title="Backlog by Age" subtitle="Open tickets grouped by time open" index={2}>
          <BacklogAgeChart data={backlogAgeBands} />
        </ChartCard>
      </div>
    </>
  );
}
