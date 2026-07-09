"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { LayoutDashboard, GitBranch, Headset, LogOut, TrendingUp, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const DOCK_ITEMS = [
  { href: "/", label: "Executive", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/service-sla", label: "Service SLA", icon: Headset },
  { href: "/data-quality", label: "Data Quality", icon: ShieldCheck },
];

export function CommandDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Desktop: fixed hover-expand rail (lg and up) */}
      <motion.aside
        onHoverStart={() => setExpanded(true)}
        onHoverEnd={() => setExpanded(false)}
        className={cn(
          "fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-stretch gap-1 overflow-hidden lg:flex",
          "rounded-[30px] border border-border/60 bg-surface/70 p-2.5 backdrop-blur-xl",
          "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.35),0_1px_0_rgba(255,255,255,0.04)_inset]",
        )}
        animate={{ width: expanded ? 208 : 60 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
      >
        <DockLogo expanded={expanded} />

        <div className="my-1.5 h-px bg-border-subtle" />

        <nav className="flex flex-col gap-1">
          {DOCK_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className="relative">
                <div
                  className={cn(
                    "group relative flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "text-text" : "text-text-muted hover:text-text",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="dock-active-glow"
                      className="absolute -left-[1px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent shadow-[0_0_10px_2px_var(--color-accent)]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-200",
                      !isActive && "group-hover:scale-110",
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                  </span>
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -6 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="my-1.5 h-px bg-border-subtle" />

        <div className="flex flex-col gap-1">
          <button
            onClick={handleSignOut}
            className="group relative flex items-center gap-3 rounded-2xl px-2.5 py-2.5 text-sm font-medium text-text-muted transition-colors hover:text-crit"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center transition-transform duration-200 group-hover:scale-110">
              <LogOut className="h-[18px] w-[18px]" />
            </span>
            <AnimatePresence>
              {expanded && (
                <motion.span
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className={cn("flex items-center px-1 pt-1", expanded ? "justify-start pl-1.5" : "justify-center")}>
            <ThemeToggle />
          </div>
        </div>
      </motion.aside>

      {/* Mobile/tablet: fixed bottom bar (below lg), icon-only, always-tappable */}
      <nav
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-1 lg:hidden",
          "border-t border-border/60 bg-surface/95 px-2 py-2 backdrop-blur-xl",
          "shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.35)]",
          "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        )}
      >
        {DOCK_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium transition-colors",
                isActive ? "text-text" : "text-text-muted",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-medium text-text-muted transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign out</span>
        </button>
        <div className="flex flex-1 flex-col items-center justify-center">
          <ThemeToggle />
        </div>
      </nav>
    </>
  );
}

function DockLogo({ expanded }: { expanded: boolean }) {
  return (
    <div className="flex items-center gap-3 px-2 py-1.5">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <TrendingUp className="h-4 w-4" />
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.15 }}
            className="whitespace-nowrap font-display text-sm font-semibold tracking-tight text-text"
          >
            OpsData Hub
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
