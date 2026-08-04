import { useEffect } from "react";

/**
 * Entry gate. Almost text-free — the 3D scene behind it is the message.
 * The copy that is here exists only to teach the two interactions: move
 * the cursor to wake the crew, then launch.
 */
const STATUS = {
  standby: {
    dot: "bg-amber-300",
    label: "Systems on standby",
    hint: "Move your cursor — the crew is waiting",
  },
  ready: {
    dot: "bg-emerald-400 dot-live",
    label: "All systems nominal",
    hint: "Take the seat, or just press Enter",
  },
  launch: {
    dot: "bg-sky-300 dot-live",
    label: "Ignition sequence",
    hint: "Clearing the pad",
  },
};

export default function Landing({ onEnter, leaving, awake }) {
  // The button label says "Enter" — so the Enter key had better work from
  // anywhere on the page, not only when the button happens to have focus.
  useEffect(() => {
    if (leaving) return;
    const onKey = (e) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      const el = document.activeElement;
      if (el && (el.tagName === "BUTTON" || el.tagName === "A")) return;
      onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter, leaving]);

  const state = leaving ? "launch" : awake ? "ready" : "standby";
  const { dot, label, hint } = STATUS[state];

  return (
    <section
      className={`relative z-10 flex min-h-svh flex-col items-center justify-between px-6 py-10 text-center md:py-14 ${
        leaving ? "landing-leave" : "landing-enter"
      }`}
      aria-label="Enter the portfolio"
    >
      <p className="font-display text-[0.6rem] font-medium tracking-[0.42em] text-blue-200/45 uppercase md:text-[0.68rem]">
        Muhammad Adnan Kurniawan
      </p>

      <div className="flex flex-col items-center gap-7">
        <button
          type="button"
          onClick={onEnter}
          disabled={leaving}
          className="cta group relative inline-flex items-center gap-3.5 rounded-full px-8 py-4 text-sm font-semibold tracking-[0.18em] text-blue-50 uppercase transition-transform duration-500 hover:-translate-y-1 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 md:px-10 md:text-base"
        >
          {/* Rotating hairline, then the glass fill it sits on. */}
          <span aria-hidden="true" className="cta-ring" />
          <span aria-hidden="true" className="cta-fill" />
          <span aria-hidden="true" className="cta-glow" />

          <i
            className="ri-rocket-2-fill relative text-lg transition-transform duration-500 group-hover:-translate-y-1"
            aria-hidden="true"
          />
          <span className="relative">
            {leaving ? "Launching" : "Enter Adnan's Rocket"}
          </span>
        </button>

        <p
          key={state}
          className="hint-swap max-w-xs text-xs text-blue-200/55 md:text-sm"
        >
          {hint}
        </p>
      </div>

      <div
        className="flex items-center gap-2.5 text-[0.6rem] tracking-[0.28em] text-blue-200/45 uppercase md:text-[0.68rem]"
        aria-live="polite"
      >
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {label}
      </div>
    </section>
  );
}
