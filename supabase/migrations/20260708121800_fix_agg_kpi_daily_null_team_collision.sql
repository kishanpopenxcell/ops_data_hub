-- Fix: GROUPING SETS ((), (o.team_id), (owner_id, o.team_id)) produced two
-- indistinguishable "owner_id=null, team_id=null" rows for the same
-- metric/day whenever an owner had no matching dim_owner row (e.g. the
-- deliberately-seeded orphan owner used for Data-Quality testing): one row
-- was the true tenant-wide grand total, the other was the "no team" bucket
-- from the per-team grouping set, which also collapses owner_id/team_id to
-- null. GROUPING SETS gives no column-level way to tell these apart without
-- adding a GROUPING() marker column, so instead split each metric into three
-- explicit, unambiguous inserts: tenant-wide (all rows), per-team (only
-- rows with a resolved dim_owner team), per-owner (all rows, grouped by
-- owner regardless of team resolution).

create or replace function backfill_agg_kpi_daily(p_tenant_id uuid, p_days int default 30)
returns void
language plpgsql
as $$
declare
  d date;
begin
  delete from agg_kpi_daily where tenant_id = p_tenant_id;

  for d in
    select generate_series(current_date - (p_days - 1), current_date, interval '1 day')::date
  loop
    -- ============================================================
    -- pipeline_value
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'pipeline_value', d, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d);

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'pipeline_value', d, o.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id and o.team_id is not null
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d)
    group by o.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'pipeline_value', d, rd.owner_id, o.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d)
    group by rd.owner_id, o.team_id;

    -- ============================================================
    -- open_value
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'open_value', d, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d);

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'open_value', d, o.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id and o.team_id is not null
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d)
    group by o.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'open_value', d, rd.owner_id, o.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d)
    group by rd.owner_id, o.team_id;

    -- ============================================================
    -- weighted_value
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'weighted_value', d, coalesce(sum(rd.amount * ps.probability), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d);

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'weighted_value', d, o.team_id, coalesce(sum(rd.amount * ps.probability), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id and o.team_id is not null
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d)
    group by o.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'weighted_value', d, rd.owner_id, o.team_id, coalesce(sum(rd.amount * ps.probability), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d and (rd.closedate is null or rd.closedate::date > d)
    group by rd.owner_id, o.team_id;

    -- ============================================================
    -- win_rate
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value, numerator, denominator)
    select p_tenant_id, 'win_rate', d,
      case when count(*) > 0 then count(*) filter (where ps.is_won)::numeric / count(*) else null end,
      count(*) filter (where ps.is_won), count(*)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false and ps.is_closed and rd.closedate::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value, numerator, denominator)
    select p_tenant_id, 'win_rate', d, o.team_id,
      case when count(*) > 0 then count(*) filter (where ps.is_won)::numeric / count(*) else null end,
      count(*) filter (where ps.is_won), count(*)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id and o.team_id is not null
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false and ps.is_closed and rd.closedate::date <= d
    group by o.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value, numerator, denominator)
    select p_tenant_id, 'win_rate', d, rd.owner_id, o.team_id,
      case when count(*) > 0 then count(*) filter (where ps.is_won)::numeric / count(*) else null end,
      count(*) filter (where ps.is_won), count(*)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false and ps.is_closed and rd.closedate::date <= d
    group by rd.owner_id, o.team_id;

    -- ============================================================
    -- avg_sales_cycle
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'avg_sales_cycle', d, avg(extract(epoch from (rd.closedate - rd.createdate)) / 86400.0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false and ps.is_closed and ps.is_won and rd.closedate::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'avg_sales_cycle', d, o.team_id, avg(extract(epoch from (rd.closedate - rd.createdate)) / 86400.0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id and o.team_id is not null
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false and ps.is_closed and ps.is_won and rd.closedate::date <= d
    group by o.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'avg_sales_cycle', d, rd.owner_id, o.team_id, avg(extract(epoch from (rd.closedate - rd.createdate)) / 86400.0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false and ps.is_closed and ps.is_won and rd.closedate::date <= d
    group by rd.owner_id, o.team_id;

    -- ============================================================
    -- avg_stage_velocity
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'avg_stage_velocity', d, avg(t.duration_seconds) / 86400.0
    from fact_stage_transition t
    where t.tenant_id = p_tenant_id and t.object_type = 'deal'
      and t.duration_seconds is not null and t.exited_at::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'avg_stage_velocity', d, o.team_id, avg(t.duration_seconds) / 86400.0
    from fact_stage_transition t
    join dim_owner o on o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id and o.team_id is not null
    where t.tenant_id = p_tenant_id and t.object_type = 'deal'
      and t.duration_seconds is not null and t.exited_at::date <= d
    group by o.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'avg_stage_velocity', d, t.owner_id, o.team_id, avg(t.duration_seconds) / 86400.0
    from fact_stage_transition t
    left join dim_owner o on o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id
    where t.tenant_id = p_tenant_id and t.object_type = 'deal'
      and t.duration_seconds is not null and t.exited_at::date <= d
    group by t.owner_id, o.team_id;

    -- ============================================================
    -- activities_per_rep (tenant-wide + per-team only, by design)
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'activities_per_rep', d,
      count(*)::numeric / nullif(count(distinct a.owner_id), 0)
    from fact_activity a
    where a.tenant_id = p_tenant_id and a.occurred_at::date <= d and a.occurred_at::date > d - 30;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'activities_per_rep', d, o.team_id,
      count(*)::numeric / nullif(count(distinct a.owner_id), 0)
    from fact_activity a
    join dim_owner o on o.tenant_id = a.tenant_id and o.hubspot_owner_id = a.owner_id and o.team_id is not null
    where a.tenant_id = p_tenant_id and a.occurred_at::date <= d and a.occurred_at::date > d - 30
    group by o.team_id;

    -- ============================================================
    -- Ticket/SLA metrics -- fact_ticket_sla already carries owner_id and
    -- team_id directly (no dim_owner join / orphan-owner ambiguity here).
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'first_response', d, avg(extract(epoch from (s.first_response_at - s.created_at)) / 86400.0)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'first_response', d, s.team_id, avg(extract(epoch from (s.first_response_at - s.created_at)) / 86400.0)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d and s.team_id is not null
    group by s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'first_response', d, s.owner_id, s.team_id, avg(extract(epoch from (s.first_response_at - s.created_at)) / 86400.0)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d
    group by s.owner_id, s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'resolution_time', d, avg(extract(epoch from (s.closed_at - s.created_at)) / 86400.0) filter (where s.closed_at is not null)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'resolution_time', d, s.team_id, avg(extract(epoch from (s.closed_at - s.created_at)) / 86400.0) filter (where s.closed_at is not null)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d and s.team_id is not null
    group by s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'resolution_time', d, s.owner_id, s.team_id, avg(extract(epoch from (s.closed_at - s.created_at)) / 86400.0) filter (where s.closed_at is not null)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d
    group by s.owner_id, s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'sla_attainment', d, avg(case when s.first_response_within_sla and coalesce(s.resolution_within_sla, true) then 1.0 else 0.0 end)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'sla_attainment', d, s.team_id, avg(case when s.first_response_within_sla and coalesce(s.resolution_within_sla, true) then 1.0 else 0.0 end)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d and s.team_id is not null
    group by s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'sla_attainment', d, s.owner_id, s.team_id, avg(case when s.first_response_within_sla and coalesce(s.resolution_within_sla, true) then 1.0 else 0.0 end)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d
    group by s.owner_id, s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, value)
    select p_tenant_id, 'backlog', d, count(*) filter (where s.closed_at is null or s.closed_at::date > d)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'backlog', d, s.team_id, count(*) filter (where s.closed_at is null or s.closed_at::date > d)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d and s.team_id is not null
    group by s.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'backlog', d, s.owner_id, s.team_id, count(*) filter (where s.closed_at is null or s.closed_at::date > d)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false and s.created_at::date <= d
    group by s.owner_id, s.team_id;
  end loop;
end;
$$;
