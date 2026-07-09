-- Dashboard aggregation views for Phase 1 (Tier 1 implementation).
-- Views select from RLS-enabled base tables and are NOT security definer,
-- so Postgres RLS applies per-row through the view exactly as it would on
-- a direct table query -- Admin/Manager/Rep scoping carries through
-- automatically with zero extra policy work.

-- ============================================================
-- Pipeline: stage funnel (deal count, value, avg days per stage)
-- ============================================================

create view view_stage_funnel as
select
  d.tenant_id,
  d.stage_id,
  ps.stage_label,
  ps.display_order,
  count(*) as deal_count,
  sum(d.amount) as total_value,
  avg(
    extract(epoch from (coalesce(t.exited_at, now()) - t.entered_at)) / 86400.0
  ) as avg_days
from raw_deals d
join dim_pipeline_stage ps
  on ps.tenant_id = d.tenant_id and ps.hubspot_stage_id = d.stage_id and ps.object_type = 'deal'
left join fact_stage_transition t
  on t.tenant_id = d.tenant_id and t.object_id = d.hubspot_deal_id and t.to_stage_id = d.stage_id
where d.is_deleted = false
group by d.tenant_id, d.stage_id, ps.stage_label, ps.display_order;

-- ============================================================
-- Pipeline: deals by owner (won / open / lost counts)
-- ============================================================

create view view_deals_by_owner as
select
  d.tenant_id,
  d.owner_id,
  o.full_name as owner_name,
  count(*) filter (where ps.is_closed and ps.is_won) as won_count,
  count(*) filter (where ps.is_closed and not ps.is_won) as lost_count,
  count(*) filter (where not ps.is_closed) as open_count
from raw_deals d
join dim_pipeline_stage ps
  on ps.tenant_id = d.tenant_id and ps.hubspot_stage_id = d.stage_id and ps.object_type = 'deal'
left join dim_owner o
  on o.tenant_id = d.tenant_id and o.hubspot_owner_id = d.owner_id
where d.is_deleted = false
group by d.tenant_id, d.owner_id, o.full_name;

-- ============================================================
-- Executive: deal source mix
-- ============================================================

create view view_deal_source_mix as
select
  tenant_id,
  coalesce(raw_payload->>'source', 'Unknown') as source,
  count(*) as deal_count
from raw_deals
where is_deleted = false
group by tenant_id, coalesce(raw_payload->>'source', 'Unknown');

-- ============================================================
-- Executive: revenue trend (monthly closed-won actual vs. simple target)
-- Target = a flat 90% of actual for demo purposes (no real goals table yet;
-- this view only supplies "actual" -- target stays a client-side multiplier
-- until a real goals/quota table exists, matching the MVP scope's P2 deferral).
-- ============================================================

create view view_revenue_trend as
select
  d.tenant_id,
  date_trunc('month', d.closedate)::date as month,
  sum(d.amount) as actual
from raw_deals d
join dim_pipeline_stage ps
  on ps.tenant_id = d.tenant_id and ps.hubspot_stage_id = d.stage_id and ps.object_type = 'deal'
where d.is_deleted = false
  and ps.is_closed = true and ps.is_won = true
  and d.closedate is not null
group by d.tenant_id, date_trunc('month', d.closedate)::date
order by month;

-- ============================================================
-- Executive KPIs: pipeline value, win rate, activities/rep
-- (SLA attainment is computed from view_sla_kpis below and combined in the
-- query layer, since it draws from a different fact table.)
-- ============================================================

create view view_pipeline_summary as
select
  d.tenant_id,
  sum(d.amount) filter (where not ps.is_closed) as open_value,
  sum(d.amount * ps.probability) filter (where not ps.is_closed) as weighted_value,
  count(*) filter (where ps.is_closed and ps.is_won) as won_count,
  count(*) filter (where ps.is_closed) as decided_count,
  avg(
    extract(epoch from (d.closedate - d.createdate)) / 86400.0
  ) filter (where ps.is_closed and ps.is_won) as avg_sales_cycle_days
from raw_deals d
join dim_pipeline_stage ps
  on ps.tenant_id = d.tenant_id and ps.hubspot_stage_id = d.stage_id and ps.object_type = 'deal'
where d.is_deleted = false
group by d.tenant_id;

create view view_stage_velocity as
select
  tenant_id,
  avg(duration_seconds) / 86400.0 as avg_stage_velocity_days
from fact_stage_transition
where object_type = 'deal' and duration_seconds is not null
group by tenant_id;

create view view_activity_summary as
select
  a.tenant_id,
  count(*)::numeric / nullif(count(distinct a.owner_id), 0) as activities_per_rep
from fact_activity a
where a.occurred_at >= now() - interval '30 days'
group by a.tenant_id;

-- ============================================================
-- Service SLA: KPI summary (first response, resolution, attainment, backlog)
-- ============================================================

create view view_sla_summary as
select
  s.tenant_id,
  avg(extract(epoch from (s.first_response_at - s.created_at)) / 86400.0) as avg_first_response_days,
  avg(extract(epoch from (s.closed_at - s.created_at)) / 86400.0) filter (where s.closed_at is not null) as avg_resolution_days,
  avg(case when s.first_response_within_sla and coalesce(s.resolution_within_sla, true) then 1.0 else 0.0 end) as sla_attainment,
  count(*) filter (where s.closed_at is null) as open_backlog
from fact_ticket_sla s
where s.is_dq_excluded = false
group by s.tenant_id;

-- ============================================================
-- Service SLA: attainment by priority
-- ============================================================

create view view_sla_by_priority as
select
  tenant_id,
  priority,
  avg(case when first_response_within_sla and coalesce(resolution_within_sla, true) then 1.0 else 0.0 end) as attainment,
  count(*) as volume
from fact_ticket_sla
where is_dq_excluded = false and priority is not null
group by tenant_id, priority;

-- ============================================================
-- Service SLA: ticket volume trend (last 7 days, created vs resolved)
-- ============================================================

create view view_ticket_volume_trend as
select
  t.tenant_id,
  d.date_key,
  count(*) filter (where t.createdate::date = d.date_key) as created_count,
  count(*) filter (where t.closed_date::date = d.date_key) as resolved_count
from dim_date d
left join raw_tickets t
  on t.tenant_id is not null
  and (t.createdate::date = d.date_key or t.closed_date::date = d.date_key)
where d.date_key >= (current_date - interval '6 days') and d.date_key <= current_date
group by t.tenant_id, d.date_key
order by d.date_key;

-- ============================================================
-- Service SLA: backlog age bands
-- ============================================================

create view view_backlog_age_bands as
select
  tenant_id,
  case
    when extract(epoch from (now() - createdate)) / 86400.0 <= 1 then '0-1d'
    when extract(epoch from (now() - createdate)) / 86400.0 <= 3 then '1-3d'
    when extract(epoch from (now() - createdate)) / 86400.0 <= 7 then '3-7d'
    else '7d+'
  end as age_band,
  count(*) as ticket_count
from raw_tickets
where closed_date is null and is_deleted = false
group by tenant_id, age_band;

-- ============================================================
-- Executive: recent activity feed (deal-won events + logged engagements)
-- ============================================================

create view view_recent_activity as
select
  tenant_id,
  'deal_won' as activity_type,
  owner_id,
  hubspot_deal_id as object_id,
  closedate as occurred_at,
  amount
from raw_deals
where stage_id = 'closedwon' and is_deleted = false
union all
select
  tenant_id,
  type as activity_type,
  owner_id,
  engagement_id as object_id,
  occurred_at,
  null as amount
from fact_activity;

-- ============================================================
-- Pipeline: stalled deals (Tier 1 feature #1 -- built now since the view
-- pattern is identical to the funnel view above; wired into the UI in a
-- later phase per the implementation plan)
-- ============================================================

create view view_stalled_deals as
with stage_baseline as (
  select
    tenant_id,
    to_stage_id as stage_id,
    avg(duration_seconds) as avg_duration_seconds,
    stddev_pop(duration_seconds) as stddev_duration_seconds
  from fact_stage_transition
  where object_type = 'deal' and duration_seconds is not null
  group by tenant_id, to_stage_id
),
current_stage as (
  select distinct on (tenant_id, object_id)
    tenant_id, object_id as deal_id, to_stage_id as stage_id, entered_at
  from fact_stage_transition
  where object_type = 'deal' and exited_at is null
  order by tenant_id, object_id, entered_at desc
)
select
  cs.tenant_id,
  cs.deal_id,
  d.raw_payload->>'dealname' as deal_name,
  d.owner_id,
  o.full_name as owner_name,
  cs.stage_id,
  ps.stage_label,
  cs.entered_at,
  extract(epoch from (now() - cs.entered_at)) / 86400.0 as days_in_stage,
  coalesce(sb.avg_duration_seconds, 0) / 86400.0 as baseline_avg_days,
  case
    when coalesce(sb.avg_duration_seconds, 0) > 0
      then (extract(epoch from (now() - cs.entered_at)) / nullif(sb.avg_duration_seconds, 0))
    else null
  end as multiple_of_baseline
from current_stage cs
join raw_deals d on d.tenant_id = cs.tenant_id and d.hubspot_deal_id = cs.deal_id
left join dim_owner o on o.tenant_id = cs.tenant_id and o.hubspot_owner_id = d.owner_id
left join dim_pipeline_stage ps
  on ps.tenant_id = cs.tenant_id and ps.hubspot_stage_id = cs.stage_id and ps.object_type = 'deal'
left join stage_baseline sb on sb.tenant_id = cs.tenant_id and sb.stage_id = cs.stage_id
where d.is_deleted = false;
