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

// Dashboard aggregation views (Phase 1)
export type StageFunnelRow = Tables<"view_stage_funnel">;
export type DealsByOwnerRow = Tables<"view_deals_by_owner">;
export type DealSourceMixRow = Tables<"view_deal_source_mix">;
export type RevenueTrendRow = Tables<"view_revenue_trend">;
export type PipelineSummaryRow = Tables<"view_pipeline_summary">;
export type StageVelocityRow = Tables<"view_stage_velocity">;
export type ActivitySummaryRow = Tables<"view_activity_summary">;
export type SlaSummaryRow = Tables<"view_sla_summary">;
export type SlaByPriorityRow = Tables<"view_sla_by_priority">;
export type TicketVolumeTrendRow = Tables<"view_ticket_volume_trend">;
export type BacklogAgeBandsRow = Tables<"view_backlog_age_bands">;
export type RecentActivityRow = Tables<"view_recent_activity">;
export type StalledDealRow = Tables<"view_stalled_deals">;
