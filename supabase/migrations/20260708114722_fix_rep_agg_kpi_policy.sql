-- Fix: Rep's agg_kpi_daily policy required owner_id = their own hubspot_owner_id
-- on every row, but KPI tiles are backfilled as tenant-wide aggregates
-- (owner_id is null) -- so Reps saw zero KPI rows and every KPI tile was
-- empty. Manager's policy already has a fallback for team_id IS NULL rows;
-- align Rep's policy the same way so top-line KPI tiles show tenant-wide
-- figures for all roles, while detail tables (raw_deals, fact_activity,
-- etc.) remain correctly scoped to only the Rep's own records.

drop policy scope_rep on agg_kpi_daily;

create policy scope_rep on agg_kpi_daily
  for select using (
    tenant_id = auth_tenant_id() and auth_role() = 'rep'
    and (owner_id = auth_owner_id() or owner_id is null)
  );
