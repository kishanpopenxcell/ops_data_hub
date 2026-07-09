import { Topbar } from "@/components/dashboard/topbar";
import { SkeletonStatCard, SkeletonChartCard } from "@/components/dashboard/skeleton";

export default function DataQualityLoading() {
  return (
    <>
      <Topbar title="Data Quality" subtitle="Completeness, staleness, and ownership gaps across records" />
      <div className="flex flex-col gap-6 px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <SkeletonChartCard contentHeight="h-48" />
          </div>
          <SkeletonChartCard contentHeight="h-48" />
        </div>
        <SkeletonChartCard contentHeight="h-64" />
      </div>
    </>
  );
}
