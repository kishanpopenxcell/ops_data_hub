"use client";

import { motion } from "framer-motion";
import { Phone, Mail, Calendar, Trophy, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/lib/mock/dashboard-data";

const ICONS: Record<ActivityItem["type"], typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  deal_won: Trophy,
  sla_breach: AlertTriangle,
};

const ICON_STYLES: Record<ActivityItem["type"], string> = {
  call: "bg-chart-4/15 text-chart-4",
  email: "bg-chart-5/15 text-chart-5",
  meeting: "bg-accent-soft text-accent",
  deal_won: "bg-good-soft text-good",
  sla_breach: "bg-crit-soft text-crit",
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const Icon = ICONS[item.type];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.1) }}
            className="flex items-start gap-3 border-b border-border-subtle py-3 last:border-0"
          >
            <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", ICON_STYLES[item.type])}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-text">
                <span className="font-medium">{item.actor}</span>{" "}
                <span className="text-text-muted">{item.description}</span>
              </p>
              <span className="text-xs text-text-faint">{item.timestamp}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
