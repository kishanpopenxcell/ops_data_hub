-- RLS policies for MVP 3-role model (admin / manager / rep)
-- Derived from DESIGN_01_Database_Schema_RLS.md section 4
-- Uses stable security-definer helper functions to avoid repeated subqueries per row.

-- ============================================================
-- 1. Auth helper functions
-- ============================================================

create or replace function auth_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from profiles where id = auth.uid();
$$;

create or replace function auth_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_owner_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select hubspot_owner_id from profiles where id = auth.uid();
$$;

create or replace function auth_team_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id from profiles where id = auth.uid();
$$;

-- ============================================================
-- 2. Enable RLS on all tenant-scoped tables
-- ============================================================

alter table tenants enable row level security;
alter table teams enable row level security;
alter table profiles enable row level security;
alter table hubspot_connections enable row level security;
alter table dim_owner enable row level security;
alter table dim_pipeline_stage enable row level security;
alter table raw_deals enable row level security;
alter table raw_tickets enable row level security;
alter table raw_engagements enable row level security;
alter table raw_property_history enable row level security;
alter table fact_deal_snapshot enable row level security;
alter table fact_stage_transition enable row level security;
alter table fact_ticket_sla enable row level security;
alter table fact_activity enable row level security;
alter table agg_kpi_daily enable row level security;
alter table sync_jobs enable row level security;
alter table audit_log enable row level security;

-- ============================================================
-- 3. Dimension / metadata tables: tenant isolation only, all roles read
-- ============================================================

create policy tenant_isolation_select on teams
  for select using (tenant_id = auth_tenant_id());

create policy tenant_isolation_select on dim_owner
  for select using (tenant_id = auth_tenant_id());

create policy tenant_isolation_select on dim_pipeline_stage
  for select using (tenant_id = auth_tenant_id());

-- dim_date has no tenant_id (shared calendar dimension) -- readable by any authenticated user
alter table dim_date enable row level security;
create policy authenticated_read on dim_date
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- 4. profiles: self row always visible; admin sees/manages all in tenant
-- ============================================================

create policy self_select on profiles
  for select using (id = auth.uid());

create policy admin_select_all on profiles
  for select using (auth_role() = 'admin' and tenant_id = auth_tenant_id());

create policy admin_manage_profiles on profiles
  for update using (auth_role() = 'admin' and tenant_id = auth_tenant_id());

-- ============================================================
-- 5. hubspot_connections: admin only (manage capability per RBAC matrix)
-- ============================================================

create policy admin_select_connections on hubspot_connections
  for select using (auth_role() = 'admin' and tenant_id = auth_tenant_id());

create policy admin_manage_connections on hubspot_connections
  for all using (auth_role() = 'admin' and tenant_id = auth_tenant_id());

-- ============================================================
-- 6. Role-scoped fact/raw tables
-- Pattern repeated per table: tenant isolation + admin-all + manager-team + rep-own
-- ============================================================

-- fact_deal_snapshot
create policy scope_admin on fact_deal_snapshot
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on fact_deal_snapshot
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'manager' and team_id = auth_team_id());
create policy scope_rep on fact_deal_snapshot
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

-- fact_stage_transition (no team_id column -- scope via owner_id only; manager scope
-- resolved via dim_owner join at query time in MVP, since transitions don't carry team_id directly)
create policy scope_admin on fact_stage_transition
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on fact_stage_transition
  for select using (
    tenant_id = auth_tenant_id() and auth_role() = 'manager'
    and owner_id in (select hubspot_owner_id from dim_owner where tenant_id = auth_tenant_id() and team_id = auth_team_id())
  );
create policy scope_rep on fact_stage_transition
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

-- fact_ticket_sla
create policy scope_admin on fact_ticket_sla
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on fact_ticket_sla
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'manager' and team_id = auth_team_id());
create policy scope_rep on fact_ticket_sla
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

-- fact_activity
create policy scope_admin on fact_activity
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on fact_activity
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'manager' and team_id = auth_team_id());
create policy scope_rep on fact_activity
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

-- agg_kpi_daily (dashboards' hot read path)
create policy scope_admin on agg_kpi_daily
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on agg_kpi_daily
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'manager' and (team_id = auth_team_id() or team_id is null));
create policy scope_rep on agg_kpi_daily
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

-- raw_deals / raw_tickets / raw_engagements: same admin/manager/rep pattern via owner_id
create policy scope_admin on raw_deals
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on raw_deals
  for select using (
    tenant_id = auth_tenant_id() and auth_role() = 'manager'
    and owner_id in (select hubspot_owner_id from dim_owner where tenant_id = auth_tenant_id() and team_id = auth_team_id())
  );
create policy scope_rep on raw_deals
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

create policy scope_admin on raw_tickets
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on raw_tickets
  for select using (
    tenant_id = auth_tenant_id() and auth_role() = 'manager'
    and owner_id in (select hubspot_owner_id from dim_owner where tenant_id = auth_tenant_id() and team_id = auth_team_id())
  );
create policy scope_rep on raw_tickets
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

create policy scope_admin on raw_engagements
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'admin');
create policy scope_manager on raw_engagements
  for select using (
    tenant_id = auth_tenant_id() and auth_role() = 'manager'
    and owner_id in (select hubspot_owner_id from dim_owner where tenant_id = auth_tenant_id() and team_id = auth_team_id())
  );
create policy scope_rep on raw_engagements
  for select using (tenant_id = auth_tenant_id() and auth_role() = 'rep' and owner_id = auth_owner_id());

-- raw_property_history: admin + manager full tenant read (history has no owner_id directly;
-- object-level scoping deferred -- MVP simplification, admin/manager only, reps don't need raw history)
create policy scope_admin_manager on raw_property_history
  for select using (tenant_id = auth_tenant_id() and auth_role() in ('admin', 'manager'));

-- ============================================================
-- 7. Operational tables: admin-only read (matches RBAC matrix, audit log view = admin)
-- ============================================================

create policy admin_only_select on sync_jobs
  for select using (auth_role() = 'admin' and tenant_id = auth_tenant_id());

create policy admin_only_select on audit_log
  for select using (auth_role() = 'admin' and tenant_id = auth_tenant_id());

-- Note: writes to raw_*, fact_*, agg_kpi_daily, sync_jobs, audit_log come from the sync
-- engine (Supabase Edge Functions) using the service_role key, which bypasses RLS by
-- design. No user-facing insert/update/delete policies are defined for those tables in MVP.
