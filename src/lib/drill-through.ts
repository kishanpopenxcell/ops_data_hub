/**
 * Maps a dashboard slice (KPI tile, funnel stage, owner bar, priority bar) to
 * a query descriptor the DrillThroughPanel can execute against Supabase.
 * Keeping this mapping in one place means every clickable surface produces a
 * consistent, RLS-respecting record list with zero per-widget query logic.
 */

export type DrillThroughObject = "deal" | "ticket";

export interface DrillThroughQuery {
  object: DrillThroughObject;
  title: string;
  /** Human-readable description of the slice, shown in the panel header. */
  description: string;
  filters: {
    stageId?: string;
    ownerName?: string;
    priority?: string;
    /** single-record lookup by hubspot_deal_id/hubspot_ticket_id */
    hubspotId?: string;
    /** deal: only open (not closed) rows; ticket: only rows with no closed_date */
    openOnly?: boolean;
    /** deal: only closed-won rows */
    wonOnly?: boolean;
    /** deal: only closed-lost rows */
    lostOnly?: boolean;
    /** deal: only closed-won or closed-lost rows */
    decidedOnly?: boolean;
    /** deal: amount is null */
    missingAmount?: boolean;
    /** deal/ticket: owner_id doesn't match any active dim_owner row */
    orphanOwner?: boolean;
    /** ticket: priority is null */
    missingPriority?: boolean;
    /** exact hubspot ids to fetch, used for DQ "records needing attention" lists */
    hubspotIds?: string[];
  };
}

const KPI_QUERY_MAP: Record<string, (label: string) => DrillThroughQuery> = {
  pipeline_value: (label) => ({
    object: "deal",
    title: label,
    description: "All open deals contributing to this figure",
    filters: { openOnly: true },
  }),
  open_value: (label) => ({
    object: "deal",
    title: label,
    description: "All open deals contributing to this figure",
    filters: { openOnly: true },
  }),
  weighted_value: (label) => ({
    object: "deal",
    title: label,
    description: "Open deals, weighted by stage probability",
    filters: { openOnly: true },
  }),
  win_rate: (label) => ({
    object: "deal",
    title: label,
    description: "Won and lost deals used in this calculation",
    filters: { decidedOnly: true },
  }),
  avg_sales_cycle: (label) => ({
    object: "deal",
    title: label,
    description: "Closed-won deals used in this calculation",
    filters: { wonOnly: true },
  }),
  avg_stage_velocity: (label) => ({
    object: "deal",
    title: label,
    description: "Deals with completed stage transitions",
    filters: {},
  }),
  activities_per_rep: (label) => ({
    object: "deal",
    title: label,
    description: "Not directly drillable to deal records -- see Recent Activity",
    filters: {},
  }),
  first_response: (label) => ({
    object: "ticket",
    title: label,
    description: "Tickets used in this calculation",
    filters: {},
  }),
  resolution_time: (label) => ({
    object: "ticket",
    title: label,
    description: "Closed tickets used in this calculation",
    filters: {},
  }),
  sla_attainment: (label) => ({
    object: "ticket",
    title: label,
    description: "Tickets used in this calculation",
    filters: {},
  }),
  backlog: (label) => ({
    object: "ticket",
    title: label,
    description: "Currently open tickets",
    filters: { openOnly: true },
  }),
};

export function queryForKpi(metricKey: string, label: string): DrillThroughQuery | null {
  const builder = KPI_QUERY_MAP[metricKey];
  return builder ? builder(label) : null;
}

export function queryForStage(stageLabel: string, stageId: string): DrillThroughQuery {
  return {
    object: "deal",
    title: stageLabel,
    description: `Deals currently in ${stageLabel}`,
    filters: { stageId },
  };
}

export function queryForOwner(ownerName: string, kind: "won" | "open" | "lost"): DrillThroughQuery {
  const labels = { won: "Won deals", open: "Open deals", lost: "Lost deals" };
  return {
    object: "deal",
    title: `${ownerName} — ${labels[kind]}`,
    description: `${labels[kind]} owned by ${ownerName}`,
    filters: {
      ownerName,
      wonOnly: kind === "won",
      lostOnly: kind === "lost",
      openOnly: kind === "open",
    },
  };
}

export function queryForDeal(dealId: string, dealName: string): DrillThroughQuery {
  return {
    object: "deal",
    title: dealName,
    description: "Single deal record",
    filters: { hubspotId: dealId },
  };
}

const DQ_ISSUE_LABELS: Record<string, string> = {
  missing_amount: "Missing amount",
  missing_priority: "Missing priority",
  orphan_owner: "Orphaned owner",
};

/** Single-row drill-through for a "records needing attention" table row. */
export function queryForDqIssue(
  objectType: "deal" | "ticket",
  hubspotId: string,
  objectName: string,
): DrillThroughQuery {
  return {
    object: objectType,
    title: objectName,
    description: "Record flagged by the Data Quality Monitor",
    filters: { hubspotId },
  };
}

/** Category-level drill-through, e.g. "all deals missing an amount." */
export function queryForDqCategory(
  objectType: "deal" | "ticket",
  issueType: keyof typeof DQ_ISSUE_LABELS,
): DrillThroughQuery {
  const label = DQ_ISSUE_LABELS[issueType] ?? issueType;
  return {
    object: objectType,
    title: label,
    description: `All ${objectType}s flagged: ${label.toLowerCase()}`,
    filters: {
      missingAmount: issueType === "missing_amount",
      missingPriority: issueType === "missing_priority",
      orphanOwner: issueType === "orphan_owner",
    },
  };
}

export function queryForPriority(priority: string): DrillThroughQuery {
  return {
    object: "ticket",
    title: `${priority} priority tickets`,
    description: `All tickets at ${priority} priority`,
    filters: { priority: priority.toUpperCase() },
  };
}
