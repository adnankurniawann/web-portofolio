import { useEffect, useRef } from "react";

/**
 * Reveals its element once it scrolls into view. Returns a ref to attach to
 * any node that also carries the `reveal` class.
 *
 * Lives apart from ui.jsx because React Fast Refresh only tracks a module
 * when every export is a component — mixing a hook in there silently breaks
 * hot reload for the whole file.
 */
export function useReveal({ delay = 0 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // `.reveal` starts at opacity 0, so a browser without the observer must
    // be shown the content rather than left staring at a blank page.
    if (typeof IntersectionObserver === "undefined") {
      el.classList.add("is-visible");
      return;
    }

    if (delay) el.style.transitionDelay = `${delay}ms`;

    const io = new IntersectionObserver(
      ([entry]) => {
        // One-way: revealed content stays revealed. Re-hiding on scroll-up
        // reads as a glitch, not an effect.
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return ref;
}
