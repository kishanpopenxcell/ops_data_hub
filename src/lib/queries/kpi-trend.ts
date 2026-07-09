import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { KpiTile } from "@/lib/mock/dashboard-data";
import type { MetricFormat } from "@/lib/format";

export interface KpiTileSpec {
  metricKey: string;
  label: string;
  format: MetricFormat;
  sparklineGood: "up" | "down";
}

/**
 * Fetches multiple metrics' 30-day agg_kpi_daily history in a single query
 * (one round trip instead of one per tile) and builds a KpiTile per spec:
 * current value = latest day, deltaPct = vs. the value 7 days prior, trend =
 * the last 7 days (sparkline). Metrics with no rows (e.g. RLS scoped the
 * user out of all underlying records) are omitted from the result.
 *
 * agg_kpi_daily stores THREE grains per metric/day (tenant-wide, per-team,
 * per-owner) so RLS lets Admin/Manager/Rep each see rows beyond their own
 * grain. Without an explicit filter here, a Manager could receive both
 * their team's row and the tenant-wide row for the same day and pick the
 * wrong one arbitrarily -- which silently breaks reconciliation with
 * RLS-scoped drill-through queries. Explicitly select the grain matching
 * the caller's own role so the tile always equals what they can drill into.
 */
export async function buildKpiTiles(
  supabase: SupabaseClient<Database>,
  specs: KpiTileSpec[],
): Promise<KpiTile[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, hubspot_owner_id, team_id")
    .eq("id", user.id)
    .single();
  if (!profile) return [];

  const metricKeys = specs.map((s) => s.metricKey);
  const { data, error } = await supabase
    .from("agg_kpi_daily")
    .select("metric_key, date_key, value, owner_id, team_id")
    .in("metric_key", metricKeys)
    .order("date_key", { ascending: true });

  if (error) throw error;
  if (!data) return [];

  // Some metrics (e.g. activities_per_rep) only ever get a team-grain row,
  // never an owner-grain one -- a Rep falls back to their team's row for
  // those. Pick, per metric, the narrowest grain the role's rows include.
  const byMetric = new Map<string, number[]>();
  for (const key of metricKeys) {
    const rowsForMetric = data.filter((r) => r.metric_key === key);

    let scoped: typeof rowsForMetric;
    if (profile.role === "rep") {
      scoped = rowsForMetric.filter((r) => r.owner_id === profile.hubspot_owner_id);
      if (scoped.length === 0) {
        scoped = rowsForMetric.filter((r) => r.owner_id === null && r.team_id === profile.team_id);
      }
    } else if (profile.role === "manager") {
      scoped = rowsForMetric.filter((r) => r.owner_id === null && r.team_id === profile.team_id);
    } else {
      scoped = rowsForMetric.filter((r) => r.owner_id === null && r.team_id === null);
    }

    if (scoped.length > 0) {
      byMetric.set(
        key,
        scoped.sort((a, b) => a.date_key.localeCompare(b.date_key)).map((r) => Number(r.value ?? 0)),
      );
    }
  }

  const tiles: KpiTile[] = [];
  for (const spec of specs) {
    const values = byMetric.get(spec.metricKey);
    if (!values || values.length === 0) continue;

    const current = values[values.length - 1];
    const priorIdx = Math.max(0, values.length - 8);
    const prior = values[priorIdx];
    const deltaPct = prior !== 0 ? ((current - prior) / Math.abs(prior)) * 100 : 0;

    tiles.push({
      key: spec.metricKey,
      label: spec.label,
      value: current,
      format: spec.format,
      deltaPct,
      trend: values.slice(-7),
      sparklineGood: spec.sparklineGood,
    });
  }
  return tiles;
}
