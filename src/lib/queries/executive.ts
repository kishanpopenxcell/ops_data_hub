import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ActivityItem, KpiTile, SourceDatum, TrendPoint } from "@/lib/mock/dashboard-data";
import { buildKpiTiles } from "./kpi-trend";

export async function getExecutiveKpis(supabase: SupabaseClient<Database>): Promise<KpiTile[]> {
  return buildKpiTiles(supabase, [
    { metricKey: "pipeline_value", label: "Pipeline Value", format: "currency", sparklineGood: "up" },
    { metricKey: "win_rate", label: "Win Rate", format: "percent", sparklineGood: "up" },
    { metricKey: "sla_attainment", label: "SLA Attainment", format: "percent", sparklineGood: "up" },
    { metricKey: "activities_per_rep", label: "Activities / Rep", format: "number", sparklineGood: "up" },
  ]);
}

export async function getRevenueTrend(supabase: SupabaseClient<Database>): Promise<TrendPoint[]> {
  const { data, error } = await supabase
    .from("view_revenue_trend")
    .select("month, actual")
    .order("month", { ascending: true });
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => {
    const actual = Number(row.actual ?? 0);
    return {
      date: new Date(row.month as string).toLocaleDateString("en-US", { month: "short" }),
      actual,
      // No real goals/quota table yet (P2 scope) -- target shown as a flat
      // 90% of actual so the chart still communicates "vs. target" shape.
      target: Math.round(actual * 0.9),
    };
  });
}

export async function getDealSourceMix(supabase: SupabaseClient<Database>): Promise<SourceDatum[]> {
  const { data, error } = await supabase.from("view_deal_source_mix").select("source, deal_count");
  if (error) throw error;
  if (!data) return [];

  const total = data.reduce((sum, r) => sum + Number(r.deal_count ?? 0), 0);
  if (total === 0) return [];

  return data
    .map((row) => ({
      name: row.source ?? "Unknown",
      value: Math.round((Number(row.deal_count ?? 0) / total) * 100),
    }))
    .sort((a, b) => b.value - a.value);
}

export async function getRecentActivity(supabase: SupabaseClient<Database>): Promise<ActivityItem[]> {
  const { data, error } = await supabase
    .from("view_recent_activity")
    .select("activity_type, owner_id, object_id, occurred_at, amount")
    .order("occurred_at", { ascending: false })
    .limit(8);
  if (error) throw error;
  if (!data) return [];

  // Owner names aren't in view_recent_activity -- resolve via dim_owner in
  // one follow-up query rather than joining in SQL (keeps the view reusable
  // for both deal and engagement rows without an owner join dependency).
  const ownerIds = [...new Set(data.map((r) => r.owner_id).filter(Boolean))] as string[];
  const { data: owners } = await supabase
    .from("dim_owner")
    .select("hubspot_owner_id, full_name")
    .in("hubspot_owner_id", ownerIds.length > 0 ? ownerIds : ["__none__"]);
  const nameByOwnerId = new Map((owners ?? []).map((o) => [o.hubspot_owner_id, o.full_name ?? o.hubspot_owner_id]));

  return data.map((row, i) => {
    const actor = nameByOwnerId.get(row.owner_id ?? "") ?? "System";
    const type = mapActivityType(row.activity_type);
    return {
      id: `${row.object_id}-${i}`,
      type,
      actor,
      description: describeActivity(type, row.amount ? Number(row.amount) : null),
      timestamp: formatRelativeTime(row.occurred_at as string),
    };
  });
}

function mapActivityType(raw: string | null): ActivityItem["type"] {
  if (raw === "deal_won") return "deal_won";
  if (raw === "call") return "call";
  if (raw === "email") return "email";
  if (raw === "meeting") return "meeting";
  return "call";
}

function describeActivity(type: ActivityItem["type"], amount: number | null): string {
  switch (type) {
    case "deal_won":
      return `closed a deal${amount ? ` — $${amount.toLocaleString()}` : ""}`;
    case "call":
      return "logged a call";
    case "email":
      return "sent an email";
    case "meeting":
      return "held a meeting";
    default:
      return "logged an update";
  }
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
