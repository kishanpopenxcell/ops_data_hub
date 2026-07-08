"use client";

import { motion } from "framer-motion";
import type { StageDatum } from "@/lib/mock/dashboard-data";

export function StageFunnel({ data }: { data: StageDatum[] }) {
  const maxCount = Math.max(...data.map((d) => d.count));

  return (
    <div className="flex flex-col gap-3">
      {data.map((stage, i) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 8);
        return (
          <div key={stage.stage} className="flex items-center gap-4">
            <div className="w-40 shrink-0 text-right text-xs font-medium text-text-muted">
              {stage.stage}
            </div>
            <div className="relative flex-1">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: `${widthPct}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.16), ease: [0.22, 1, 0.36, 1] }}
                className="flex h-9 items-center justify-between rounded-lg px-3"
                style={{
                  background:
                    i === data.length - 1
                      ? "var(--color-good)"
                      : `color-mix(in srgb, var(--color-accent) ${100 - i * 12}%, var(--color-surface-raised))`,
                }}
              >
                <span className="text-xs font-semibold tabular-nums text-[#16151a]">
                  {stage.count}
                </span>
                <span className="text-xs font-medium tabular-nums text-[#16151a]/70">
                  ${(stage.value / 1000).toFixed(0)}k
                </span>
              </motion.div>
            </div>
            <div className="w-14 shrink-0 text-xs tabular-nums text-text-faint">
              {stage.avgDays.toFixed(1)}d
            </div>
          </div>
        );
      })}
    </div>
  );
}
