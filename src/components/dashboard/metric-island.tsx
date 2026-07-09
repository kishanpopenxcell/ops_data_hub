"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { formatDelta, formatMetric, type MetricFormat } from "@/lib/format";
import type { KpiTile } from "@/lib/mock/dashboard-data";
import { queryForKpi } from "@/lib/drill-through";
import { useDrillThrough } from "./drill-through-context";

export function MetricIsland({
  kpi,
  index = 0,
  className,
}: {
  kpi: KpiTile;
  index?: number;
  className?: string;
}) {
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

  const { open } = useDrillThrough();
  const drillQuery = queryForKpi(kpi.key, kpi.label);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.15), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5 }}
      onClick={drillQuery ? () => open(drillQuery) : undefined}
      role={drillQuery ? "button" : undefined}
      tabIndex={drillQuery ? 0 : undefined}
      onKeyDown={
        drillQuery
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") open(drillQuery);
            }
          : undefined
      }
      className={cn(
        "group relative isolate overflow-hidden rounded-[32px] border border-accent/[0.08] bg-surface/90 p-6",
        "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_20px_40px_-24px_rgba(0,0,0,0.5)]",
        "transition-[transform,box-shadow] duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_28px_56px_-24px_rgba(0,0,0,0.6)]",
        drillQuery && "cursor-pointer",
        className,
      )}
    >
      {/* ambient ombre glow, layered surface effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-accent/[0.08] blur-[56px] transition-opacity duration-500 group-hover:opacity-100 opacity-70"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-24 rounded-full opacity-[0.4] blur-2xl"
        style={{ background: `radial-gradient(ellipse at bottom, ${chartColor}, transparent 70%)` }}
      />

      <div className="relative flex items-start justify-between gap-2">
        <span className="truncate text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted">
          {kpi.label}
        </span>
        <span
          className={cn(
            "flex shrink-0 items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums backdrop-blur-sm",
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

      <div className="relative mt-4 font-display text-4xl font-semibold tracking-tight text-text tabular-nums">
        {formatMetric(displayValue, kpi.format as MetricFormat)}
      </div>

      <div className="relative mt-5 h-12 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={`island-spark-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={chartColor}
              strokeWidth={2}
              fill={`url(#island-spark-${kpi.key})`}
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
