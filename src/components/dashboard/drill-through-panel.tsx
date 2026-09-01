"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Download, ExternalLink, CheckCircle2 } from "lucide-react";
import type { DrillThroughRecord } from "@/lib/queries/drill-through";
import type { DrillThroughQuery } from "@/lib/drill-through";
import { cn } from "@/lib/utils";

export function DrillThroughPanel({
  query,
  onClose,
}: {
  query: DrillThroughQuery | null;
  onClose: () => void;
}) {
  // One state object keyed by the query it belongs to, instead of separate
  // records/sum/loading/error slices. The previous version opened the effect
  // with setLoading(true)/setError(null) to reset the slices for a new query,
  // which is a setState-in-effect cascade (and briefly showed the previous
  // query's rows). Deriving `loading` from "settled result is for a different
  // query than the current one" needs no reset write at all.
  const [result, setResult] = useState<{
    query: DrillThroughQuery;
    records: DrillThroughRecord[];
    reconciledSum: number;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    fetch("/api/drill-through", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body?.error ?? "Failed to load records");
        return body as { records: DrillThroughRecord[]; reconciledSum: number };
      })
      .then((r) => {
        if (cancelled) return;
        setResult({ query, records: r.records, reconciledSum: r.reconciledSum, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        setResult({
          query,
          records: [],
          reconciledSum: 0,
          error: err instanceof Error ? err.message : "Failed to load records",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  // Only trust the settled result if it belongs to the query being shown --
  // otherwise this query is still in flight.
  const settled = result && result.query === query ? result : null;
  const loading = query !== null && settled === null;
  const error = settled?.error ?? null;
  const records = settled && !settled.error ? settled.records : [];
  const reconciledSum = settled?.reconciledSum ?? 0;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function handleExport() {
    if (!query || records.length === 0) return;
    const headers = ["ID", "Name", "Owner", query.object === "deal" ? "Stage" : "Priority", "Amount", "Date"];
    const rows = records.map((r) => [
      r.hubspotId,
      csvEscape(r.name),
      csvEscape(r.ownerName),
      csvEscape(r.stageOrPriority),
      r.amount ?? "",
      r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${query.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const isOpen = query !== null;
  const hasAmounts = records.some((r) => r.amount !== null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className={cn(
              "fixed right-0 top-0 z-50 flex h-screen w-full max-w-xl flex-col",
              "border-l border-border bg-surface shadow-[0_0_60px_-12px_rgba(0,0,0,0.5)]",
            )}
          >
            <div className="flex items-start justify-between border-b border-border-subtle px-6 py-5">
              <div className="min-w-0 flex-1">
                <h2 className="font-display text-lg font-semibold text-text">{query?.title}</h2>
                <p className="mt-0.5 text-xs text-text-muted">{query?.description}</p>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading && (
                <div className="flex items-center justify-center py-16 text-sm text-text-muted">
                  Loading records…
                </div>
              )}
              {error && (
                <div className="rounded-lg bg-crit-soft px-3 py-2 text-sm text-crit">{error}</div>
              )}
              {!loading && !error && records.length === 0 && (
                <div className="flex items-center justify-center py-16 text-sm text-text-muted">
                  No records match this slice.
                </div>
              )}
              {!loading && !error && records.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border-subtle text-xs uppercase tracking-wide text-text-faint">
                        <th className="py-2 pr-3 font-medium">Name</th>
                        <th className="py-2 pr-3 font-medium">Owner</th>
                        <th className="py-2 pr-3 font-medium">{query?.object === "deal" ? "Stage" : "Priority"}</th>
                        {hasAmounts && <th className="py-2 pr-3 text-right font-medium">Amount</th>}
                        <th className="py-2 pl-3 text-right font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.id} className="border-b border-border-subtle/60">
                          <td className="max-w-[180px] truncate py-2.5 pr-3 text-text">{r.name}</td>
                          <td className="max-w-[140px] truncate py-2.5 pr-3 text-text-muted">{r.ownerName}</td>
                          <td className="max-w-[120px] truncate py-2.5 pr-3 text-text-muted">{r.stageOrPriority}</td>
                          {hasAmounts && (
                            <td className="py-2.5 pr-3 text-right tabular-nums text-text">
                              {r.amount !== null ? `$${r.amount.toLocaleString()}` : "—"}
                            </td>
                          )}
                          <td className="py-2.5 pl-3 text-right">
                            <a
                              href={`https://app.hubspot.com/contacts/0/${query?.object}/${r.hubspotId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-accent hover:text-accent-strong"
                            >
                              HubSpot <ExternalLink className="h-3 w-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {!loading && !error && records.length > 0 && (
              <div className="border-t border-border-subtle px-6 py-4">
                <div className="mb-3 flex items-center gap-2 text-xs text-text-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-good" />
                  {records.length} record{records.length === 1 ? "" : "s"}
                  {hasAmounts && (
                    <>
                      {" "}
                      · sum = <span className="font-medium tabular-nums text-text">${reconciledSum.toLocaleString()}</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleExport}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-raised px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-text-faint"
                >
                  <Download className="h-4 w-4" />
                  Export this slice (CSV)
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
