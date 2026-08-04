import { useState, useEffect } from "react";

/**
 * Gates the page on the real `load` event rather than a fixed timer, so
 * fast connections are not forced to stare at a spinner. A short minimum
 * keeps the fade from flashing, and a hard ceiling means a stalled asset
 * can never trap the visitor behind the overlay.
 */
const MIN_VISIBLE = 600;
const MAX_VISIBLE = 4000;

const PreLoader = () => {
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const started = performance.now();
    let fadeTimer;

    const finish = () => {
      const waited = performance.now() - started;
      const remaining = Math.max(0, MIN_VISIBLE - waited);

      window.setTimeout(() => {
        setDone(true);
        // Unmount only after the fade-out has actually played.
        fadeTimer = window.setTimeout(() => setHidden(true), 600);
      }, remaining);
    };

    const ceiling = window.setTimeout(finish, MAX_VISIBLE);

    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.clearTimeout(ceiling);
      window.clearTimeout(fadeTimer);
      window.removeEventListener("load", finish);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-[#020617] transition-opacity duration-500 ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative h-16 w-16">
          <span
            className="absolute inset-0 rounded-full border-2 border-blue-500/20"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-400 border-r-blue-400"
            aria-hidden="true"
          />
          <span
            className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
            aria-hidden="true"
          />
        </div>

        <p className="font-display text-xs font-semibold tracking-[0.3em] text-blue-300/70 uppercase">
          Loading
        </p>
      </div>

      <span className="sr-only">Loading portfolio</span>
    </div>
  );
};

export default PreLoader;
