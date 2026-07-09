import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface StalledDeal {
  dealId: string;
  dealName: string;
  ownerName: string;
  stageLabel: string;
  daysInStage: number;
  baselineAvgDays: number;
  multipleOfBaseline: number | null;
}

/**
 * Top N deals whose current-stage dwell time is furthest beyond that
 * stage's own historical average (real computation against seeded
 * fact_stage_transition history, not a hardcoded threshold). Only deals at
 * least 1.5x their stage's baseline are considered genuinely "stalled" --
 * everything else is normal variance, not worth flagging.
 */
export async function getStalledDeals(
  supabase: SupabaseClient<Database>,
  limit = 5,
): Promise<StalledDeal[]> {
  const { data, error } = await supabase
    .from("view_stalled_deals")
    .select("deal_id, deal_name, owner_name, stage_label, days_in_stage, baseline_avg_days, multiple_of_baseline")
    .not("multiple_of_baseline", "is", null)
    .gte("multiple_of_baseline", 1.5)
    .order("multiple_of_baseline", { ascending: false })
    .limit(limit);

  if (error) throw error;
  if (!data) return [];

  return data.filter((row) => row.deal_id !== null).map((row) => ({
    dealId: row.deal_id!,
    dealName: row.deal_name ?? row.deal_id!,
    ownerName: row.owner_name ?? "Unassigned",
    stageLabel: row.stage_label ?? "Unknown",
    daysInStage: Number(row.days_in_stage ?? 0),
    baselineAvgDays: Number(row.baseline_avg_days ?? 0),
    multipleOfBaseline: row.multiple_of_baseline !== null ? Number(row.multiple_of_baseline) : null,
  }));
}

export interface StageAging {
  stageId: string;
  isAbnormal: boolean;
  severity: "warn" | "crit" | null;
}

/**
 * For each stage, checks whether ANY currently-open deal in that stage is
 * aging abnormally (>= 1.5x baseline = warn, >= 3x = crit). Used to color
 * the Stage Funnel bars -- a stage with one badly stalled deal is worth a
 * visual flag even if most deals in it are fine.
 */
export async function getStageAgingSeverity(
  supabase: SupabaseClient<Database>,
): Promise<Map<string, "warn" | "crit">> {
  const { data, error } = await supabase
    .from("view_stalled_deals")
    .select("stage_id, multiple_of_baseline")
    .not("multiple_of_baseline", "is", null)
    .gte("multiple_of_baseline", 1.5);

  if (error) throw error;
  if (!data) return new Map();

  const severityByStage = new Map<string, "warn" | "crit">();
  for (const row of data) {
    if (!row.stage_id) continue;
    const multiple = Number(row.multiple_of_baseline);
    const current = severityByStage.get(row.stage_id);
    const next = multiple >= 3 ? "crit" : "warn";
    if (!current || (current === "warn" && next === "crit")) {
      severityByStage.set(row.stage_id, next);
    }
  }
  return severityByStage;
}
