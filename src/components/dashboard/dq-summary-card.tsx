"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DqSummaryCard({
  label,
  value,
  icon,
  tone = "neutral",
  index = 0,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone?: "good" | "warn" | "crit" | "neutral";
  index?: number;
}) {
  const toneClasses = {
    good: "bg-good-soft text-good",
    warn: "bg-warn-soft text-warn",
    crit: "bg-crit-soft text-crit",
    neutral: "bg-accent-soft text-accent",
  }[tone];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.12), ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", toneClasses)}>
        {icon}
      </div>
      <div>
        <p className="font-display text-2xl font-semibold tracking-tight text-text tabular-nums">{value}</p>
        <p className="text-xs font-medium text-text-muted">{label}</p>
      </div>
    </motion.div>
  );
}
