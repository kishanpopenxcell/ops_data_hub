"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../chart-tooltip";
import type { OwnerDatum } from "@/lib/mock/dashboard-data";

export function OwnerBarChart({ data }: { data: OwnerDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
        <XAxis
          dataKey="owner"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "var(--color-text-faint)", fontSize: 11 }}
          interval={0}
          angle={-12}
          textAnchor="end"
          height={48}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} width={28} />
        <Tooltip cursor={{ fill: "var(--color-border-subtle)" }} content={<ChartTooltip />} />
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: 11, color: "var(--color-text-muted)", paddingTop: 8 }}
        />
        <Bar dataKey="won" name="Won" fill="var(--color-good)" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={450} />
        <Bar dataKey="open" name="Open" fill="var(--color-accent)" radius={[3, 3, 0, 0]} isAnimationActive animationDuration={450} animationBegin={40} />
        <Bar dataKey="lost" name="Lost" fill="var(--color-crit)" fillOpacity={0.55} radius={[3, 3, 0, 0]} isAnimationActive animationDuration={450} animationBegin={80} />
      </BarChart>
    </ResponsiveContainer>
  );
}
