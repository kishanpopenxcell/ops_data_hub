import { TrendingUp } from "lucide-react";

export function BrandMark() {
  return (
    <div className="fixed left-6 top-6 z-40 flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <TrendingUp className="h-4 w-4" />
      </div>
      <span className="font-display text-base font-semibold tracking-tight text-text">
        MetricHub
      </span>
    </div>
  );
}
