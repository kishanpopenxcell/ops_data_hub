"use client";

import { motion } from "framer-motion";
import { queryForDqCategory } from "@/lib/drill-through";
import { useDrillThrough } from "./drill-through-context";
import type { CompletenessRow } from "@/lib/queries/data-quality";

const FIELD_TO_ISSUE: Record<string, "missing_amount" | "missing_priority" | null> = {
  amount: "missing_amount",
  priority: "missing_priority",
  owner: null,
  stage: null,
};

export function DqCompletenessBars({ data }: { data: CompletenessRow[] }) {
  const { open } = useDrillThrough();

  return (
    <div className="flex flex-col gap-3">
      {data.map((row, i) => {
        const pct = Math.round(row.completenessPct * 100);
        const issueType = FIELD_TO_ISSUE[row.field];
        const isClickable = Boolean(issueType) && row.missingCount > 0;
        const color = pct === 100 ? "var(--color-good)" : pct >= 90 ? "var(--color-warn)" : "var(--color-crit)";

        return (
          <div key={`${row.objectType}-${row.field}`} className="flex items-center gap-4">
            <div className="w-20 shrink-0 truncate text-right text-xs font-medium capitalize text-text-muted sm:w-32">
              {row.objectType} {row.field}
            </div>
            <div className="relative flex-1">
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                whileInView={{ width: `${Math.max(pct, 4)}%`, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.16), ease: [0.22, 1, 0.36, 1] }}
                onClick={isClickable ? () => open(queryForDqCategory(row.objectType, issueType!)) : undefined}
                className={`flex h-9 items-center justify-end rounded-lg px-3 ${isClickable ? "cursor-pointer" : ""}`}
                style={{ background: color }}
              >
                <span className="text-xs font-semibold tabular-nums text-[#16151a]">{pct}%</span>
              </motion.div>
            </div>
            <div className="w-24 shrink-0 text-xs tabular-nums text-text-faint">
              {row.missingCount} missing
            </div>
          </div>
        );
      })}
    </div>
  );
}
