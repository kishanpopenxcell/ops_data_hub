"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  Headset,
  Settings,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { href: "/", label: "Executive", icon: LayoutDashboard },
  { href: "/pipeline", label: "Pipeline", icon: GitBranch },
  { href: "/service-sla", label: "Service SLA", icon: Headset },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-6">
      <div className="mb-8 flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-text">
            MetricHub
          </span>
        </div>
        <ThemeToggle />
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "text-text" : "text-text-muted hover:text-text hover:bg-surface-raised",
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-accent-soft"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border-subtle pt-4">
        <Link
          href="/admin"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname === "/admin"
              ? "text-text"
              : "text-text-muted hover:text-text hover:bg-surface-raised",
          )}
        >
          <Settings className="h-4 w-4" />
          Admin
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-text-muted transition-colors hover:bg-surface-raised hover:text-crit"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
