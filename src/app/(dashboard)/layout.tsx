import { CommandDock } from "@/components/dashboard/command-dock";
import { BrandMark } from "@/components/dashboard/brand-mark";
import { PageTransition } from "@/components/dashboard/page-transition";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-base">
      <BrandMark />
      <CommandDock />
      <main className="min-h-screen overflow-x-hidden pl-24 pr-6">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
