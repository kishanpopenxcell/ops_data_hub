"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { queryForDqIssue } from "@/lib/drill-through";
import { useDrillThrough } from "./drill-through-context";
import type { DqIssue } from "@/lib/queries/data-quality";

const ISSUE_LABELS: Record<DqIssue["issueType"], string> = {
  missing_amount: "Missing amount",
  missing_priority: "Missing priority",
  orphan_owner: "Orphaned owner",
};

export function DqIssuesTable({ issues }: { issues: DqIssue[] }) {
  const { open } = useDrillThrough();

  if (issues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-good-soft text-good">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <p className="text-xs text-text-muted">No records need attention right now.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-faint">
            <th className="py-2 pr-3 font-medium">Record</th>
            <th className="py-2 pr-3 font-medium">Owner</th>
            <th className="py-2 pr-3 font-medium">Issue</th>
            <th className="py-2 pl-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue, i) => (
            <motion.tr
              key={`${issue.objectType}-${issue.objectId}-${issue.issueType}`}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.16) }}
              onClick={() => open(queryForDqIssue(issue.objectType, issue.objectId, issue.objectName))}
              className="cursor-pointer border-b border-border-subtle/60 transition-colors hover:bg-surface-raised/60"
            >
              <td className="max-w-[160px] truncate py-2.5 pr-3 text-text">{issue.objectName}</td>
              <td className="max-w-[140px] truncate py-2.5 pr-3 text-text-muted">
                {issue.ownerName ?? "Unassigned"}
              </td>
              <td className="py-2.5 pr-3">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    issue.issueType === "orphan_owner" ? "bg-crit-soft text-crit" : "bg-warn-soft text-warn",
                  )}
                >
                  <AlertTriangle className="h-3 w-3" />
                  {ISSUE_LABELS[issue.issueType]}
                </span>
              </td>
              <td className="py-2.5 pl-3 text-right text-xs whitespace-nowrap text-text-faint capitalize">
                {issue.objectType}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
