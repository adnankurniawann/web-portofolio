import { SOCIALS } from "../content";

/**
 * The entry gate. The 3D rocket and astronaut sit behind this, so the
 * copy stays on the left and leaves the right half of the viewport clear
 * for them (they move above the text on portrait screens).
 */
export default function Landing({ onEnter, leaving }) {
  return (
    <section
      className={`relative z-10 flex min-h-svh flex-col justify-center px-6 py-16 md:px-12 lg:px-20 ${
        leaving ? "landing-leave" : "landing-enter"
      }`}
      aria-label="Welcome"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="max-w-xl">
          <p className="eyebrow mb-5 flex items-center gap-3">
            <span className="rule-glow inline-block w-10" aria-hidden="true" />
            Portfolio
          </p>

          <h1 className="text-4xl leading-[1.08] font-bold text-white sm:text-5xl lg:text-6xl">
            Muhammad Adnan
            <span className="gradient-text block">Kurniawan</span>
          </h1>

          <p className="mt-6 max-w-md text-base leading-relaxed text-blue-200/75 md:text-lg">
            Informatics student at ITB, building with artificial intelligence,
            data science, and the web.
          </p>

          <div className="mt-10 flex flex-col items-start gap-5">
            <button
              type="button"
              onClick={onEnter}
              disabled={leaving}
              className="group relative inline-flex items-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-[0_0_40px_-8px_rgb(37_99_235/0.9)] transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-70 md:text-lg"
            >
              <i
                className="ri-rocket-2-fill text-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
              {leaving ? "Launching…" : "Launch"}
              <span
                aria-hidden="true"
                className="absolute inset-0 -z-10 rounded-2xl bg-blue-500/40 blur-xl transition-opacity duration-300 group-hover:opacity-100"
              />
            </button>

            <p className="flex items-center gap-2 text-xs tracking-wide text-blue-300/50">
              <i className="ri-cursor-line" aria-hidden="true" />
              Click to enter the portfolio
            </p>
          </div>

          <div className="mt-12 flex items-center gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                title={s.label}
                className="glass flex h-11 w-11 items-center justify-center rounded-xl text-xl text-blue-300 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:text-white"
              >
                <i className={s.icon} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
