-- Initial MVP schema for Operations Analytics on HubSpot
-- Derived from DESIGN_01_Database_Schema_RLS.md
-- Order: tenancy/identity -> dimensions -> raw mirrors -> facts -> aggregates -> operational

-- ============================================================
-- 1. Core tenancy & identity
-- ============================================================

create table tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reporting_timezone text not null default 'UTC',
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hubspot_team_id text not null,
  name text not null,
  parent_team_id uuid references teams(id),
  created_at timestamptz not null default now(),
  unique (tenant_id, hubspot_team_id)
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tenant_id uuid not null references tenants(id) on delete cascade,
  role text not null check (role in ('admin', 'manager', 'rep')),
  hubspot_owner_id text,
  team_id uuid references teams(id),
  created_at timestamptz not null default now()
);

create table hubspot_connections (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  portal_id text not null,
  access_token_secret_ref text not null,
  refresh_token_secret_ref text not null,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  scopes_granted text[] not null default '{}',
  last_backfill_at timestamptz,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. Dimension tables
-- ============================================================

create table dim_owner (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hubspot_owner_id text not null,
  user_profile_id uuid references profiles(id),
  team_id uuid references teams(id),
  full_name text,
  active boolean not null default true,
  unique (tenant_id, hubspot_owner_id)
);

create table dim_pipeline_stage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hubspot_pipeline_id text not null,
  pipeline_label text,
  hubspot_stage_id text not null,
  stage_label text,
  display_order int,
  probability numeric,
  is_closed boolean not null default false,
  is_won boolean,
  object_type text not null check (object_type in ('deal', 'ticket')),
  valid_from timestamptz not null default now(),
  valid_to timestamptz
);

create table dim_date (
  date_key date primary key,
  fiscal_period text,
  is_business_day boolean not null default true
);

-- ============================================================
-- 3. Raw mirror tables
-- ============================================================

create table raw_deals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hubspot_deal_id text not null,
  pipeline_id text,
  stage_id text,
  amount numeric,
  currency text,
  owner_id text,
  dealtype text,
  createdate timestamptz,
  closedate timestamptz,
  is_deleted boolean not null default false,
  raw_payload jsonb,
  synced_at timestamptz not null default now(),
  unique (tenant_id, hubspot_deal_id)
);

create table raw_tickets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hubspot_ticket_id text not null,
  pipeline_id text,
  stage_id text,
  priority text,
  owner_id text,
  createdate timestamptz,
  closed_date timestamptz,
  first_response_time timestamptz,
  is_deleted boolean not null default false,
  raw_payload jsonb,
  synced_at timestamptz not null default now(),
  unique (tenant_id, hubspot_ticket_id)
);

create table raw_engagements (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  hubspot_engagement_id text not null,
  type text not null check (type in ('call', 'email', 'meeting', 'note', 'task')),
  owner_id text,
  "timestamp" timestamptz,
  outcome text,
  duration int,
  associated_deal_id text,
  associated_ticket_id text,
  is_deleted boolean not null default false,
  raw_payload jsonb,
  synced_at timestamptz not null default now(),
  unique (tenant_id, hubspot_engagement_id)
);

create table raw_property_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  object_type text not null check (object_type in ('deal', 'ticket')),
  hubspot_object_id text not null,
  property_name text not null,
  value text,
  changed_at timestamptz not null
);

-- ============================================================
-- 4. Fact tables
-- ============================================================

create table fact_deal_snapshot (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  deal_id text not null,
  snapshot_date date not null,
  pipeline_id text,
  stage_id text,
  amount numeric,
  owner_id text,
  team_id uuid references teams(id),
  is_open boolean not null default true,
  is_won boolean,
  is_dq_excluded boolean not null default false,
  unique (tenant_id, deal_id, snapshot_date)
);

create table fact_stage_transition (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  object_type text not null check (object_type in ('deal', 'ticket')),
  object_id text not null,
  pipeline_id text,
  from_stage_id text,
  to_stage_id text not null,
  entered_at timestamptz not null,
  exited_at timestamptz,
  duration_seconds int,
  owner_id text
);

create table fact_ticket_sla (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  ticket_id text not null,
  priority text,
  owner_id text,
  team_id uuid references teams(id),
  created_at timestamptz,
  first_response_at timestamptz,
  closed_at timestamptz,
  sla_first_response_target_seconds int,
  sla_resolution_target_seconds int,
  first_response_within_sla boolean,
  resolution_within_sla boolean,
  is_dq_excluded boolean not null default false,
  unique (tenant_id, ticket_id)
);

create table fact_activity (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  engagement_id text not null,
  type text not null check (type in ('call', 'email', 'meeting', 'note', 'task')),
  owner_id text,
  team_id uuid references teams(id),
  occurred_at timestamptz not null,
  unique (tenant_id, engagement_id)
);

-- ============================================================
-- 5. Aggregate table
-- ============================================================

create table agg_kpi_daily (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  metric_key text not null,
  metric_version int not null default 1,
  date_key date not null,
  pipeline_id text,
  team_id uuid references teams(id),
  owner_id text,
  priority text,
  value numeric,
  numerator numeric,
  denominator numeric,
  computed_at timestamptz not null default now()
);

create index idx_agg_kpi_daily_hot_path
  on agg_kpi_daily (tenant_id, metric_key, date_key, pipeline_id, team_id, owner_id);

-- ============================================================
-- 6. Operational tables
-- ============================================================

create table sync_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  job_type text not null check (job_type in ('backfill', 'webhook', 'reconciliation')),
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed')),
  object_type text,
  started_at timestamptz,
  completed_at timestamptz,
  error text,
  records_processed int not null default 0,
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants(id) on delete cascade,
  actor_profile_id uuid references profiles(id),
  action text not null check (action in ('login', 'export', 'role_change', 'connection_change')),
  target text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Useful secondary indexes
-- ============================================================

create index idx_raw_deals_tenant on raw_deals (tenant_id);
create index idx_raw_tickets_tenant on raw_tickets (tenant_id);
create index idx_raw_engagements_tenant on raw_engagements (tenant_id);
create index idx_fact_stage_transition_object on fact_stage_transition (tenant_id, object_type, object_id);
create index idx_fact_ticket_sla_tenant on fact_ticket_sla (tenant_id);
create index idx_fact_activity_tenant_date on fact_activity (tenant_id, occurred_at);
create index idx_property_history_object on raw_property_history (tenant_id, object_type, hubspot_object_id, property_name);
