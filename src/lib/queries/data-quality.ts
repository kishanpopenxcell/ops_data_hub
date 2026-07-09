import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export interface CompletenessRow {
  objectType: "deal" | "ticket";
  field: string;
  totalCount: number;
  missingCount: number;
  completenessPct: number;
}

export interface DqIssue {
  objectType: "deal" | "ticket";
  objectId: string;
  objectName: string;
  issueType: "missing_amount" | "missing_priority" | "orphan_owner";
  ownerName: string | null;
  createdAt: string | null;
}

export interface OrphanOwnerRow {
  ownerId: string;
  recordCount: number;
}

export interface DqSummary {
  totalIssues: number;
  overallCompletenessPct: number;
  staleCount: number;
  orphanOwnerCount: number;
}

export async function getDqCompleteness(supabase: SupabaseClient<Database>): Promise<CompletenessRow[]> {
  const { data, error } = await supabase
    .from("view_dq_completeness")
    .select("object_type, field, total_count, missing_count");
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => {
    const total = Number(row.total_count ?? 0);
    const missing = Number(row.missing_count ?? 0);
    return {
      objectType: row.object_type as "deal" | "ticket",
      field: row.field ?? "unknown",
      totalCount: total,
      missingCount: missing,
      completenessPct: total > 0 ? (total - missing) / total : 1,
    };
  });
}

export async function getDqIssues(supabase: SupabaseClient<Database>, limit = 50): Promise<DqIssue[]> {
  const { data, error } = await supabase
    .from("view_dq_issues")
    .select("object_type, object_id, object_name, issue_type, owner_name, createdate")
    .order("createdate", { ascending: false })
    .limit(limit);
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    objectType: row.object_type as "deal" | "ticket",
    objectId: row.object_id ?? "",
    objectName: row.object_name ?? row.object_id ?? "Unknown",
    issueType: row.issue_type as DqIssue["issueType"],
    ownerName: row.owner_name,
    createdAt: row.createdate,
  }));
}

export async function getDqOrphanOwners(supabase: SupabaseClient<Database>): Promise<OrphanOwnerRow[]> {
  const { data, error } = await supabase.from("view_dq_orphan_owners").select("owner_id, record_count");
  if (error) throw error;
  if (!data) return [];

  return data.map((row) => ({
    ownerId: row.owner_id ?? "Unknown",
    recordCount: Number(row.record_count ?? 0),
  }));
}

export async function getDqSummary(supabase: SupabaseClient<Database>): Promise<DqSummary> {
  const [completeness, issuesCountRes, staleCountRes, orphanOwners] = await Promise.all([
    getDqCompleteness(supabase),
    supabase.from("view_dq_issues").select("*", { count: "exact", head: true }),
    supabase.from("view_dq_stale_records").select("*", { count: "exact", head: true }),
    getDqOrphanOwners(supabase),
  ]);

  const totalRecords = completeness.reduce((sum, r) => sum + r.totalCount, 0);
  const totalMissing = completeness.reduce((sum, r) => sum + r.missingCount, 0);

  return {
    totalIssues: issuesCountRes.count ?? 0,
    overallCompletenessPct: totalRecords > 0 ? (totalRecords - totalMissing) / totalRecords : 1,
    staleCount: staleCountRes.count ?? 0,
    orphanOwnerCount: orphanOwners.reduce((sum, r) => sum + r.recordCount, 0),
  };
}
