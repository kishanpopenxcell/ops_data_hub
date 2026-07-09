"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/mock/insights-data";

const TONE_ICON = {
  positive: TrendingUp,
  warning: AlertTriangle,
  info: Info,
} as const;

const TONE_STYLE = {
  positive: "bg-good-soft text-good",
  warning: "bg-warn-soft text-warn",
  info: "bg-accent-soft text-accent",
} as const;

export function AiInsightsWidget({ insights, className }: { insights: Insight[]; className?: string }) {
  return (
    <div
      className={cn(
        "relative isolate flex h-full flex-col overflow-hidden rounded-[28px] border border-accent/[0.08] bg-surface/90 p-6",
        "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_20px_40px_-24px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-accent/[0.09] blur-[52px]"
      />

      <div className="relative mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-display text-sm font-semibold text-text">AI Insights</h3>
          <p className="text-[11px] text-text-faint">Generated from this week&apos;s activity</p>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col gap-3">
        {insights.map((insight, i) => {
          const Icon = TONE_ICON[insight.tone];
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.15) }}
              className="flex items-start gap-2.5 rounded-2xl border border-border-subtle bg-surface-raised/60 p-3"
            >
              <span className={cn("mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", TONE_STYLE[insight.tone])}>
                <Icon className="h-3 w-3" />
              </span>
              <p className="text-xs leading-relaxed text-text-muted">{insight.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
