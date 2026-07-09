"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/mock/dashboard-data";

export function TeamLeaderboard({ members }: { members: TeamMember[] }) {
  const sorted = [...members].sort((a, b) => b.quotaAttainment - a.quotaAttainment);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((m, i) => {
        const pct = Math.min(m.quotaAttainment * 100, 130);
        const onTrack = m.quotaAttainment >= 1;
        return (
          <motion.div
            key={m.name}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.12) }}
            className="flex items-center gap-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-semibold text-text-muted">
              {m.name.split(" ").map((p) => p[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-text">{m.name}</span>
                <span className={cn("font-semibold tabular-nums", onTrack ? "text-good" : "text-text-muted")}>
                  {(m.quotaAttainment * 100).toFixed(0)}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${Math.min(pct, 100)}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.12) + 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className={cn("h-full rounded-full", onTrack ? "bg-good" : "bg-accent")}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
