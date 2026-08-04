import { useReveal } from "../hooks/useReveal";

/* Shared presentational pieces. Everything on the page is built from these
   four, which is what keeps seven very different sections looking like one
   site rather than seven. */

/**
 * Anchor target + consistent vertical rhythm for every section.
 * `scroll-mt` matters as much as the padding: without it the fixed navbar
 * covers the heading the moment you jump to it.
 */
export function Section({ id, children, className = "" }) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-5 py-20 md:px-8 md:py-28 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  );
}

/** Left-aligned throughout — centred headings read as a template. */
export function SectionHeading({ eyebrow, title, description }) {
  const ref = useReveal();

  return (
    <div ref={ref} className="reveal mb-10 md:mb-14">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-2xl font-bold text-white md:text-3xl">{title}</h2>
      <div className="rule-glow mt-5 w-24" aria-hidden="true" />
      {description && (
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-blue-100/70 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function Chip({ children }) {
  return (
    <span className="rounded-md border border-blue-500/20 bg-blue-500/8 px-2.5 py-1 text-[11px] font-medium text-blue-200/90 md:text-xs">
      {children}
    </span>
  );
}

/** Hairline border over a barely-there fill. No heavy shadows anywhere. */
export function Card({ children, className = "", interactive = false }) {
  return (
    <div
      className={`rounded-card border border-blue-500/15 bg-surface/40 p-6 md:p-7 ${
        interactive
          ? "transition-colors duration-300 hover:border-blue-400/35 hover:bg-surface/60"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
