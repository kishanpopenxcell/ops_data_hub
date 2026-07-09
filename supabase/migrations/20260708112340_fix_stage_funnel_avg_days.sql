-- Fix: view_stage_funnel's avg_days was including currently-open (not yet
-- exited) transitions, using (now() - entered_at) for the live dwell time.
-- That makes a single long-stalled deal massively skew the "typical time in
-- stage" figure the funnel chart displays (a legitimate stalled deal should
-- show up in view_stalled_deals, not distort the funnel's baseline).
-- Recompute avg_days from completed (exited_at is not null) transitions only.

drop view view_stage_funnel;

create view view_stage_funnel as
select
  d.tenant_id,
  d.stage_id,
  ps.stage_label,
  ps.display_order,
  count(*) as deal_count,
  sum(d.amount) as total_value,
  avg(
    extract(epoch from (t.exited_at - t.entered_at)) / 86400.0
  ) filter (where t.exited_at is not null) as avg_days
from raw_deals d
join dim_pipeline_stage ps
  on ps.tenant_id = d.tenant_id and ps.hubspot_stage_id = d.stage_id and ps.object_type = 'deal'
left join fact_stage_transition t
  on t.tenant_id = d.tenant_id and t.object_id = d.hubspot_deal_id and t.to_stage_id = d.stage_id
where d.is_deleted = false
group by d.tenant_id, d.stage_id, ps.stage_label, ps.display_order;
