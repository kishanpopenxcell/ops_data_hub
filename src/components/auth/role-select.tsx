"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, Users, UserCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DemoRole {
  key: string;
  label: string;
  description: string;
  email: string;
  password: string;
  icon: typeof ShieldCheck;
}

export const DEMO_ROLES: DemoRole[] = [
  {
    key: "admin",
    label: "Admin",
    description: "Full tenant visibility across every team",
    email: "admin@metrichub.com",
    password: "MetricHub2026!",
    icon: ShieldCheck,
  },
  {
    key: "manager",
    label: "Manager",
    description: "Scoped to one team's pipeline and reps",
    email: "manager@metrichub.com",
    password: "MetricHub2026!",
    icon: Users,
  },
  {
    key: "rep",
    label: "Rep",
    description: "Scoped to their own deals and tickets",
    email: "rep@metrichub.com",
    password: "MetricHub2026!",
    icon: UserCircle,
  },
];

export function RoleSelect({
  value,
  onChange,
}: {
  value: DemoRole | null;
  onChange: (role: DemoRole) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-muted">
        Role
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-2.5 text-left text-sm text-text",
          "transition-colors outline-none hover:border-text-faint focus:border-accent focus:ring-2 focus:ring-accent/20",
        )}
      >
        {value ? (
          <>
            <value.icon className="h-4 w-4 shrink-0 text-accent" />
            <span className="flex-1">
              <span className="font-medium text-text">{value.label}</span>
              <span className="ml-1.5 text-xs text-text-muted">— {value.description}</span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-text-faint">Select a role to preview...</span>
        )}
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-30 mt-1.5 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-[var(--shadow-card-hover)]"
          >
            {DEMO_ROLES.map((role) => {
              const isActive = role.key === value?.key;
              return (
                <button
                  key={role.key}
                  type="button"
                  onClick={() => {
                    onChange(role);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-surface",
                    isActive ? "text-accent" : "text-text",
                  )}
                >
                  <role.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">
                    <span className="font-medium">{role.label}</span>
                    <span className="ml-1.5 text-xs text-text-muted">— {role.description}</span>
                  </span>
                  {isActive && <Circle className="h-1.5 w-1.5 shrink-0 fill-current" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
