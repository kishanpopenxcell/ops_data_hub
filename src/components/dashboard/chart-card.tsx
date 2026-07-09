"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ChartCard({
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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.1), ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-semibold text-text">{title}</h3>
          {subtitle && <p className="mt-0.5 text-xs text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}
