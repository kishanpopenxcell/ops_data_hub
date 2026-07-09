-- Fix: avg_days should reflect the historical average time ANY deal has
-- spent passing through a stage (using completed transitions), not be
-- gated on whether currently-open deals happen to still be sitting there --
-- that left every open stage's avg_days as null since in-progress dwell
-- times are correctly excluded now, but the historical baseline itself
-- should come from fact_stage_transition directly (all deals that have
-- ever passed through the stage), decoupled from raw_deals' current
-- stage_id. deal_count/total_value stay tied to current stage occupancy;
-- avg_days becomes the baseline used to judge whether that occupancy is
-- normal or stalled.

drop view view_stage_funnel;

create view view_stage_funnel as
with current_occupancy as (
  select
    tenant_id,
    stage_id,
    count(*) as deal_count,
    sum(amount) as total_value
  from raw_deals
  where is_deleted = false
  group by tenant_id, stage_id
),
historical_baseline as (
  select
    tenant_id,
    to_stage_id as stage_id,
    avg(extract(epoch from (exited_at - entered_at)) / 86400.0) as avg_days
  from fact_stage_transition
  where object_type = 'deal' and exited_at is not null
  group by tenant_id, to_stage_id
)
select
  ps.tenant_id,
  ps.hubspot_stage_id as stage_id,
  ps.stage_label,
  ps.display_order,
  coalesce(co.deal_count, 0) as deal_count,
  coalesce(co.total_value, 0) as total_value,
  hb.avg_days
from dim_pipeline_stage ps
left join current_occupancy co
  on co.tenant_id = ps.tenant_id and co.stage_id = ps.hubspot_stage_id
left join historical_baseline hb
  on hb.tenant_id = ps.tenant_id and hb.stage_id = ps.hubspot_stage_id
where ps.object_type = 'deal';
