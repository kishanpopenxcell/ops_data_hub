"use client";

import { createContext, useCallback, useContext, useState } from "react";
import type { DrillThroughQuery } from "@/lib/drill-through";
import { DrillThroughPanel } from "./drill-through-panel";

interface DrillThroughContextValue {
  open: (query: DrillThroughQuery) => void;
}

const DrillThroughContext = createContext<DrillThroughContextValue | null>(null);

export function DrillThroughProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState<DrillThroughQuery | null>(null);

  const open = useCallback((q: DrillThroughQuery) => setQuery(q), []);
  const close = useCallback(() => setQuery(null), []);

  return (
    <DrillThroughContext.Provider value={{ open }}>
      {children}
      <DrillThroughPanel query={query} onClose={close} />
    </DrillThroughContext.Provider>
  );
}

export function useDrillThrough() {
  const ctx = useContext(DrillThroughContext);
  if (!ctx) throw new Error("useDrillThrough must be used within a DrillThroughProvider");
  return ctx;
}
