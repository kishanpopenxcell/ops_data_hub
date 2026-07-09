"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../chart-tooltip";
import type { SlaPriorityDatum } from "@/lib/mock/dashboard-data";
import { queryForPriority } from "@/lib/drill-through";
import { useDrillThrough } from "../drill-through-context";

function colorFor(attainment: number) {
  if (attainment >= 0.97) return "var(--color-good)";
  if (attainment >= 0.93) return "var(--color-warn)";
  return "var(--color-crit)";
}

export function SlaPriorityChart({ data }: { data: SlaPriorityDatum[] }) {
  const chartData = data.map((d) => ({ ...d, attainmentPct: Math.round(d.attainment * 1000) / 10 }));
  const { open } = useDrillThrough();

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
        barCategoryGap={16}
      >
        <CartesianGrid horizontal={false} stroke="var(--color-border-subtle)" />
        <XAxis
          type="number"
          domain={[80, 100]}
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis
          type="category"
          dataKey="priority"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
          width={64}
        />
        <Tooltip cursor={{ fill: "var(--color-border-subtle)" }} content={<ChartTooltip formatter={(v) => `${v}%`} />} />
        <Bar
          dataKey="attainmentPct"
          name="Attainment"
          radius={[0, 6, 6, 0]}
          isAnimationActive
          animationDuration={450}
          barSize={22}
          cursor="pointer"
          onClick={(entry) => open(queryForPriority((entry.payload as SlaPriorityDatum).priority))}
        >
          {chartData.map((d, i) => (
            <Cell key={i} fill={colorFor(d.attainment)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
