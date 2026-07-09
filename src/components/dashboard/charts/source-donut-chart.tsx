"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip } from "../chart-tooltip";
import type { SourceDatum } from "@/lib/mock/dashboard-data";

const COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
];

export function SourceDonutChart({ data }: { data: SourceDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-36 w-36 shrink-0 sm:h-44 sm:w-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={3}
              stroke="none"
              isAnimationActive
              animationDuration={500}
              animationEasing="ease-out"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-semibold tabular-nums text-text">{total}%</span>
          <span className="text-[10px] uppercase tracking-wide text-text-faint">tracked</span>
        </div>
      </div>

      <div className="flex w-full min-w-0 flex-1 flex-col gap-2.5">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="truncate text-text-muted">{d.name}</span>
            </div>
            <span className="shrink-0 font-medium tabular-nums text-text">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
