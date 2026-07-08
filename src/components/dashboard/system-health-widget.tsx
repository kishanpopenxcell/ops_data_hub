"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SystemHealthMetric } from "@/lib/mock/insights-data";

const STATUS_DOT = {
  good: "bg-good",
  warn: "bg-warn",
  crit: "bg-crit",
} as const;

export function SystemHealthWidget({
  metrics,
  className,
}: {
  metrics: SystemHealthMetric[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate flex flex-col gap-5 overflow-hidden rounded-[28px] border border-accent/[0.08] bg-surface/90 p-6 sm:flex-row sm:items-center sm:justify-between",
        "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_20px_40px_-24px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-good/[0.07] blur-[56px]"
      />

      <div className="relative flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-good-soft text-good">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-text">System Health</h3>
          <p className="text-[11px] text-text-faint">All systems operating normally</p>
        </div>
      </div>

      <div className="relative grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.12) }}
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-text-faint">
              <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[m.status])} />
              {m.label}
            </div>
            <span className="font-display text-sm font-semibold tabular-nums text-text">{m.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
