-- Rewrite of backfill_agg_kpi_daily: computes each KPI at THREE grains --
-- tenant-wide (owner_id/team_id both null), per-team, and per-owner -- for
-- every day in the window. This fixes a real reconciliation bug: KPI tiles
-- were tenant-wide for every role, but drill-through queries are correctly
-- RLS-scoped to the viewer's own records, so a Manager's tile said $2.6M
-- while their drill-through only summed to $1.1M (their team's slice) --
-- numbers that are supposed to reconcile per the product's core trust
-- principle didn't. Now every role's tile is computed at their own grain,
-- so the number displayed always equals the sum of what they can drill into.
--
-- Uses set-based group-by queries per grain instead of one row of scalar
-- subqueries per grain, since scalar-per-metric doesn't scale cleanly to 3
-- grains x 11 metrics x 30 days.

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
    -- Deal-based metrics, grouped by (owner_id, team_id) with a
    -- tenant-wide row (owner_id/team_id both null) unioned in via
    -- grouping sets.
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value, numerator, denominator)
    select
      p_tenant_id,
      'pipeline_value',
      d,
      grp.owner_id,
      grp.team_id,
      coalesce(sum(rd.amount), 0),
      null,
      null
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    cross join lateral (values (null::text, null::uuid), (rd.owner_id, o.team_id)) as grp(owner_id, team_id)
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d)
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'open_value', d, grp.owner_id, grp.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    cross join lateral (values (null::text, null::uuid), (rd.owner_id, o.team_id)) as grp(owner_id, team_id)
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d)
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'weighted_value', d, grp.owner_id, grp.team_id, coalesce(sum(rd.amount * ps.probability), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    cross join lateral (values (null::text, null::uuid), (rd.owner_id, o.team_id)) as grp(owner_id, team_id)
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d)
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value, numerator, denominator)
    select
      p_tenant_id, 'win_rate', d, grp.owner_id, grp.team_id,
      case when count(*) > 0 then count(*) filter (where ps.is_won)::numeric / count(*) else null end,
      count(*) filter (where ps.is_won),
      count(*)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    cross join lateral (values (null::text, null::uuid), (rd.owner_id, o.team_id)) as grp(owner_id, team_id)
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and ps.is_closed and rd.closedate::date <= d
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'avg_sales_cycle', d, grp.owner_id, grp.team_id,
      avg(extract(epoch from (rd.closedate - rd.createdate)) / 86400.0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    cross join lateral (values (null::text, null::uuid), (rd.owner_id, o.team_id)) as grp(owner_id, team_id)
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and ps.is_closed and ps.is_won and rd.closedate::date <= d
    group by grp.owner_id, grp.team_id;

    -- ============================================================
    -- Stage velocity: from fact_stage_transition (already carries owner_id)
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'avg_stage_velocity', d, grp.owner_id, grp.team_id,
      avg(t.duration_seconds) / 86400.0
    from fact_stage_transition t
    left join dim_owner o on o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id
    cross join lateral (values (null::text, null::uuid), (t.owner_id, o.team_id)) as grp(owner_id, team_id)
    where t.tenant_id = p_tenant_id and t.object_type = 'deal'
      and t.duration_seconds is not null and t.exited_at::date <= d
    group by grp.owner_id, grp.team_id;

    -- ============================================================
    -- Activities per rep: tenant-wide and per-team only (a single rep's
    -- "per rep" figure would trivially equal their own activity count,
    -- which is a different, less useful metric -- keep per-owner grain
    -- out of this one metric specifically).
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'activities_per_rep', d, grp.owner_id, grp.team_id,
      count(*)::numeric / nullif(count(distinct a.owner_id), 0)
    from fact_activity a
    left join dim_owner o on o.tenant_id = a.tenant_id and o.hubspot_owner_id = a.owner_id
    cross join lateral (values (null::text, null::uuid), (a.owner_id, o.team_id)) as grp(owner_id, team_id)
    where a.tenant_id = p_tenant_id
      and a.occurred_at::date <= d and a.occurred_at::date > d - 30
    group by grp.owner_id, grp.team_id;

    -- ============================================================
    -- Ticket/SLA metrics, same three-grain pattern
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'first_response', d, grp.owner_id, grp.team_id,
      avg(extract(epoch from (s.first_response_at - s.created_at)) / 86400.0)
    from fact_ticket_sla s
    cross join lateral (values (null::text, null::uuid), (s.owner_id, s.team_id)) as grp(owner_id, team_id)
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'resolution_time', d, grp.owner_id, grp.team_id,
      avg(extract(epoch from (s.closed_at - s.created_at)) / 86400.0) filter (where s.closed_at is not null)
    from fact_ticket_sla s
    cross join lateral (values (null::text, null::uuid), (s.owner_id, s.team_id)) as grp(owner_id, team_id)
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'sla_attainment', d, grp.owner_id, grp.team_id,
      avg(case when s.first_response_within_sla and coalesce(s.resolution_within_sla, true) then 1.0 else 0.0 end)
    from fact_ticket_sla s
    cross join lateral (values (null::text, null::uuid), (s.owner_id, s.team_id)) as grp(owner_id, team_id)
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grp.owner_id, grp.team_id;

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'backlog', d, grp.owner_id, grp.team_id,
      count(*) filter (where s.closed_at is null or s.closed_at::date > d)
    from fact_ticket_sla s
    cross join lateral (values (null::text, null::uuid), (s.owner_id, s.team_id)) as grp(owner_id, team_id)
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grp.owner_id, grp.team_id;
  end loop;
end;
$$;
