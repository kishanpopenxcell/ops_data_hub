"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryForDeal } from "@/lib/drill-through";
import { useDrillThrough } from "./drill-through-context";
import type { StalledDeal } from "@/lib/queries/stalled-deals";

export function StalledDealsWidget({ deals }: { deals: StalledDeal[] }) {
  const { open } = useDrillThrough();

  if (deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-good-soft text-good">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-xs text-text-muted">No deals are stalled beyond normal variance.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {deals.map((deal, i) => {
        const severity = (deal.multipleOfBaseline ?? 0) >= 3 ? "crit" : "warn";
        return (
          <motion.button
            key={deal.dealId}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.16) }}
            onClick={() => open(queryForDeal(deal.dealId, deal.dealName))}
            className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-raised/60 p-3 text-left transition-colors hover:border-text-faint"
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                severity === "crit" ? "bg-crit-soft text-crit" : "bg-warn-soft text-warn",
              )}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{deal.dealName}</p>
              <p className="truncate text-xs text-text-muted">
                {deal.ownerName} · {deal.daysInStage.toFixed(0)}d in {deal.stageLabel}
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
                severity === "crit" ? "bg-crit-soft text-crit" : "bg-warn-soft text-warn",
              )}
            >
              {deal.multipleOfBaseline?.toFixed(1)}×
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
