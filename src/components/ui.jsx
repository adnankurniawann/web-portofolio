/* Small shared presentational pieces used across the section pages. */

export function PageShell({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-5 pt-28 pb-20 md:px-8 md:pt-32 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, align = "center" }) {
  const centered = align === "center";
  return (
    <div
      className={`mb-10 max-w-2xl md:mb-14 ${centered ? "mx-auto text-center" : ""}`}
    >
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
      <div
        className={`rule-glow mt-5 w-28 ${centered ? "mx-auto" : ""}`}
        aria-hidden="true"
      />
      {description && (
        <p className="mt-5 text-sm leading-relaxed text-blue-200/70 md:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export function ToolChip({ children }) {
  return (
    <span className="rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-[11px] font-medium text-blue-200 md:text-xs">
      {children}
    </span>
  );
}
