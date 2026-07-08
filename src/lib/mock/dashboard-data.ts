/**
 * Static mock data driving the demo dashboards. No backend computation --
 * this is a presentation-ready fixture set standing in for the real metric
 * engine described in DESIGN_01/02. Swap for live queries post-demo.
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

export const executiveKpis: KpiTile[] = [
  { key: "pipeline_value", label: "Pipeline Value", value: 1284500, format: "currency", deltaPct: 8.2, trend: [62, 68, 64, 71, 75, 79, 84], sparklineGood: "up" },
  { key: "win_rate", label: "Win Rate", value: 0.42, format: "percent", deltaPct: 3.1, trend: [36, 38, 37, 40, 39, 41, 42], sparklineGood: "up" },
  { key: "sla_attainment", label: "SLA Attainment", value: 0.958, format: "percent", deltaPct: -1.4, trend: [97, 96.5, 97.2, 96.8, 96, 95.6, 95.8], sparklineGood: "down" },
  { key: "activities_per_rep", label: "Activities / Rep", value: 34, format: "number", deltaPct: 5.6, trend: [24, 26, 28, 27, 30, 32, 34], sparklineGood: "up" },
];

export const pipelineKpis: KpiTile[] = [
  { key: "open_value", label: "Open Value", value: 1284500, format: "currency", deltaPct: 8.2, trend: [62, 68, 64, 71, 75, 79, 84], sparklineGood: "up" },
  { key: "weighted_value", label: "Weighted Value", value: 512400, format: "currency", deltaPct: 4.5, trend: [40, 42, 41, 45, 47, 48, 51], sparklineGood: "up" },
  { key: "avg_cycle", label: "Avg. Sales Cycle", value: 34, format: "duration-days", deltaPct: -6.2, trend: [40, 39, 38, 37, 36, 35, 34], sparklineGood: "down" },
  { key: "stage_velocity", label: "Avg. Stage Velocity", value: 6.8, format: "duration-days", deltaPct: -3.8, trend: [8.2, 8, 7.6, 7.3, 7.1, 7, 6.8], sparklineGood: "down" },
];

export const slaKpis: KpiTile[] = [
  { key: "first_response", label: "First Response", value: 0.6, format: "duration-days", deltaPct: -12.4, trend: [1.1, 1, 0.9, 0.8, 0.75, 0.68, 0.6], sparklineGood: "down" },
  { key: "resolution_time", label: "Resolution Time", value: 1.8, format: "duration-days", deltaPct: -8.1, trend: [2.4, 2.3, 2.1, 2, 1.95, 1.85, 1.8], sparklineGood: "down" },
  { key: "sla_attainment_svc", label: "SLA Attainment", value: 0.958, format: "percent", deltaPct: -1.4, trend: [97, 96.5, 97.2, 96.8, 96, 95.6, 95.8], sparklineGood: "down" },
  { key: "backlog", label: "Open Backlog", value: 47, format: "number", deltaPct: 12.0, trend: [30, 33, 35, 38, 40, 44, 47], sparklineGood: "down" },
];

// ---- Funnel / pipeline stages ----

export interface StageDatum {
  stage: string;
  count: number;
  value: number;
  avgDays: number;
}

export const pipelineStages: StageDatum[] = [
  { stage: "Appointment Scheduled", count: 142, value: 890000, avgDays: 4.2 },
  { stage: "Qualified to Buy", count: 98, value: 720000, avgDays: 6.8 },
  { stage: "Presentation Scheduled", count: 61, value: 512400, avgDays: 8.1 },
  { stage: "Contract Sent", count: 34, value: 284000, avgDays: 5.4 },
  { stage: "Closed Won", count: 22, value: 198000, avgDays: 2.1 },
];

// ---- Revenue trend (area chart) ----

export interface TrendPoint {
  date: string;
  actual: number;
  target: number;
}

export const revenueTrend: TrendPoint[] = [
  { date: "Jan", actual: 210000, target: 200000 },
  { date: "Feb", actual: 238000, target: 215000 },
  { date: "Mar", actual: 226000, target: 230000 },
  { date: "Apr", actual: 262000, target: 245000 },
  { date: "May", actual: 289000, target: 260000 },
  { date: "Jun", actual: 305000, target: 280000 },
  { date: "Jul", actual: 332000, target: 300000 },
];

// ---- Deals by owner (bar) ----

export interface OwnerDatum {
  owner: string;
  won: number;
  lost: number;
  open: number;
}

export const dealsByOwner: OwnerDatum[] = [
  { owner: "Asha Rao", won: 14, lost: 4, open: 22 },
  { owner: "Diego Martins", won: 11, lost: 6, open: 18 },
  { owner: "Priya Nair", won: 9, lost: 3, open: 15 },
  { owner: "Sam Whitfield", won: 8, lost: 5, open: 12 },
  { owner: "Lena Kowalski", won: 6, lost: 2, open: 9 },
];

// ---- Deal source mix (donut) ----

export interface SourceDatum {
  name: string;
  value: number;
}

export const dealSourceMix: SourceDatum[] = [
  { name: "Outbound", value: 38 },
  { name: "Inbound / Web", value: 29 },
  { name: "Referral", value: 18 },
  { name: "Partner", value: 10 },
  { name: "Event", value: 5 },
];

// ---- SLA by priority (bar) ----

export interface SlaPriorityDatum {
  priority: string;
  attainment: number;
  volume: number;
}

export const slaByPriority: SlaPriorityDatum[] = [
  { priority: "Urgent", attainment: 0.91, volume: 38 },
  { priority: "High", attainment: 0.94, volume: 112 },
  { priority: "Medium", attainment: 0.97, volume: 264 },
  { priority: "Low", attainment: 0.99, volume: 156 },
];

// ---- Ticket volume trend (area, dual series) ----

export interface TicketTrendPoint {
  date: string;
  created: number;
  resolved: number;
}

export const ticketVolumeTrend: TicketTrendPoint[] = [
  { date: "Mon", created: 42, resolved: 38 },
  { date: "Tue", created: 51, resolved: 46 },
  { date: "Wed", created: 38, resolved: 44 },
  { date: "Thu", created: 47, resolved: 41 },
  { date: "Fri", created: 55, resolved: 49 },
  { date: "Sat", created: 21, resolved: 25 },
  { date: "Sun", created: 18, resolved: 20 },
];

// ---- Backlog age bands (bar) ----

export interface AgeBandDatum {
  band: string;
  count: number;
}

export const backlogAgeBands: AgeBandDatum[] = [
  { band: "0-1d", count: 22 },
  { band: "1-3d", count: 14 },
  { band: "3-7d", count: 8 },
  { band: "7d+", count: 3 },
];

// ---- Recent activity feed ----

export interface ActivityItem {
  id: string;
  type: "call" | "email" | "meeting" | "deal_won" | "sla_breach";
  actor: string;
  description: string;
  timestamp: string;
}

export const recentActivity: ActivityItem[] = [
  { id: "a1", type: "deal_won", actor: "Asha Rao", description: "closed Northwind Traders — $42,000", timestamp: "12 min ago" },
  { id: "a2", type: "sla_breach", actor: "System", description: "Ticket #2298 breached first-response SLA", timestamp: "34 min ago" },
  { id: "a3", type: "call", actor: "Diego Martins", description: "logged a call with Fabrikam Inc.", timestamp: "1 hr ago" },
  { id: "a4", type: "meeting", actor: "Priya Nair", description: "scheduled demo with Contoso Ltd.", timestamp: "2 hr ago" },
  { id: "a5", type: "email", actor: "Sam Whitfield", description: "sent proposal to Globex Corp.", timestamp: "3 hr ago" },
];

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
