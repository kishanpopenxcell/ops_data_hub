"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  // Server always renders "light" (no DOM access during SSR, and light is
  // the priority default -- see theme-script.ts) -- synced to the real
  // value in the effect below, once mounted. This must NOT be a lazy
  // useState initializer that reads document on first render: the client's
  // first render has to match the server's HTML exactly, or React throws a
  // hydration mismatch (confirmed via a live bug where a dark-theme user's
  // client immediately rendered Moon while the server had rendered Sun).
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") {
      setThemeState(current);
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
