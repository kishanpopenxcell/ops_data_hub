"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { formatDelta, formatMetric, type MetricFormat } from "@/lib/format";
import type { KpiTile } from "@/lib/mock/dashboard-data";

export function KpiCard({ kpi, index = 0 }: { kpi: KpiTile; index?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, kpi.value, {
      duration: 0.6,
      delay: Math.min(index * 0.04, 0.12),
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplayValue(v),
    });
    return () => controls.stop();
  }, [inView, kpi.value, index]);

  const isPositiveTrend = kpi.deltaPct > 0;
  const isGoodDirection = kpi.sparklineGood === (isPositiveTrend ? "up" : "down");
  const chartData = kpi.trend.map((v, i) => ({ i, v }));
  const chartColor = isGoodDirection ? "var(--color-good)" : "var(--color-crit)";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.12), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-surface p-5",
        "shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-card-hover)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accent/[0.06] blur-2xl transition-opacity duration-300 group-hover:opacity-100 opacity-0"
      />

      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {kpi.label}
        </span>
        <span
          className={cn(
            "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            isGoodDirection ? "bg-good-soft text-good" : "bg-crit-soft text-crit",
          )}
        >
          {isPositiveTrend ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {formatDelta(kpi.deltaPct)}
        </span>
      </div>

      <div className="mt-3 font-display text-3xl font-semibold tracking-tight text-text tabular-nums">
        {formatMetric(displayValue, kpi.format as MetricFormat)}
      </div>

      <div className="mt-4 h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={chartColor}
              strokeWidth={1.75}
              fill={`url(#spark-${kpi.key})`}
              isAnimationActive
              animationDuration={500}
              animationBegin={Math.min(index * 40, 120)}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
