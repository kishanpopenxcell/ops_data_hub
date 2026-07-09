import { CheckCircle2, Clock, ShieldAlert, UserX } from "lucide-react";
import { Topbar } from "@/components/dashboard/topbar";
import { ChartCard } from "@/components/dashboard/chart-card";
import { DqSummaryCard } from "@/components/dashboard/dq-summary-card";
import { DqCompletenessBars } from "@/components/dashboard/dq-completeness-bars";
import { DqIssuesTable } from "@/components/dashboard/dq-issues-table";
import { DqOrphanOwnerList } from "@/components/dashboard/dq-orphan-owner-list";
import { createClient } from "@/lib/supabase/server";
import { getDqCompleteness, getDqIssues, getDqOrphanOwners, getDqSummary } from "@/lib/queries/data-quality";
import { formatMetric } from "@/lib/format";

export default async function DataQualityWorkspace() {
  const supabase = await createClient();

  const [summary, completeness, issues, orphanOwners] = await Promise.all([
    getDqSummary(supabase),
    getDqCompleteness(supabase),
    getDqIssues(supabase),
    getDqOrphanOwners(supabase),
  ]);

  return (
    <>
      <Topbar title="Data Quality" subtitle="Completeness, staleness, and ownership gaps across records" />

      <div className="flex flex-col gap-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DqSummaryCard
            label="Overall Completeness"
            value={formatMetric(summary.overallCompletenessPct, "percent")}
            icon={<CheckCircle2 className="h-5 w-5" />}
            tone={summary.overallCompletenessPct >= 0.95 ? "good" : "warn"}
            index={0}
          />
          <DqSummaryCard
            label="Records Needing Attention"
            value={String(summary.totalIssues)}
            icon={<ShieldAlert className="h-5 w-5" />}
            tone={summary.totalIssues === 0 ? "good" : "warn"}
            index={1}
          />
          <DqSummaryCard
            label="Stale Open Deals"
            value={String(summary.staleCount)}
            icon={<Clock className="h-5 w-5" />}
            tone={summary.staleCount === 0 ? "good" : "warn"}
            index={2}
          />
          <DqSummaryCard
            label="Orphaned Owner Records"
            value={String(summary.orphanOwnerCount)}
            icon={<UserX className="h-5 w-5" />}
            tone={summary.orphanOwnerCount === 0 ? "good" : "crit"}
            index={3}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <ChartCard
            title="Field Completeness"
            subtitle="Share of records with a required field populated"
            index={0}
            className="lg:col-span-2"
          >
            <DqCompletenessBars data={completeness} />
          </ChartCard>

          <ChartCard title="Orphaned Owners" subtitle="Owner IDs with no matching active rep" index={1}>
            <DqOrphanOwnerList owners={orphanOwners} />
          </ChartCard>
        </div>

        <ChartCard title="Records Needing Attention" subtitle="Click a row to inspect the record" index={2}>
          <DqIssuesTable issues={issues} />
        </ChartCard>
      </div>
    </>
  );
}
