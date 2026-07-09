import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AgeBandDatum, KpiTile, SlaPriorityDatum, TicketTrendPoint } from "@/lib/mock/dashboard-data";
import { buildKpiTiles } from "./kpi-trend";

export async function getSlaKpis(supabase: SupabaseClient<Database>): Promise<KpiTile[]> {
  return buildKpiTiles(supabase, [
    { metricKey: "first_response", label: "First Response", format: "duration-days", sparklineGood: "down" },
    { metricKey: "resolution_time", label: "Resolution Time", format: "duration-days", sparklineGood: "down" },
    { metricKey: "sla_attainment", label: "SLA Attainment", format: "percent", sparklineGood: "up" },
    { metricKey: "backlog", label: "Open Backlog", format: "number", sparklineGood: "down" },
  ]);
}

const PRIORITY_ORDER = ["URGENT", "HIGH", "MEDIUM", "LOW"];

export async function getSlaByPriority(supabase: SupabaseClient<Database>): Promise<SlaPriorityDatum[]> {
  const { data, error } = await supabase.from("view_sla_by_priority").select("priority, attainment, volume");
  if (error) throw error;
  if (!data) return [];

  return data
    .map((row) => ({
      priority: titleCase(row.priority ?? "Unknown"),
      attainment: Number(row.attainment ?? 0),
      volume: Number(row.volume ?? 0),
    }))
    .sort((a, b) => PRIORITY_ORDER.indexOf(a.priority.toUpperCase()) - PRIORITY_ORDER.indexOf(b.priority.toUpperCase()));
}

export async function getTicketVolumeTrend(supabase: SupabaseClient<Database>): Promise<TicketTrendPoint[]> {
  const { data, error } = await supabase
    .from("view_ticket_volume_trend")
    .select("date_key, created_count, resolved_count")
    .order("date_key", { ascending: true });
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    date: new Date(row.date_key as string).toLocaleDateString("en-US", { weekday: "short" }),
    created: Number(row.created_count ?? 0),
    resolved: Number(row.resolved_count ?? 0),
  }));
}

const AGE_BAND_ORDER = ["0-1d", "1-3d", "3-7d", "7d+"];

export async function getBacklogAgeBands(supabase: SupabaseClient<Database>): Promise<AgeBandDatum[]> {
  const { data, error } = await supabase.from("view_backlog_age_bands").select("age_band, ticket_count");
  if (error) throw error;
  if (!data) return [];

  const byBand = new Map(data.map((row) => [row.age_band, Number(row.ticket_count ?? 0)]));
  return AGE_BAND_ORDER.map((band) => ({ band, count: byBand.get(band) ?? 0 }));
}

function titleCase(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
