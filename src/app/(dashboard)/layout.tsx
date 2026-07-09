import { CommandDock } from "@/components/dashboard/command-dock";
import { BrandMark } from "@/components/dashboard/brand-mark";
import { PageTransition } from "@/components/dashboard/page-transition";
import { DrillThroughProvider } from "@/components/dashboard/drill-through-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DrillThroughProvider>
      <div className="relative min-h-screen bg-base">
        <BrandMark />
        <CommandDock />
        <main className="min-h-screen overflow-x-hidden px-4 pb-24 sm:px-6 lg:pl-24 lg:pr-6 lg:pb-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </DrillThroughProvider>
  );
}
