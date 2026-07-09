import { Topbar } from "@/components/dashboard/topbar";
import { SkeletonKpiCard, SkeletonChartCard } from "@/components/dashboard/skeleton";

export default function ExecutiveLoading() {
  return (
    <>
      <Topbar
        title="Executive Overview"
        subtitle="Operational health across pipeline, service, and productivity"
      />
      <div className="grid grid-cols-1 gap-5 px-2 pb-16 sm:grid-cols-2 lg:grid-cols-12">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="lg:col-span-3">
            <SkeletonKpiCard tall />
          </div>
        ))}
        <div className="lg:col-span-8">
          <SkeletonChartCard rounded="rounded-[32px]" />
        </div>
        <div className="lg:col-span-4">
          <SkeletonChartCard rounded="rounded-[32px]" />
        </div>
        <div className="lg:col-span-8">
          <SkeletonChartCard rounded="rounded-[32px]" contentHeight="h-40" />
        </div>
        <div className="lg:col-span-4">
          <SkeletonChartCard rounded="rounded-[32px]" contentHeight="h-40" />
        </div>
        <div className="sm:col-span-2 lg:col-span-12">
          <SkeletonChartCard rounded="rounded-[32px]" contentHeight="h-48" />
        </div>
      </div>
    </>
  );
}
