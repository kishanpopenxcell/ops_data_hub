"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const DATE_RANGES = ["Last 7 days", "Last 30 days", "Last quarter", "Year to date"];
const TEAMS = ["All teams", "Enterprise", "SMB"];

export function Topbar({ title, subtitle }: { title: string; subtitle: string }) {
  const [range, setRange] = useState(DATE_RANGES[1]);
  const [team, setTeam] = useState(TEAMS[0]);

  return (
    <div className="flex flex-col gap-4 px-2 pb-8 pt-8">
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-4">
        <div />
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-text">{title}</h1>
          <p className="mt-0.5 text-sm text-text-muted">{subtitle}</p>
        </div>
        <div className="flex justify-end">
          <FreshnessBadge />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <FilterPill icon={Calendar} value={range} options={DATE_RANGES} onChange={setRange} />
        <FilterPill value={team} options={TEAMS} onChange={setTeam} />
      </div>
    </div>
  );
}

function FreshnessBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-text-muted">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-good opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-good" />
      </span>
      Data as of just now
    </div>
  );
}

function FilterPill({
  icon: Icon,
  value,
  options,
  onChange,
}: {
  icon?: typeof Calendar;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-text",
          "transition-colors hover:border-text-faint",
        )}
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-text-muted" />}
        {value}
        <ChevronDown className={cn("h-3.5 w-3.5 text-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 top-full z-30 mt-1.5 min-w-full overflow-hidden rounded-lg border border-border bg-surface-raised shadow-[var(--shadow-card-hover)]"
        >
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 whitespace-nowrap px-3.5 py-2 text-left text-xs font-medium transition-colors hover:bg-surface",
                opt === value ? "text-accent" : "text-text-muted",
              )}
            >
              {opt === value && <Circle className="h-1.5 w-1.5 fill-current" />}
              {opt}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}
