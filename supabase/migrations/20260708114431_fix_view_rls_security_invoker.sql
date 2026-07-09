-- CRITICAL FIX: Postgres views run with the view OWNER's permissions by
-- default, not the querying user's -- meaning every dashboard view created
-- so far silently bypassed RLS entirely (confirmed via direct test: a Rep
-- querying fact_activity directly got correctly scoped rows, but querying
-- view_recent_activity returned all tenants' owners' rows). Setting
-- security_invoker = true makes the view evaluate RLS as the calling user,
-- exactly like a direct table query. This must be set on every view.

alter view view_stage_funnel set (security_invoker = true);
alter view view_deals_by_owner set (security_invoker = true);
alter view view_deal_source_mix set (security_invoker = true);
alter view view_revenue_trend set (security_invoker = true);
alter view view_pipeline_summary set (security_invoker = true);
alter view view_stage_velocity set (security_invoker = true);
alter view view_activity_summary set (security_invoker = true);
alter view view_sla_summary set (security_invoker = true);
alter view view_sla_by_priority set (security_invoker = true);
alter view view_ticket_volume_trend set (security_invoker = true);
alter view view_backlog_age_bands set (security_invoker = true);
alter view view_recent_activity set (security_invoker = true);
alter view view_stalled_deals set (security_invoker = true);
