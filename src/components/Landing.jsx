/**
 * Entry gate. Deliberately text-free — the 3D scene behind it is the whole
 * message. The only copy on the page is the single call to action.
 */
export default function Landing({ onEnter, leaving }) {
  return (
    <section
      className={`relative z-10 flex min-h-svh flex-col justify-end px-6 pb-16 md:pb-20 ${
        leaving ? "landing-leave" : "landing-enter"
      }`}
      aria-label="Enter the portfolio"
    >
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onEnter}
          disabled={leaving}
          className="group relative inline-flex items-center gap-3 rounded-full border border-blue-400/30 bg-blue-950/40 px-8 py-4 text-sm font-semibold tracking-[0.18em] text-blue-50 uppercase backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:border-blue-300/70 hover:bg-blue-900/50 disabled:cursor-not-allowed disabled:opacity-60 md:text-base"
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-full bg-blue-500/25 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
          />
          <i
            className="ri-rocket-2-line text-lg transition-transform duration-500 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
          {leaving ? "Launching" : "Enter Adnan's Rocket"}
        </button>
      </div>
    </section>
  );
}
