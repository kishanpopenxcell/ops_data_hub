-- Data-Quality Monitor views (Phase 4 of Tier 1 implementation plan).
-- Same pattern as the other dashboard views: select from RLS-enabled base
-- tables, no security definer, so Admin/Manager/Rep scoping is inherited
-- automatically -- a Rep only ever sees DQ issues on their own records.

-- ============================================================
-- Completeness: % of deals/tickets missing a required field, by object type
-- ============================================================

create view view_dq_completeness as
select
  tenant_id,
  'deal' as object_type,
  'amount' as field,
  count(*) as total_count,
  count(*) filter (where amount is null) as missing_count
from raw_deals
where is_deleted = false
group by tenant_id
union all
select
  tenant_id,
  'deal' as object_type,
  'owner' as field,
  count(*) as total_count,
  count(*) filter (where owner_id is null) as missing_count
from raw_deals
where is_deleted = false
group by tenant_id
union all
select
  tenant_id,
  'deal' as object_type,
  'stage' as field,
  count(*) as total_count,
  count(*) filter (where stage_id is null) as missing_count
from raw_deals
where is_deleted = false
group by tenant_id
union all
select
  tenant_id,
  'ticket' as object_type,
  'priority' as field,
  count(*) as total_count,
  count(*) filter (where priority is null) as missing_count
from raw_tickets
where is_deleted = false
group by tenant_id
union all
select
  tenant_id,
  'ticket' as object_type,
  'owner' as field,
  count(*) as total_count,
  count(*) filter (where owner_id is null) as missing_count
from raw_tickets
where is_deleted = false
group by tenant_id;

-- ============================================================
-- Orphan owners: owner_id values on deals/tickets that don't match any
-- active dim_owner row for the same tenant (deactivated/removed rep, or a
-- sync mapping gap -- either way, the record is silently un-attributable).
-- ============================================================

create view view_dq_orphan_owners as
select tenant_id, owner_id, count(*) as record_count
from (
  select d.tenant_id, d.owner_id
  from raw_deals d
  where d.is_deleted = false
    and d.owner_id is not null
    and not exists (
      select 1 from dim_owner o
      where o.tenant_id = d.tenant_id and o.hubspot_owner_id = d.owner_id and o.active = true
    )
  union all
  select t.tenant_id, t.owner_id
  from raw_tickets t
  where t.is_deleted = false
    and t.owner_id is not null
    and not exists (
      select 1 from dim_owner o
      where o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id and o.active = true
    )
) orphaned
group by tenant_id, owner_id;

-- ============================================================
-- Stale records: open deals/tickets with no activity (no stage transition)
-- in the last 14 days -- likely abandoned or forgotten, not actively worked.
-- ============================================================

create view view_dq_stale_records as
select
  d.tenant_id,
  'deal' as object_type,
  d.hubspot_deal_id as object_id,
  d.raw_payload->>'dealname' as object_name,
  d.owner_id,
  o.full_name as owner_name,
  greatest(d.createdate, coalesce(latest_t.last_transition_at, d.createdate)) as last_activity_at,
  extract(epoch from (now() - greatest(d.createdate, coalesce(latest_t.last_transition_at, d.createdate)))) / 86400.0 as days_stale
from raw_deals d
left join dim_owner o on o.tenant_id = d.tenant_id and o.hubspot_owner_id = d.owner_id
left join lateral (
  select max(entered_at) as last_transition_at
  from fact_stage_transition t
  where t.tenant_id = d.tenant_id and t.object_id = d.hubspot_deal_id and t.object_type = 'deal'
) latest_t on true
where d.is_deleted = false and d.closedate is null
  and extract(epoch from (now() - greatest(d.createdate, coalesce(latest_t.last_transition_at, d.createdate)))) / 86400.0 >= 14;

-- ============================================================
-- Records needing attention: row-level union of every DQ issue, tagged with
-- an issue_type, so the UI can render one drill-through-enabled table
-- instead of one per issue category.
-- ============================================================

create view view_dq_issues as
select
  d.tenant_id,
  'deal'::text as object_type,
  d.hubspot_deal_id as object_id,
  coalesce(d.raw_payload->>'dealname', d.hubspot_deal_id) as object_name,
  'missing_amount'::text as issue_type,
  d.owner_id,
  o.full_name as owner_name,
  d.createdate
from raw_deals d
left join dim_owner o on o.tenant_id = d.tenant_id and o.hubspot_owner_id = d.owner_id
where d.is_deleted = false and d.amount is null
union all
select
  d.tenant_id,
  'deal'::text,
  d.hubspot_deal_id,
  coalesce(d.raw_payload->>'dealname', d.hubspot_deal_id),
  'orphan_owner'::text,
  d.owner_id,
  null::text,
  d.createdate
from raw_deals d
where d.is_deleted = false
  and d.owner_id is not null
  and not exists (
    select 1 from dim_owner o
    where o.tenant_id = d.tenant_id and o.hubspot_owner_id = d.owner_id and o.active = true
  )
union all
select
  t.tenant_id,
  'ticket'::text,
  t.hubspot_ticket_id,
  coalesce(t.raw_payload->>'subject', t.hubspot_ticket_id),
  'missing_priority'::text,
  t.owner_id,
  o.full_name,
  t.createdate
from raw_tickets t
left join dim_owner o on o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id
where t.is_deleted = false and t.priority is null
union all
select
  t.tenant_id,
  'ticket'::text,
  t.hubspot_ticket_id,
  coalesce(t.raw_payload->>'subject', t.hubspot_ticket_id),
  'orphan_owner'::text,
  t.owner_id,
  null::text,
  t.createdate
from raw_tickets t
where t.is_deleted = false
  and t.owner_id is not null
  and not exists (
    select 1 from dim_owner o
    where o.tenant_id = t.tenant_id and o.hubspot_owner_id = t.owner_id and o.active = true
  );

alter view view_dq_completeness set (security_invoker = true);
alter view view_dq_orphan_owners set (security_invoker = true);
alter view view_dq_stale_records set (security_invoker = true);
alter view view_dq_issues set (security_invoker = true);
