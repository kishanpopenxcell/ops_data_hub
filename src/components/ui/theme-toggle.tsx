"use client";

import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/use-theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex h-10 w-10 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-raised hover:text-text"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
