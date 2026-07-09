-- Fix: the previous per-owner/per-team rewrite only ever produced a
-- tenant-wide row (owner_id/team_id both null) and a per-owner row
-- (owner_id set, team_id set) -- there was no genuine team-level rollup row
-- (owner_id null, team_id set), so a Manager's RLS policy
-- (team_id = auth_team_id() OR team_id IS NULL) matched BOTH their own
-- team's per-owner rows AND the unrelated tenant-wide row, and the query
-- layer had no way to pick the right one deterministically. Using proper
-- GROUPING SETS produces all three distinct grains explicitly.

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
    -- Deal-based metrics: tenant-wide, per-team, and per-owner grains via
    -- GROUPING SETS on (owner_id, team_id).
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'pipeline_value', d, rd.owner_id, o.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d)
    group by grouping sets ((), (o.team_id), (rd.owner_id, o.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'open_value', d, rd.owner_id, o.team_id, coalesce(sum(rd.amount), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d)
    group by grouping sets ((), (o.team_id), (rd.owner_id, o.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'weighted_value', d, rd.owner_id, o.team_id, coalesce(sum(rd.amount * ps.probability), 0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and rd.createdate::date <= d
      and (rd.closedate is null or rd.closedate::date > d)
    group by grouping sets ((), (o.team_id), (rd.owner_id, o.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value, numerator, denominator)
    select
      p_tenant_id, 'win_rate', d, rd.owner_id, o.team_id,
      case when count(*) > 0 then count(*) filter (where ps.is_won)::numeric / count(*) else null end,
      count(*) filter (where ps.is_won),
      count(*)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and ps.is_closed and rd.closedate::date <= d
    group by grouping sets ((), (o.team_id), (rd.owner_id, o.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'avg_sales_cycle', d, rd.owner_id, o.team_id,
      avg(extract(epoch from (rd.closedate - rd.createdate)) / 86400.0)
    from raw_deals rd
    join dim_pipeline_stage ps on ps.tenant_id = rd.tenant_id and ps.hubspot_stage_id = rd.stage_id and ps.object_type = 'deal'
    left join dim_owner o on o.tenant_id = rd.tenant_id and o.hubspot_owner_id = rd.owner_id
    where rd.tenant_id = p_tenant_id and rd.is_deleted = false
      and ps.is_closed and ps.is_won and rd.closedate::date <= d
    group by grouping sets ((), (o.team_id), (rd.owner_id, o.team_id));

    -- ============================================================
    -- Stage velocity
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'avg_stage_velocity', d, t.owner_id, o.team_id, avg(t.duration_seconds) / 86400.0
    from fact_stage_transition t
    left join dim_owner o on o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id
    where t.tenant_id = p_tenant_id and t.object_type = 'deal'
      and t.duration_seconds is not null and t.exited_at::date <= d
    group by grouping sets ((), (o.team_id), (t.owner_id, o.team_id));

    -- ============================================================
    -- Activities per rep: tenant-wide and per-team only (see prior note --
    -- a per-owner "activities per rep" is a different, less useful metric).
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, team_id, value)
    select p_tenant_id, 'activities_per_rep', d, o.team_id,
      count(*)::numeric / nullif(count(distinct a.owner_id), 0)
    from fact_activity a
    left join dim_owner o on o.tenant_id = a.tenant_id and o.hubspot_owner_id = a.owner_id
    where a.tenant_id = p_tenant_id
      and a.occurred_at::date <= d and a.occurred_at::date > d - 30
    group by grouping sets ((), (o.team_id));

    -- ============================================================
    -- Ticket/SLA metrics -- fact_ticket_sla already carries both owner_id
    -- and team_id directly, no join needed.
    -- ============================================================
    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'first_response', d, s.owner_id, s.team_id,
      avg(extract(epoch from (s.first_response_at - s.created_at)) / 86400.0)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grouping sets ((), (s.team_id), (s.owner_id, s.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'resolution_time', d, s.owner_id, s.team_id,
      avg(extract(epoch from (s.closed_at - s.created_at)) / 86400.0) filter (where s.closed_at is not null)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grouping sets ((), (s.team_id), (s.owner_id, s.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'sla_attainment', d, s.owner_id, s.team_id,
      avg(case when s.first_response_within_sla and coalesce(s.resolution_within_sla, true) then 1.0 else 0.0 end)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grouping sets ((), (s.team_id), (s.owner_id, s.team_id));

    insert into agg_kpi_daily (tenant_id, metric_key, date_key, owner_id, team_id, value)
    select p_tenant_id, 'backlog', d, s.owner_id, s.team_id,
      count(*) filter (where s.closed_at is null or s.closed_at::date > d)
    from fact_ticket_sla s
    where s.tenant_id = p_tenant_id and s.is_dq_excluded = false
      and s.created_at::date <= d
    group by grouping sets ((), (s.team_id), (s.owner_id, s.team_id));
  end loop;
end;
$$;
