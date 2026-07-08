import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-base px-6">
      <AmbientGlow />
      <div className="absolute right-5 top-5 z-10">
        <ThemeToggle />
      </div>
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}

function AmbientGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-10%] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-accent/[0.10] blur-[120px]" />
      <div className="absolute bottom-[-15%] right-[-10%] h-[28rem] w-[28rem] rounded-full bg-chart-4/[0.08] blur-[110px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-text) 1px, transparent 1px), linear-gradient(90deg, var(--color-text) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
