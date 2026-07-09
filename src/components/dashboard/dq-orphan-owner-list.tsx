"use client";

import { motion } from "framer-motion";
import { UserX } from "lucide-react";
import { queryForDqCategory } from "@/lib/drill-through";
import { useDrillThrough } from "./drill-through-context";
import type { OrphanOwnerRow } from "@/lib/queries/data-quality";

export function DqOrphanOwnerList({ owners }: { owners: OrphanOwnerRow[] }) {
  const { open } = useDrillThrough();

  if (owners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-good-soft text-good">
          <UserX className="h-4 w-4" />
        </div>
        <p className="text-xs text-text-muted">Every record maps to an active owner.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      {owners.map((owner, i) => (
        <motion.button
          key={owner.ownerId}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.16) }}
          onClick={() => open(queryForDqCategory("deal", "orphan_owner"))}
          className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface-raised/60 p-3 text-left transition-colors hover:border-text-faint"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-crit-soft text-crit">
            <UserX className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-text">{owner.ownerId}</p>
            <p className="text-xs text-text-muted">No matching active owner record</p>
          </div>
          <span className="shrink-0 rounded-full bg-crit-soft px-2 py-0.5 text-[11px] font-semibold tabular-nums text-crit">
            {owner.recordCount} record{owner.recordCount === 1 ? "" : "s"}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
