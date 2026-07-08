export interface Insight {
  id: string;
  tone: "positive" | "warning" | "info";
  text: string;
}

export const aiInsights: Insight[] = [
  {
    id: "i1",
    tone: "positive",
    text: "Win rate up 3.1% this month, driven mostly by the Enterprise segment closing faster than usual.",
  },
  {
    id: "i2",
    tone: "warning",
    text: "SLA attainment dipped 1.4% — high-priority tickets from the Support queue are the main driver.",
  },
  {
    id: "i3",
    tone: "info",
    text: "Deal velocity in Presentation Scheduled is trending 12% slower than the trailing quarter average.",
  },
];

export interface SystemHealthMetric {
  id: string;
  label: string;
  value: string;
  status: "good" | "warn" | "crit";
}

export const systemHealth: SystemHealthMetric[] = [
  { id: "sync", label: "HubSpot Sync", value: "Connected", status: "good" },
  { id: "freshness", label: "Data Freshness", value: "2 min ago", status: "good" },
  { id: "uptime", label: "Platform Uptime", value: "99.98%", status: "good" },
  { id: "queue", label: "Webhook Queue", value: "0 pending", status: "good" },
];
