"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../chart-tooltip";
import type { TicketTrendPoint } from "@/lib/mock/dashboard-data";

export function TicketVolumeChart({ data }: { data: TicketTrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id="createdFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="resolvedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-good)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--color-good)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} width={26} />
        <Tooltip cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="created"
          name="Created"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          fill="url(#createdFill)"
          isAnimationActive
          animationDuration={500}
        />
        <Area
          type="monotone"
          dataKey="resolved"
          name="Resolved"
          stroke="var(--color-good)"
          strokeWidth={2}
          fill="url(#resolvedFill)"
          isAnimationActive
          animationDuration={550}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
