"use client";

import { useEffect, useState } from "react";

/**
 * Types out `text` character-by-character, then calls onDone. Re-runs
 * automatically whenever `text` changes (e.g. switching between login and
 * signup), since the effect's dependency array includes it.
 */
export function TypingText({
  text,
  as: Tag = "span",
  className,
  speed = 28,
  startDelay = 0,
  showCursorWhenDone = false,
  onDone,
}: {
  text: string;
  as?: "h2" | "p" | "span";
  className?: string;
  speed?: number;
  startDelay?: number;
  /** keep a blinking resting cursor after typing finishes (use on the last line only) */
  showCursorWhenDone?: boolean;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    let interval: ReturnType<typeof setInterval>;

    const startTimeout = setTimeout(() => {
      interval = setInterval(() => {
        i += 1;
        setShown(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          onDone?.();
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, startDelay]);

  const isDone = shown.length === text.length;
  if (isDone && !showCursorWhenDone) {
    return <Tag className={className}>{shown}</Tag>;
  }

  return (
    <Tag className={className}>
      {shown}
      <span
        aria-hidden
        className={`ml-0.5 inline-block h-[1em] w-[2px] translate-y-[0.1em] bg-current align-middle ${
          isDone ? "animate-pulse opacity-60" : "opacity-90"
        }`}
      />
    </Tag>
  );
}
