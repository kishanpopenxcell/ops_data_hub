"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function IslandChartCard({
  title,
  subtitle,
  index = 0,
  className,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  index?: number;
  className?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.15), ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className={cn(
        "relative isolate flex flex-col overflow-hidden rounded-[28px] border border-accent/[0.08] bg-surface/90 p-6",
        "shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_20px_40px_-24px_rgba(0,0,0,0.5)]",
        "transition-shadow duration-300 hover:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_28px_56px_-24px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <div className="relative mb-5 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-text">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="relative flex-1">{children}</div>
    </motion.div>
  );
}
