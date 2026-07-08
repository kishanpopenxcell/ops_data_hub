"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const WORKSPACES = [
  { href: "/", label: "Executive" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/service-sla", label: "Service SLA" },
  { href: "/operations", label: "Operations" },
  { href: "/finance", label: "Finance" },
  { href: "/productivity", label: "Productivity" },
];

export function WorkspaceSwitcher() {
  const pathname = usePathname();

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-surface/70 p-1 backdrop-blur-xl">
      {WORKSPACES.map((ws) => {
        const isActive = pathname === ws.href;
        return (
          <Link key={ws.href} href={ws.href} className="relative">
            <div
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-200 whitespace-nowrap",
                isActive ? "text-[#16151a]" : "text-text-muted hover:text-text",
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="workspace-active-pill"
                  className="absolute inset-0 rounded-full bg-accent shadow-[0_2px_12px_-2px_var(--color-accent)]"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative z-10">{ws.label}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
