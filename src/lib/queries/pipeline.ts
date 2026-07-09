import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { KpiTile, OwnerDatum, StageDatum } from "@/lib/mock/dashboard-data";
import { buildKpiTiles } from "./kpi-trend";

export async function getPipelineKpis(supabase: SupabaseClient<Database>): Promise<KpiTile[]> {
  return buildKpiTiles(supabase, [
    { metricKey: "open_value", label: "Open Value", format: "currency", sparklineGood: "up" },
    { metricKey: "weighted_value", label: "Weighted Value", format: "currency", sparklineGood: "up" },
    { metricKey: "avg_sales_cycle", label: "Avg. Sales Cycle", format: "duration-days", sparklineGood: "down" },
    { metricKey: "avg_stage_velocity", label: "Avg. Stage Velocity", format: "duration-days", sparklineGood: "down" },
  ]);
}

export async function getPipelineStages(supabase: SupabaseClient<Database>): Promise<StageDatum[]> {
  const { data, error } = await supabase
    .from("view_stage_funnel")
    .select("stage_id, stage_label, deal_count, total_value, avg_days, display_order")
    .not("display_order", "is", null)
    .lte("display_order", 4) // exclude closed-lost from the funnel visualization
    .order("display_order", { ascending: true });
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    stage: row.stage_label ?? "Unknown",
    stageId: row.stage_id ?? undefined,
    count: Number(row.deal_count ?? 0),
    value: Number(row.total_value ?? 0),
    avgDays: row.avg_days !== null ? Number(row.avg_days) : 0,
  }));
}

export async function getDealsByOwner(supabase: SupabaseClient<Database>): Promise<OwnerDatum[]> {
  const { data, error } = await supabase
    .from("view_deals_by_owner")
    .select("owner_name, won_count, lost_count, open_count")
    .not("owner_name", "is", null)
    .order("won_count", { ascending: false });
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    owner: row.owner_name ?? "Unassigned",
    won: Number(row.won_count ?? 0),
    lost: Number(row.lost_count ?? 0),
    open: Number(row.open_count ?? 0),
  }));
}
