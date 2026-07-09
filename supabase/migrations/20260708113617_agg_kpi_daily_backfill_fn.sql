-- Backfill function for agg_kpi_daily: computes each dashboard KPI as-of
-- each of the last 30 days from the historical fact data already seeded
-- (stage transitions, deal create/close dates, ticket timestamps). This
-- gives KPI tiles a genuine trend line + period-over-period delta instead
-- of a cosmetic sparkline -- the "as of day D" value is a real recomputation
-- using only data that existed by that day, not a fabricated series.
--
-- Called once from the seed script after all facts are inserted. Safe to
-- re-run (deletes its own tenant's prior agg_kpi_daily rows first).

create or replace function backfill_agg_kpi_daily(p_tenant_id uuid, p_days int default 30)
returns void
language plpgsql
as $$
declare
  d date;
  v_pipeline_value numeric;
  v_win_rate numeric;
  v_won_count numeric;
  v_decided_count numeric;
  v_activities_per_rep numeric;
  v_open_value numeric;
  v_weighted_value numeric;
  v_avg_sales_cycle numeric;
  v_avg_stage_velocity numeric;
  v_first_response numeric;
  v_resolution_time numeric;
  v_sla_attainment numeric;
  v_backlog numeric;
begin
  delete from agg_kpi_daily where tenant_id = p_tenant_id;

  for d in
    select generate_series(current_date - (p_days - 1), current_date, interval '1 day')::date
  loop
    -- Pipeline value: open deals as of day d (created on/before d, not yet closed by d)
    select coalesce(sum(amount), 0) into v_pipeline_value
    from raw_deals
    where tenant_id = p_tenant_id and is_deleted = false
      and createdate::date <= d
      and (closedate is null or closedate::date > d);

    select coalesce(sum(amount), 0) into v_open_value
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d);

    select coalesce(sum(rd.amount * ps.probability), 0) into v_weighted_value
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d);

    -- Win rate: deals closed on/before day d
    select count(*) filter (where ps.is_won), count(*)
      into v_won_count, v_decided_count
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and ps.is_closed and rd.closedate::date <= d;

    v_win_rate := case when v_decided_count > 0 then v_won_count / v_decided_count else null end;

    select avg(extract(epoch from (rd.closedate - rd.createdate)) / 86400.0) into v_avg_sales_cycle
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and ps.is_closed and ps.is_won and rd.closedate::date <= d;

    -- Stage velocity: completed transitions that exited on/before day d
    select avg(duration_seconds) / 86400.0 into v_avg_stage_velocity
    from fact_stage_transition
    where tenant_id = p_tenant_id and object_type = 'deal'
      and duration_seconds is not null and exited_at::date <= d;

    -- Activities per rep: trailing 30-day window ending on day d
    select count(*)::numeric / nullif(count(distinct owner_id), 0) into v_activities_per_rep
    from fact_activity
    where tenant_id = p_tenant_id
      and occurred_at::date <= d and occurred_at::date > d - 30;

    -- SLA: tickets created on/before day d
    select
      avg(extract(epoch from (first_response_at - created_at)) / 86400.0),
      avg(extract(epoch from (closed_at - created_at)) / 86400.0) filter (where closed_at is not null),
      avg(case when first_response_within_sla and coalesce(resolution_within_sla, true) then 1.0 else 0.0 end),
      count(*) filter (where closed_at is null or closed_at::date > d)
      into v_first_response, v_resolution_time, v_sla_attainment, v_backlog
    from fact_ticket_sla
    where tenant_id = p_tenant_id and is_dq_excluded = false
      and created_at::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value, numerator, denominator)
    values
      (p_tenant_id, 'pipeline_value', d, v_pipeline_value, null, null),
      (p_tenant_id, 'open_value', d, v_open_value, null, null),
      (p_tenant_id, 'weighted_value', d, v_weighted_value, null, null),
      (p_tenant_id, 'win_rate', d, v_win_rate, v_won_count, v_decided_count),
      (p_tenant_id, 'avg_sales_cycle', d, v_avg_sales_cycle, null, null),
      (p_tenant_id, 'avg_stage_velocity', d, v_avg_stage_velocity, null, null),
      (p_tenant_id, 'activities_per_rep', d, v_activities_per_rep, null, null),
      (p_tenant_id, 'first_response', d, v_first_response, null, null),
      (p_tenant_id, 'resolution_time', d, v_resolution_time, null, null),
      (p_tenant_id, 'sla_attainment', d, v_sla_attainment, null, null),
      (p_tenant_id, 'backlog', d, v_backlog, null, null);
  end loop;
end;
$$;
