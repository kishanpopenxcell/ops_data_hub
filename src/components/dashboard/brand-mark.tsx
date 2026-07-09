"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ScrambleText } from "./scramble-text";

export function BrandMark({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "fixed left-6 top-6 z-40 hidden items-center gap-2.5 lg:flex",
        className,
      )}
    >
      <motion.div
        key={`icon-${pathname}`}
        initial={{ scale: 0.7, opacity: 0.4 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex h-8 w-8 shrink-0 items-center justify-center"
      >
        <Image src="/logo-square.png" alt="OpsData Hub" width={32} height={32} className="h-full w-full object-contain" priority />
      </motion.div>
      <ScrambleText
        key={`text-${pathname}`}
        text="OpsData Hub"
        className="font-display text-base font-semibold tracking-tight text-text tabular-nums"
      />
    </div>
  );
}
