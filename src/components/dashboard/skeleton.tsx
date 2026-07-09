import { cn } from "@/lib/utils";

/** Pulsing placeholder block -- the base unit every dashboard skeleton composes from. */
export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-surface-raised", className)} />;
}

/** Mirrors KpiCard/MetricIsland's shape: label row, big value, sparkline strip. */
export function SkeletonKpiCard({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5",
        tall && "rounded-[32px] p-6",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-4 w-12 rounded-full" />
      </div>
      <SkeletonBlock className={cn("h-8 w-28", tall && "h-9 w-32")} />
      <SkeletonBlock className={cn("h-8 w-full", tall && "h-10")} />
    </div>
  );
}

/** Mirrors DqSummaryCard's shape: icon badge, big value, label -- no sparkline. */
export function SkeletonStatCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
      <SkeletonBlock className="h-11 w-11 shrink-0 rounded-xl" />
      <div className="flex flex-1 flex-col gap-2">
        <SkeletonBlock className="h-6 w-16" />
        <SkeletonBlock className="h-3 w-28" />
      </div>
    </div>
  );
}

/** Mirrors ChartCard/IslandChartCard's shape: title, subtitle, content area. */
export function SkeletonChartCard({
  className,
  contentHeight = "h-56",
  rounded = "rounded-2xl",
}: {
  className?: string;
  contentHeight?: string;
  rounded?: string;
}) {
  return (
    <div className={cn(rounded, "flex flex-col gap-4 border border-border bg-surface p-5", className)}>
      <div className="flex flex-col gap-1.5">
        <SkeletonBlock className="h-4 w-36" />
        <SkeletonBlock className="h-3 w-52" />
      </div>
      <SkeletonBlock className={cn("w-full", contentHeight)} />
    </div>
  );
}
