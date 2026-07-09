/**
 * Shared dashboard types + the one remaining mock fixture (teamRoster, for
 * the Quota Attainment leaderboard -- kept cosmetic pending a real quota
 * table). All other dashboard data comes from src/lib/queries/* against
 * Supabase.
 */

export interface KpiTile {
  key: string;
  label: string;
  value: number;
  format: "currency" | "percent" | "number" | "duration-days";
  deltaPct: number;
  trend: number[];
  sparklineGood?: "up" | "down";
}

// ---- Funnel / pipeline stages ----

export interface StageDatum {
  stage: string;
  stageId?: string;
  count: number;
  value: number;
  avgDays: number;
}

// ---- Revenue trend (area chart) ----

export interface TrendPoint {
  date: string;
  actual: number;
  target: number;
}

// ---- Deals by owner (bar) ----

export interface OwnerDatum {
  owner: string;
  won: number;
  lost: number;
  open: number;
}

// ---- Deal source mix (donut) ----

export interface SourceDatum {
  name: string;
  value: number;
}

// ---- SLA by priority (bar) ----

export interface SlaPriorityDatum {
  priority: string;
  attainment: number;
  volume: number;
}

// ---- Ticket volume trend (area, dual series) ----

export interface TicketTrendPoint {
  date: string;
  created: number;
  resolved: number;
}

// ---- Backlog age bands (bar) ----

export interface AgeBandDatum {
  band: string;
  count: number;
}

// ---- Recent activity feed ----

export interface ActivityItem {
  id: string;
  type: "call" | "email" | "meeting" | "deal_won" | "sla_breach";
  actor: string;
  description: string;
  timestamp: string;
}

// ---- Team roster for RBAC-flavored demo (rep scorecard) ----

export interface TeamMember {
  name: string;
  role: "Manager" | "Rep";
  quotaAttainment: number;
  activities: number;
}

export const teamRoster: TeamMember[] = [
  { name: "Asha Rao", role: "Manager", quotaAttainment: 1.12, activities: 41 },
  { name: "Diego Martins", role: "Rep", quotaAttainment: 0.88, activities: 33 },
  { name: "Priya Nair", role: "Rep", quotaAttainment: 1.04, activities: 38 },
  { name: "Sam Whitfield", role: "Rep", quotaAttainment: 0.76, activities: 26 },
  { name: "Lena Kowalski", role: "Rep", quotaAttainment: 0.95, activities: 30 },
];
