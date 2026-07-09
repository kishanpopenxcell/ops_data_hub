import { Topbar } from "@/components/dashboard/topbar";
import { SkeletonKpiCard, SkeletonChartCard } from "@/components/dashboard/skeleton";

export default function PipelineLoading() {
  return (
    <>
      <Topbar title="Pipeline" subtitle="Funnel health, stage velocity, and rep performance" />
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonKpiCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <SkeletonChartCard contentHeight="h-72" />
          </div>
          <SkeletonChartCard contentHeight="h-72" />
        </div>
        <SkeletonChartCard contentHeight="h-64" />
        <SkeletonChartCard contentHeight="h-56" />
      </div>
    </>
  );
}
