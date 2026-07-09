"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../chart-tooltip";
import type { TrendPoint } from "@/lib/mock/dashboard-data";

export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-[200px] sm:h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
            tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={46}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }}
            content={
              <ChartTooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            }
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="var(--color-text-faint)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            name="Target"
            isAnimationActive
            animationDuration={500}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            fill="url(#actualFill)"
            name="Actual"
            isAnimationActive
            animationDuration={600}
            dot={{ r: 0 }}
            activeDot={{ r: 4, fill: "var(--color-accent)", stroke: "var(--color-surface)", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
