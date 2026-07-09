"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import type { StageDatum } from "@/lib/mock/dashboard-data";
import { queryForStage } from "@/lib/drill-through";
import { useDrillThrough } from "../drill-through-context";

export function StageFunnel({
  data,
  stageAging = {},
}: {
  data: StageDatum[];
  stageAging?: Record<string, "warn" | "crit">;
}) {
  const maxCount = Math.max(...data.map((d) => d.count));
  const { open } = useDrillThrough();

  return (
    <div className="flex flex-col gap-3 overflow-x-auto">
      {data.map((stage, i) => {
        const widthPct = Math.max((stage.count / maxCount) * 100, 8);
        const isClickable = Boolean(stage.stageId);
        const severity = stage.stageId ? stageAging[stage.stageId] : undefined;
        const isLastStage = i === data.length - 1;

        let background: string;
        if (severity === "crit") {
          background = "var(--color-crit)";
        } else if (severity === "warn") {
          background = "var(--color-warn)";
        } else if (isLastStage) {
          background = "var(--color-good)";
        } else {
          background = `color-mix(in srgb, var(--color-accent) ${100 - i * 12}%, var(--color-surface-raised))`;
        }

        return (
          <div key={stage.stage} className="flex min-w-[320px] items-center gap-2 sm:gap-4">
            <div className="flex w-20 shrink-0 items-center justify-end gap-1.5 whitespace-nowrap text-right text-xs font-medium text-text-muted sm:w-40">
              {severity && <AlertTriangle className="h-3 w-3 shrink-0 text-warn" />}
              <span className="truncate">{stage.stage}</span>
            </div>
            <div className="relative min-w-[64px] flex-1">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: `${widthPct}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.16), ease: [0.22, 1, 0.36, 1] }}
                onClick={
                  isClickable ? () => open(queryForStage(stage.stage, stage.stageId!)) : undefined
                }
                className={`flex h-11 items-center justify-between overflow-hidden rounded-lg px-3 ${isClickable ? "cursor-pointer" : ""}`}
                style={{ background }}
              >
                <span className="truncate text-xs font-semibold tabular-nums text-[#16151a]">
                  {stage.count}
                </span>
                <span className="truncate text-xs font-medium tabular-nums text-[#16151a]/70">
                  ${(stage.value / 1000).toFixed(0)}k
                </span>
              </motion.div>
            </div>
            <div className="w-10 shrink-0 whitespace-nowrap text-xs tabular-nums text-text-faint sm:w-14">
              {stage.avgDays.toFixed(1)}d
            </div>
          </div>
        );
      })}
    </div>
  );
}
