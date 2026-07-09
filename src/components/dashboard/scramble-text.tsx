"use client";

import { useEffect, useState } from "react";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Resolves scrambled random characters into `text`, left to right, like a
 * value decoding into place -- used on the brand wordmark so it reads as
 * "computing" rather than a generic fade/slide. Spaces stay spaces
 * throughout (never scrambled) so word boundaries don't flicker.
 *
 * Re-runs whenever `text` changes, so keying the parent by pathname makes
 * it replay on every navigation.
 */
export function ScrambleText({
  text,
  className,
  duration = 500,
  revealStep = 40,
}: {
  text: string;
  className?: string;
  /** total time budget for the scramble-then-lock effect, in ms */
  duration?: number;
  /** how often (ms) the still-scrambled tail re-randomizes */
  revealStep?: number;
}) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    let frame = 0;
    const totalFrames = Math.max(1, Math.floor(duration / revealStep));
    const lockFrame = (i: number) => Math.floor((i / text.length) * totalFrames);

    const interval = setInterval(() => {
      frame += 1;
      let next = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " ") {
          next += " ";
        } else if (frame >= lockFrame(i + 1)) {
          next += ch;
        } else {
          next += SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        }
      }
      setDisplay(next);
      if (frame >= totalFrames) clearInterval(interval);
    }, revealStep);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return <span className={className}>{display}</span>;
}
