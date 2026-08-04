import { useEffect, useState } from "react";

/**
 * Wordmark curtain. Shows "adnan." over a flat void backdrop, then slides
 * up and off while the page slides in behind it.
 *
 * Gated on the real `load` event rather than a fixed timer, so a fast
 * connection is not made to sit through a spinner. A short minimum stops
 * the curtain from flashing, and a hard ceiling means a stalled asset can
 * never trap the visitor behind it.
 */
const MIN_VISIBLE = 700;
const MAX_VISIBLE = 3500;
const SLIDE_MS = 900;

export default function PreLoader({ onDone }) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let holdTimer = 0;
    let slideTimer = 0;
    let scheduled = false;

    const finish = () => {
      // `load` and the ceiling can both fire; only the first one counts.
      if (scheduled) return;
      scheduled = true;

      const waited = performance.now() - started;
      holdTimer = window.setTimeout(
        () => {
          setLeaving(true);
          // Hand off immediately so the page slides in as the curtain
          // lifts, rather than appearing after it has gone.
          onDone?.();
          slideTimer = window.setTimeout(() => setGone(true), SLIDE_MS);
        },
        Math.max(0, MIN_VISIBLE - waited),
      );
    };

    const ceiling = window.setTimeout(finish, MAX_VISIBLE);

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => {
      window.clearTimeout(ceiling);
      window.clearTimeout(holdTimer);
      window.clearTimeout(slideTimer);
      window.removeEventListener("load", finish);
    };
  }, [onDone]);

  // Hold the scroll position while the curtain is up, or a stray wheel
  // event leaves the visitor somewhere down the page when it lifts.
  useEffect(() => {
    if (gone) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  if (gone) return null;

  return (
    <div
      className={`preloader ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-live="polite"
    >
      <span className="preloader-mark font-display" aria-hidden="true">
        adnan<span className="text-brand-400">.</span>
      </span>
      <span className="sr-only">Loading portfolio</span>
    </div>
  );
}
