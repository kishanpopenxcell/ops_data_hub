/**
 * Convenience row-type aliases over the generated src/types/database.ts.
 * Safe to hand-edit -- unlike database.ts, this file is never overwritten by
 * `supabase gen types`.
 */

import type { Tables } from "./database";

export type Role = "admin" | "manager" | "rep";
export type ObjectType = "deal" | "ticket";
export type EngagementType = "call" | "email" | "meeting" | "note" | "task";
export type SyncJobType = "backfill" | "webhook" | "reconciliation";
export type SyncJobStatus = "pending" | "running" | "completed" | "failed";
export type AuditAction = "login" | "export" | "role_change" | "connection_change";

export type Tenant = Tables<"tenants">;
export type Team = Tables<"teams">;
export type Profile = Tables<"profiles">;
export type HubspotConnection = Tables<"hubspot_connections">;
export type DimOwner = Tables<"dim_owner">;
export type DimPipelineStage = Tables<"dim_pipeline_stage">;
export type FactDealSnapshot = Tables<"fact_deal_snapshot">;
export type FactStageTransition = Tables<"fact_stage_transition">;
export type FactTicketSla = Tables<"fact_ticket_sla">;
export type FactActivity = Tables<"fact_activity">;
export type AggKpiDaily = Tables<"agg_kpi_daily">;
export type SyncJob = Tables<"sync_jobs">;
export type AuditLog = Tables<"audit_log">;
