import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { DrillThroughQuery } from "@/lib/drill-through";

export interface DrillThroughRecord {
  id: string;
  hubspotId: string;
  name: string;
  ownerName: string;
  stageOrPriority: string;
  amount: number | null;
  date: string | null;
}

export interface DrillThroughResult {
  records: DrillThroughRecord[];
  reconciledSum: number;
}

export async function runDrillThroughQuery(
  supabase: SupabaseClient<Database>,
  query: DrillThroughQuery,
): Promise<DrillThroughResult> {
  if (query.object === "deal") {
    return fetchDeals(supabase, query);
  }
  return fetchTickets(supabase, query);
}

async function fetchDeals(
  supabase: SupabaseClient<Database>,
  query: DrillThroughQuery,
): Promise<DrillThroughResult> {
  let request = supabase
    .from("raw_deals")
    .select("id, hubspot_deal_id, amount, owner_id, stage_id, createdate, closedate, raw_payload")
    .eq("is_deleted", false);

  if (query.filters.hubspotId) {
    request = request.eq("hubspot_deal_id", query.filters.hubspotId);
  }
  if (query.filters.stageId) {
    request = request.eq("stage_id", query.filters.stageId);
  }
  if (query.filters.openOnly) {
    request = request.is("closedate", null);
  }
  if (query.filters.wonOnly) {
    request = request.eq("stage_id", "closedwon");
  } else if (query.filters.lostOnly) {
    request = request.eq("stage_id", "closedlost");
  } else if (query.filters.decidedOnly) {
    request = request.in("stage_id", ["closedwon", "closedlost"]);
  }
  if (query.filters.missingAmount) {
    request = request.is("amount", null);
  }

  const { data, error } = await request.order("createdate", { ascending: false }).limit(200);
  if (error) throw error;
  if (!data) return { records: [], reconciledSum: 0 };

  let rows = data;
  if (query.filters.ownerName) {
    const ownerIds = await resolveOwnerIdsByName(supabase, query.filters.ownerName);
    rows = rows.filter((r) => ownerIds.has(r.owner_id ?? ""));
  }
  if (query.filters.orphanOwner) {
    const activeOwnerIds = await fetchActiveOwnerIds(supabase);
    rows = rows.filter((r) => r.owner_id && !activeOwnerIds.has(r.owner_id));
  }

  const ownerIds = [...new Set(rows.map((r) => r.owner_id).filter(Boolean))] as string[];
  const nameByOwnerId = await fetchOwnerNames(supabase, ownerIds);

  const stageIds = [...new Set(rows.map((r) => r.stage_id).filter(Boolean))] as string[];
  const stageLabelById = await fetchStageLabels(supabase, stageIds, "deal");

  const records: DrillThroughRecord[] = rows.map((r) => ({
    id: r.id,
    hubspotId: r.hubspot_deal_id,
    name: (r.raw_payload as Record<string, unknown> | null)?.dealname as string ?? r.hubspot_deal_id,
    ownerName: nameByOwnerId.get(r.owner_id ?? "") ?? "Unassigned",
    stageOrPriority: stageLabelById.get(r.stage_id ?? "") ?? r.stage_id ?? "Unknown",
    amount: r.amount !== null ? Number(r.amount) : null,
    date: r.closedate ?? r.createdate,
  }));

  const reconciledSum = records.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  return { records, reconciledSum };
}

async function fetchTickets(
  supabase: SupabaseClient<Database>,
  query: DrillThroughQuery,
): Promise<DrillThroughResult> {
  let request = supabase
    .from("raw_tickets")
    .select("id, hubspot_ticket_id, owner_id, priority, stage_id, createdate, closed_date, raw_payload")
    .eq("is_deleted", false);

  if (query.filters.hubspotId) {
    request = request.eq("hubspot_ticket_id", query.filters.hubspotId);
  }
  if (query.filters.priority) {
    request = request.eq("priority", query.filters.priority);
  }
  if (query.filters.openOnly) {
    request = request.is("closed_date", null);
  }
  if (query.filters.missingPriority) {
    request = request.is("priority", null);
  }

  const { data, error } = await request.order("createdate", { ascending: false }).limit(200);
  if (error) throw error;
  if (!data) return { records: [], reconciledSum: 0 };

  let rows = data;
  if (query.filters.orphanOwner) {
    const activeOwnerIds = await fetchActiveOwnerIds(supabase);
    rows = rows.filter((r) => r.owner_id && !activeOwnerIds.has(r.owner_id));
  }

  const ownerIds = [...new Set(rows.map((r) => r.owner_id).filter(Boolean))] as string[];
  const nameByOwnerId = await fetchOwnerNames(supabase, ownerIds);

  const records: DrillThroughRecord[] = rows.map((r) => ({
    id: r.id,
    hubspotId: r.hubspot_ticket_id,
    name: (r.raw_payload as Record<string, unknown> | null)?.subject as string ?? r.hubspot_ticket_id,
    ownerName: nameByOwnerId.get(r.owner_id ?? "") ?? "Unassigned",
    stageOrPriority: r.priority ?? "—",
    amount: null,
    date: r.closed_date ?? r.createdate,
  }));

  return { records, reconciledSum: records.length };
}

async function fetchOwnerNames(
  supabase: SupabaseClient<Database>,
  ownerIds: string[],
): Promise<Map<string, string>> {
  if (ownerIds.length === 0) return new Map();
  const { data } = await supabase
    .from("dim_owner")
    .select("hubspot_owner_id, full_name")
    .in("hubspot_owner_id", ownerIds);
  return new Map((data ?? []).map((o) => [o.hubspot_owner_id, o.full_name ?? o.hubspot_owner_id]));
}

async function fetchActiveOwnerIds(supabase: SupabaseClient<Database>): Promise<Set<string>> {
  const { data } = await supabase.from("dim_owner").select("hubspot_owner_id").eq("active", true);
  return new Set((data ?? []).map((o) => o.hubspot_owner_id));
}

async function resolveOwnerIdsByName(
  supabase: SupabaseClient<Database>,
  name: string,
): Promise<Set<string>> {
  const { data } = await supabase.from("dim_owner").select("hubspot_owner_id").eq("full_name", name);
  return new Set((data ?? []).map((o) => o.hubspot_owner_id));
}

async function fetchStageLabels(
  supabase: SupabaseClient<Database>,
  stageIds: string[],
  objectType: "deal" | "ticket",
): Promise<Map<string, string>> {
  if (stageIds.length === 0) return new Map();
  const { data } = await supabase
    .from("dim_pipeline_stage")
    .select("hubspot_stage_id, stage_label")
    .eq("object_type", objectType)
    .in("hubspot_stage_id", stageIds);
  return new Map((data ?? []).map((s) => [s.hubspot_stage_id, s.stage_label ?? s.hubspot_stage_id]));
}
