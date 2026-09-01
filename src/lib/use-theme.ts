"use client";

import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

// The <html data-theme> attribute is the source of truth -- theme-script.ts
// stamps it before hydration, and setTheme writes it. That makes it an
// external store, so it is read with useSyncExternalStore rather than mirrored
// into component state via an effect. The effect version had to setState during
// the mount effect to correct the server's guess, which cascades an extra
// render on every consumer (and trips react-hooks/set-state-in-effect).
//
// getServerSnapshot returns "light" -- the priority default, and what the
// server HTML contains. The client's first render has to match that exactly or
// React throws a hydration mismatch (confirmed via a live bug where a
// dark-theme user's client rendered Moon while the server had rendered Sun),
// so `mounted` stays part of the API for consumers that gate icon swaps on it.

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  const current = document.documentElement.getAttribute("data-theme");
  return current === "dark" ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

// Same store shape, but the value is "has the client taken over yet". Server
// and first client render both say false; the subscribe callback fires once on
// mount to flip it to true, which is exactly the mounted signal without a
// setState-in-effect.
function subscribeMounted(onStoreChange: () => void) {
  const id = requestAnimationFrame(onStoreChange);
  return () => cancelAnimationFrame(id);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(
    subscribeMounted,
    () => true,
    () => false,
  );

  // No setState here -- writing the attribute notifies the MutationObserver,
  // which drives the re-render through the store above.
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme, mounted };
}
