"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartTooltip } from "../chart-tooltip";
import type { AgeBandDatum } from "@/lib/mock/dashboard-data";

const BAND_COLORS = ["var(--color-good)", "var(--color-warn)", "var(--color-chart-2)", "var(--color-crit)"];

export function BacklogAgeChart({ data }: { data: AgeBandDatum[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--color-border-subtle)" />
        <XAxis dataKey="band" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-faint)", fontSize: 11 }} width={24} />
        <Tooltip cursor={{ fill: "var(--color-border-subtle)" }} content={<ChartTooltip />} />
        <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={450} barSize={36}>
          {data.map((_, i) => (
            <Cell key={i} fill={BAND_COLORS[i % BAND_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
