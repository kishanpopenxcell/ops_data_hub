"use client";

import { motion } from "framer-motion";
import { Topbar } from "@/components/dashboard/topbar";

export function WorkspaceStub({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <>
      <Topbar title={title} subtitle={subtitle} />
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-border bg-surface text-accent shadow-[var(--shadow-card)]"
        >
          {icon}
        </motion.div>
        <div>
          <h2 className="font-display text-lg font-semibold text-text">This workspace is warming up</h2>
          <p className="mt-1.5 max-w-sm text-sm text-text-muted">
            {`${title} is on the roadmap for a future release. The dock and workspace switcher already know it's coming.`}
          </p>
        </div>
      </div>
    </>
  );
}
