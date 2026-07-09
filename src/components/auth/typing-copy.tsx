"use client";

import { useState } from "react";
import { TypingText } from "./typing-text";

/**
 * Types the heading, then the body once the heading finishes. Lives as its
 * own component (rather than lifting state into the parent) so it can be
 * keyed by the parent's AnimatePresence and get a fresh, correctly-reset
 * headingDone state on every remount -- no cross-panel state bleed when
 * switching between login and signup.
 */
export function TypingCopy({ heading, body }: { heading: string; body: string }) {
  const [headingDone, setHeadingDone] = useState(false);

  return (
    <>
      <TypingText
        as="h2"
        text={heading}
        speed={32}
        className="font-display text-2xl font-semibold leading-snug tracking-tight text-text"
        onDone={() => setHeadingDone(true)}
      />
      {headingDone && (
        <TypingText
          as="p"
          text={body}
          speed={12}
          className="mt-2 text-sm text-text-muted"
          showCursorWhenDone
        />
      )}
    </>
  );
}
