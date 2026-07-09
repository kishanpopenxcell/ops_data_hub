#!/usr/bin/env node
/**
 * Seeds Phase 0 foundation data for Tier 1 features: tenant, teams, profiles
 * (linking existing auth users to roles), dim_owner, dim_pipeline_stage,
 * dim_date, and record-level facts (deals, stage transitions, tickets,
 * activities) with deliberately realistic history and deliberately broken
 * rows for DQ testing.
 *
 * Uses raw fetch() against PostgREST instead of @supabase/supabase-js --
 * the JS SDK's realtime client crashes under Node 20 (no native WebSocket).
 *
 * Idempotent: safe to re-run. Deletes and re-inserts tenant-scoped rows on
 * each run rather than appending duplicates.
 *
 * Usage: node scripts/seed-demo-data.mjs
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY in env.
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function pg(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`PostgREST ${options.method || "GET"} ${path} failed: ${res.status} ${body}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function insert(table, rows, { returning = "representation" } = {}) {
  return pg(table, {
    method: "POST",
    headers: { Prefer: `return=${returning}` },
    body: JSON.stringify(rows),
  });
}

async function del(table, filterQuery) {
  return pg(`${table}?${filterQuery}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
}

async function authAdminRequest(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Auth admin ${options.method || "GET"} ${path} failed: ${res.status} ${body}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Deterministic-ish random helpers (seeded by a simple LCG so re-runs are
// stable/reproducible, not truly random -- makes demo data consistent across
// re-seeds without needing a fixed fixture file).
// ---------------------------------------------------------------------------

let seed = 42;
function rand() {
  seed = (seed * 1103515245 + 12345) % 2147483648;
  return seed / 2147483648;
}
function randInt(min, max) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Fixed reference data
// ---------------------------------------------------------------------------

const TENANT_NAME = "MetricHub Demo";

const TEAMS = [
  { key: "enterprise", name: "Enterprise", hubspot_team_id: "team-enterprise" },
  { key: "smb", name: "SMB", hubspot_team_id: "team-smb" },
  { key: "support", name: "Support", hubspot_team_id: "team-support" },
];

// hubspot_owner_id values match the naming already used across the mock UI
// (dashboard-data.ts) so continuity holds when we later swap dashboards onto
// real queries.
const OWNERS = [
  { key: "asha", full_name: "Asha Rao", hubspot_owner_id: "owner-asha-rao", teamKey: "enterprise" },
  { key: "diego", full_name: "Diego Martins", hubspot_owner_id: "owner-diego-martins", teamKey: "enterprise" },
  { key: "priya", full_name: "Priya Nair", hubspot_owner_id: "owner-priya-nair", teamKey: "smb" },
  { key: "sam", full_name: "Sam Whitfield", hubspot_owner_id: "owner-sam-whitfield", teamKey: "smb" },
  { key: "lena", full_name: "Lena Kowalski", hubspot_owner_id: "owner-lena-kowalski", teamKey: "support" },
];

const DEAL_PIPELINE_ID = "default";
const DEAL_STAGES = [
  { id: "appointmentscheduled", label: "Appointment Scheduled", order: 0, probability: 0.2, isClosed: false, isWon: null, avgDays: 4 },
  { id: "qualifiedtobuy", label: "Qualified to Buy", order: 1, probability: 0.4, isClosed: false, isWon: null, avgDays: 7 },
  { id: "presentationscheduled", label: "Presentation Scheduled", order: 2, probability: 0.6, isClosed: false, isWon: null, avgDays: 8 },
  { id: "contractsent", label: "Contract Sent", order: 3, probability: 0.8, isClosed: false, isWon: null, avgDays: 5 },
  { id: "closedwon", label: "Closed Won", order: 4, probability: 1.0, isClosed: true, isWon: true, avgDays: 2 },
  { id: "closedlost", label: "Closed Lost", order: 5, probability: 0.0, isClosed: true, isWon: false, avgDays: 2 },
];
const OPEN_STAGE_IDS = DEAL_STAGES.filter((s) => !s.isClosed).map((s) => s.id);

const TICKET_PIPELINE_ID = "support";
const TICKET_STAGES = [
  { id: "open", label: "Open", order: 0, isClosed: false, isWon: null },
  { id: "pending", label: "Pending", order: 1, isClosed: false, isWon: null },
  { id: "closed", label: "Closed", order: 2, isClosed: true, isWon: true },
];

const TICKET_PRIORITIES = ["URGENT", "HIGH", "MEDIUM", "LOW"];
const SLA_TARGET_SECONDS = {
  URGENT: { firstResponse: 30 * 60, resolution: 4 * 3600 },
  HIGH: { firstResponse: 2 * 3600, resolution: 8 * 3600 },
  MEDIUM: { firstResponse: 8 * 3600, resolution: 24 * 3600 },
  LOW: { firstResponse: 24 * 3600, resolution: 72 * 3600 },
};

const COMPANY_NAMES = [
  "Northwind Traders", "Fabrikam Inc.", "Contoso Ltd.", "Globex Corp.", "Acme Corp",
  "Initech", "Umbrella Group", "Wayne Enterprises", "Stark Industries", "Hooli",
  "Soylent Corp", "Vandelay Industries", "Massive Dynamic", "Pied Piper", "Aviato",
  "Wonka Industries", "Cyberdyne Systems", "Tyrell Corporation", "Oscorp", "LexCorp",
  "Gringotts", "Bluth Company", "Dunder Mifflin", "Prestige Worldwide", "Sterling Cooper",
];

// Weighted distribution matches the shape of the retired dealSourceMix mock
// (Outbound 38%, Inbound/Web 29%, Referral 18%, Partner 10%, Event 5%).
const DEAL_SOURCES = [
  ...Array(38).fill("Outbound"),
  ...Array(29).fill("Inbound / Web"),
  ...Array(18).fill("Referral"),
  ...Array(10).fill("Partner"),
  ...Array(5).fill("Event"),
];

const TICKET_SUBJECTS = [
  "Cannot log in to dashboard", "Billing discrepancy on invoice", "Feature request: export to XLSX",
  "Integration webhook not firing", "Data sync delayed", "Report shows incorrect totals",
  "Unable to reset password", "API rate limit questions", "Request for additional seats",
  "SSO configuration issue", "Dashboard loading slowly", "Missing data for last week",
  "Permission error viewing team dashboard", "Duplicate records appearing", "Export stuck processing",
];

async function main() {
  console.log("Seeding demo data...\n");

  // -------------------------------------------------------------------
  // 0. Look up existing auth users by email
  // -------------------------------------------------------------------
  const { users } = await authAdminRequest("users");
  const findUser = (email) => {
    const u = users.find((u) => u.email === email);
    if (!u) throw new Error(`Auth user not found: ${email}. Create it first.`);
    return u;
  };
  const adminUser = findUser("admin@metrichub.com");
  const managerUser = findUser("manager@metrichub.com");
  const repUser = findUser("rep@metrichub.com");
  console.log("Found auth users: admin, manager, rep ✓");

  // -------------------------------------------------------------------
  // 1. Clean slate -- delete existing tenant-scoped rows (idempotent re-run)
  // -------------------------------------------------------------------
  const existingTenants = await pg(`tenants?name=eq.${encodeURIComponent(TENANT_NAME)}&select=id`);
  for (const t of existingTenants) {
    const tid = t.id;
    for (const table of [
      "agg_kpi_daily",
      "fact_activity", "fact_ticket_sla", "fact_stage_transition", "fact_deal_snapshot",
      "raw_property_history", "raw_engagements", "raw_tickets", "raw_deals",
      "dim_pipeline_stage", "dim_owner", "profiles", "teams",
    ]) {
      await del(table, `tenant_id=eq.${tid}`);
    }
    await del("tenants", `id=eq.${tid}`);
  }
  console.log("Cleared previous seed data ✓");

  // -------------------------------------------------------------------
  // 2. Tenant
  // -------------------------------------------------------------------
  const [tenant] = await insert("tenants", [{ name: TENANT_NAME, reporting_timezone: "America/New_York" }]);
  console.log(`Created tenant: ${tenant.id} ✓`);

  // -------------------------------------------------------------------
  // 3. Teams
  // -------------------------------------------------------------------
  const teamRows = await insert(
    "teams",
    TEAMS.map((t) => ({ tenant_id: tenant.id, hubspot_team_id: t.hubspot_team_id, name: t.name })),
  );
  const teamIdByKey = Object.fromEntries(TEAMS.map((t, i) => [t.key, teamRows[i].id]));
  console.log(`Created ${teamRows.length} teams ✓`);

  // -------------------------------------------------------------------
  // 4. Profiles (admin/manager/rep) -- rep maps to Diego Martins' owner identity
  // -------------------------------------------------------------------
  const repOwnerDef = OWNERS.find((o) => o.key === "diego");
  const managerTeamKey = "enterprise";

  await insert("profiles", [
    { id: adminUser.id, tenant_id: tenant.id, role: "admin", hubspot_owner_id: null, team_id: null },
    {
      id: managerUser.id,
      tenant_id: tenant.id,
      role: "manager",
      hubspot_owner_id: null,
      team_id: teamIdByKey[managerTeamKey],
    },
    {
      id: repUser.id,
      tenant_id: tenant.id,
      role: "rep",
      hubspot_owner_id: repOwnerDef.hubspot_owner_id,
      team_id: teamIdByKey[repOwnerDef.teamKey],
    },
  ]);
  console.log("Created 3 profiles (admin/manager/rep) ✓");

  // -------------------------------------------------------------------
  // 5. dim_owner
  // -------------------------------------------------------------------
  const ownerRows = await insert(
    "dim_owner",
    OWNERS.map((o) => ({
      tenant_id: tenant.id,
      hubspot_owner_id: o.hubspot_owner_id,
      team_id: teamIdByKey[o.teamKey],
      full_name: o.full_name,
      active: true,
      user_profile_id: o.key === "diego" ? repUser.id : null,
    })),
  );
  console.log(`Created ${ownerRows.length} owners ✓`);

  // Deliberately add one orphaned owner reference (used nowhere in dim_owner)
  // for the Data-Quality Monitor to detect later.
  const ORPHAN_OWNER_ID = "owner-deactivated-jamie-fox";

  // -------------------------------------------------------------------
  // 6. dim_pipeline_stage (deals + tickets)
  // -------------------------------------------------------------------
  const stageRows = await insert("dim_pipeline_stage", [
    ...DEAL_STAGES.map((s) => ({
      tenant_id: tenant.id,
      hubspot_pipeline_id: DEAL_PIPELINE_ID,
      pipeline_label: "Sales Pipeline",
      hubspot_stage_id: s.id,
      stage_label: s.label,
      display_order: s.order,
      probability: s.probability,
      is_closed: s.isClosed,
      is_won: s.isWon,
      object_type: "deal",
    })),
    ...TICKET_STAGES.map((s) => ({
      tenant_id: tenant.id,
      hubspot_pipeline_id: TICKET_PIPELINE_ID,
      pipeline_label: "Support Pipeline",
      hubspot_stage_id: s.id,
      stage_label: s.label,
      display_order: s.order,
      probability: null,
      is_closed: s.isClosed,
      is_won: s.isWon,
      object_type: "ticket",
    })),
  ]);
  console.log(`Created ${stageRows.length} pipeline stages ✓`);

  // -------------------------------------------------------------------
  // 7. dim_date -- rolling 14 months (covers historical depth + slight future buffer)
  // -------------------------------------------------------------------
  const dateRows = [];
  const start = new Date();
  start.setMonth(start.getMonth() - 13);
  start.setDate(1);
  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    dateRows.push({
      date_key: d.toISOString().slice(0, 10),
      fiscal_period: `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`,
      is_business_day: dow !== 0 && dow !== 6,
    });
  }
  // dim_date has no tenant_id -- upsert on date_key to stay idempotent without wiping.
  await pg("dim_date", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(dateRows),
  });
  console.log(`Upserted ${dateRows.length} dim_date rows ✓`);

  // -------------------------------------------------------------------
  // 8. Deals + stage transition history
  // -------------------------------------------------------------------
  // Volume and recency both matter for the KPI sparklines: the daily
  // aggregates (agg_kpi_daily) are cumulative snapshots computed from these
  // rows, so if deal creation/close dates cluster far outside the trailing
  // 30-45 day trend window, every day's snapshot is identical and the
  // sparkline renders as a flat line. Most deals are created within the
  // trailing 60 days (dense enough that the window sees deals both opening
  // AND closing on many different days, producing real up-and-down
  // movement) with a smaller "long-tail" cohort further back for realism
  // (every real pipeline has some old deals still open) and to give stalled
  // deals genuinely old dwell times.
  const DEAL_COUNT = 140;
  const RECENT_DEAL_SHARE = 0.75; // fraction of deals created in the last ~60 days
  const dealRows = [];
  const transitionRows = [];
  const snapshotRows = [];

  for (let i = 0; i < DEAL_COUNT; i++) {
    const hubspotDealId = `deal-${1000 + i}`;
    const owner = pick(OWNERS);
    const company = COMPANY_NAMES[i % COMPANY_NAMES.length];

    // Deliberately break ~8% of deals for DQ testing: missing amount or owner.
    const isDqBroken = i % 13 === 0;
    const missingAmount = isDqBroken && i % 26 === 0;
    const orphanOwner = isDqBroken && !missingAmount;

    // Decide outcome: ~35% won, ~20% lost, ~45% still open.
    const outcomeRoll = rand();
    let finalStageIdx;
    let isOpen;
    if (outcomeRoll < 0.35) {
      finalStageIdx = DEAL_STAGES.findIndex((s) => s.id === "closedwon");
      isOpen = false;
    } else if (outcomeRoll < 0.55) {
      finalStageIdx = DEAL_STAGES.findIndex((s) => s.id === "closedlost");
      isOpen = false;
    } else {
      // Open deal, sitting in one of the open stages.
      finalStageIdx = randInt(0, OPEN_STAGE_IDS.length - 1);
      isOpen = true;
    }

    // Deliberately stall ~10% of open deals far beyond stage baseline.
    const isStalled = isOpen && i % 10 === 3;

    // createdAt must be far enough back to fit the full stage walk without
    // going negative, but closed deals' ACTUAL dwell time averages out to
    // roughly the sum of each stage's avgDays (the 0.5+rand() jitter per
    // stage averages to 1.0x, not the 1.5x worst case used elsewhere as a
    // safety ceiling) -- about 26 days for this pipeline's 5 stages. Using
    // that same 1.5x ceiling as the *typical* runway would push most closed
    // deals' close dates well outside the last 30 days, flattening
    // win_rate/avg_sales_cycle. So closed deals get their own, tighter
    // runway floor close to the realistic mean dwell; the per-stage
    // "cursor > now" clamp already protects against overshoot for the
    // unlucky long-dwell draws.
    const meanClosedDwell = Math.round(
      DEAL_STAGES.slice(0, 4).reduce((sum, s) => sum + s.avgDays, 0) + DEAL_STAGES[4].avgDays,
    );
    const maxPossibleDwell = DEAL_STAGES.reduce((sum, s) => sum + s.avgDays * 1.5, 0);
    const minRunway = isOpen ? 15 : meanClosedDwell;
    const longTailFloor = isOpen ? 60 : Math.ceil(maxPossibleDwell) + 20;
    // Stalled deals always come from the long-tail cohort -- they need to
    // look genuinely old regardless of the recent/long-tail split below.
    const isRecentCohort = !isStalled && rand() < RECENT_DEAL_SHARE;
    const createdDaysAgo = isRecentCohort
      ? randInt(minRunway, minRunway + 45)
      : randInt(longTailFloor, longTailFloor + 260);
    const createdAt = daysAgo(createdDaysAgo);

    const amount = missingAmount ? null : randInt(8, 220) * 1000;
    const dealType = rand() < 0.7 ? "newbusiness" : "existingbusiness";

    // Build stage-transition history: walk through stages 0..finalStageIdx
    // (for closed deals, walk the full open funnel then land on won/lost).
    const walkStages = isOpen
      ? DEAL_STAGES.slice(0, finalStageIdx + 1)
      : [...DEAL_STAGES.slice(0, 4), DEAL_STAGES[finalStageIdx]];

    let cursor = new Date(createdAt);
    let lastStageId = null;
    let lastEnteredAt = cursor.toISOString();

    for (let s = 0; s < walkStages.length; s++) {
      const stage = walkStages[s];
      const isLast = s === walkStages.length - 1;
      const baseDwell = stage.avgDays;
      // Stalled deals get a wildly inflated dwell time on their final (current) stage.
      const dwellDays = isLast && isStalled
        ? baseDwell * randInt(4, 7) + randInt(5, 15)
        : Math.max(1, Math.round(baseDwell * (0.5 + rand())));

      const enteredAt = cursor.toISOString();
      cursor = new Date(cursor.getTime() + dwellDays * 86400000);
      const now = new Date();
      if (cursor > now) cursor = now;
      const exitedAt = isLast && isOpen ? null : cursor.toISOString();

      transitionRows.push({
        tenant_id: tenant.id,
        object_type: "deal",
        object_id: hubspotDealId,
        pipeline_id: DEAL_PIPELINE_ID,
        from_stage_id: lastStageId,
        to_stage_id: stage.id,
        entered_at: enteredAt,
        exited_at: exitedAt,
        duration_seconds: exitedAt ? dwellDays * 86400 : null,
        owner_id: orphanOwner ? ORPHAN_OWNER_ID : owner.hubspot_owner_id,
      });

      lastStageId = stage.id;
      lastEnteredAt = enteredAt;
    }

    const finalStage = walkStages[walkStages.length - 1];
    const closeDate = !isOpen ? cursor.toISOString() : null;
    const source = pick(DEAL_SOURCES);

    dealRows.push({
      tenant_id: tenant.id,
      hubspot_deal_id: hubspotDealId,
      pipeline_id: DEAL_PIPELINE_ID,
      stage_id: finalStage.id,
      amount,
      currency: "USD",
      owner_id: orphanOwner ? ORPHAN_OWNER_ID : owner.hubspot_owner_id,
      dealtype: dealType,
      createdate: createdAt,
      closedate: closeDate,
      raw_payload: {
        dealname: `${company} — ${dealType === "newbusiness" ? "New Business" : "Renewal"}`,
        source,
      },
    });

    snapshotRows.push({
      tenant_id: tenant.id,
      deal_id: hubspotDealId,
      snapshot_date: new Date().toISOString().slice(0, 10),
      pipeline_id: DEAL_PIPELINE_ID,
      stage_id: finalStage.id,
      amount,
      owner_id: orphanOwner ? ORPHAN_OWNER_ID : owner.hubspot_owner_id,
      team_id: teamIdByKey[owner.teamKey],
      is_open: isOpen,
      is_won: isOpen ? null : finalStage.isWon,
      is_dq_excluded: missingAmount,
    });
  }

  await insert("raw_deals", dealRows, { returning: "minimal" });
  console.log(`Inserted ${dealRows.length} deals ✓`);
  await insert("fact_stage_transition", transitionRows, { returning: "minimal" });
  console.log(`Inserted ${transitionRows.length} deal stage transitions ✓`);
  await insert("fact_deal_snapshot", snapshotRows, { returning: "minimal" });
  console.log(`Inserted ${snapshotRows.length} deal snapshots ✓`);

  // -------------------------------------------------------------------
  // 9. Tickets + SLA facts
  // -------------------------------------------------------------------
  const TICKET_COUNT = 90;
  const ticketRows = [];
  const ticketSlaRows = [];
  const ticketTransitionRows = [];

  for (let i = 0; i < TICKET_COUNT; i++) {
    const hubspotTicketId = `ticket-${2000 + i}`;
    const owner = pick(OWNERS);
    const priority = pick(TICKET_PRIORITIES);
    const subject = TICKET_SUBJECTS[i % TICKET_SUBJECTS.length];
    // Spread across 45 days so agg_kpi_daily's 30-day trend window sees
    // tickets both created AND closed on many different days.
    const createdDaysAgo = randInt(0, 45);
    const createdAt = daysAgo(createdDaysAgo);

    const isDqBroken = i % 11 === 0;
    const missingPriority = isDqBroken;

    const isClosed = rand() < 0.7;
    const target = SLA_TARGET_SECONDS[priority];

    // ~15% breach first response, ~12% breach resolution -- independent rolls.
    const breachesFirstResponse = rand() < 0.15;
    const firstResponseSeconds = breachesFirstResponse
      ? target.firstResponse * (1.2 + rand())
      : target.firstResponse * rand() * 0.9;
    const firstResponseAtDate = new Date(new Date(createdAt).getTime() + firstResponseSeconds * 1000);
    const nowForResponse = new Date();
    const firstResponseAt = (firstResponseAtDate > nowForResponse ? nowForResponse : firstResponseAtDate).toISOString();

    let closedAt = null;
    let resolutionSeconds = null;
    let breachesResolution = false;
    if (isClosed) {
      breachesResolution = rand() < 0.12;
      resolutionSeconds = breachesResolution
        ? target.resolution * (1.15 + rand())
        : target.resolution * rand() * 0.85;
      const closedAtDate = new Date(new Date(createdAt).getTime() + resolutionSeconds * 1000);
      const now = new Date();
      closedAt = (closedAtDate > now ? now : closedAtDate).toISOString();
    }

    const stageId = isClosed ? "closed" : rand() < 0.5 ? "open" : "pending";

    ticketRows.push({
      tenant_id: tenant.id,
      hubspot_ticket_id: hubspotTicketId,
      pipeline_id: TICKET_PIPELINE_ID,
      stage_id: stageId,
      priority: missingPriority ? null : priority,
      owner_id: owner.hubspot_owner_id,
      createdate: createdAt,
      closed_date: closedAt,
      first_response_time: firstResponseAt,
      raw_payload: { subject },
    });

    ticketSlaRows.push({
      tenant_id: tenant.id,
      ticket_id: hubspotTicketId,
      priority: missingPriority ? null : priority,
      owner_id: owner.hubspot_owner_id,
      team_id: teamIdByKey[owner.teamKey],
      created_at: createdAt,
      first_response_at: firstResponseAt,
      closed_at: closedAt,
      sla_first_response_target_seconds: target.firstResponse,
      sla_resolution_target_seconds: target.resolution,
      first_response_within_sla: !breachesFirstResponse,
      resolution_within_sla: isClosed ? !breachesResolution : null,
      is_dq_excluded: missingPriority,
    });

    ticketTransitionRows.push({
      tenant_id: tenant.id,
      object_type: "ticket",
      object_id: hubspotTicketId,
      pipeline_id: TICKET_PIPELINE_ID,
      from_stage_id: null,
      to_stage_id: stageId,
      entered_at: createdAt,
      exited_at: isClosed ? closedAt : null,
      duration_seconds: isClosed ? Math.round(resolutionSeconds) : null,
      owner_id: owner.hubspot_owner_id,
    });
  }

  await insert("raw_tickets", ticketRows, { returning: "minimal" });
  console.log(`Inserted ${ticketRows.length} tickets ✓`);
  await insert("fact_ticket_sla", ticketSlaRows, { returning: "minimal" });
  console.log(`Inserted ${ticketSlaRows.length} ticket SLA facts ✓`);
  await insert("fact_stage_transition", ticketTransitionRows, { returning: "minimal" });
  console.log(`Inserted ${ticketTransitionRows.length} ticket stage transitions ✓`);

  // -------------------------------------------------------------------
  // 10. Activities (calls/emails/meetings) for "Activities / Rep" KPI
  // -------------------------------------------------------------------
  const ACTIVITY_TYPES = ["call", "email", "meeting"];
  const activityRows = [];
  let activityCounter = 0;
  for (const owner of OWNERS) {
    const count = randInt(70, 110);
    for (let j = 0; j < count; j++) {
      activityCounter++;
      activityRows.push({
        tenant_id: tenant.id,
        engagement_id: `activity-${activityCounter}`,
        type: pick(ACTIVITY_TYPES),
        owner_id: owner.hubspot_owner_id,
        team_id: teamIdByKey[owner.teamKey],
        // Spread across 60 days -- activities_per_rep uses a rolling 30-day
        // window, so if all activity fits inside that window nothing ever
        // "ages out" as the trend advances and the sparkline just ramps
        // monotonically instead of fluctuating up and down.
        occurred_at: daysAgo(randInt(0, 60)),
      });
    }
  }
  await insert("fact_activity", activityRows, { returning: "minimal" });
  console.log(`Inserted ${activityRows.length} activities ✓`);

  // -------------------------------------------------------------------
  // 11. Backfill 30 days of daily KPI snapshots (agg_kpi_daily) so KPI
  // tiles have a real trend line + period-over-period delta.
  // -------------------------------------------------------------------
  await pg("rpc/backfill_agg_kpi_daily", {
    method: "POST",
    body: JSON.stringify({ p_tenant_id: tenant.id, p_days: 30 }),
  });
  console.log("Backfilled 30 days of agg_kpi_daily ✓");

  console.log("\nSeed complete.");
  console.log(`Tenant: ${tenant.id}`);
  console.log(`Deals: ${dealRows.length} | Tickets: ${ticketRows.length} | Activities: ${activityRows.length}`);
  console.log(`Deliberately broken records (DQ testing): ~${Math.round(DEAL_COUNT / 13) + Math.round(TICKET_COUNT / 11)}`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
