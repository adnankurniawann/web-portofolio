import { useEffect, useState } from "react";
import DataImage from "../data";
import { ROLES, STATS, SOCIALS } from "../content";
import { PageShell } from "../components/ui";

export default function Home({ onNavigate }) {
  const [roleIndex, setRoleIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = setInterval(
      () => setRoleIndex((prev) => (prev + 1) % ROLES.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <PageShell>
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-10">
        <div className="order-2 flex flex-col items-center text-center md:order-1 md:items-start md:text-left">
          <div className="glass mb-6 inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-ring absolute inline-flex h-2 w-2 rounded-full bg-green-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
            </span>
            <span className="text-xs font-medium tracking-wide text-blue-100">
              Open to internships &amp; collaboration
            </span>
          </div>

          <h1 className="text-4xl leading-[1.1] font-bold text-white sm:text-5xl lg:text-6xl">
            Hi, I am
            <span className="gradient-text mt-2 block">
              Muhammad Adnan
              <br className="hidden sm:block" /> Kurniawan
            </span>
          </h1>

          <p className="mt-6 flex items-center gap-2.5 text-base font-medium text-blue-100 md:text-lg">
            <i className="ri-graduation-cap-fill text-blue-400" aria-hidden="true" />
            Informatics Student @ ITB
          </p>

          <div className="mt-3 flex h-9 items-center" aria-live="polite">
            <span
              key={roleIndex}
              className="animate-text-rotate font-display text-xl font-bold text-blue-400 md:text-2xl"
            >
              {ROLES[roleIndex]}
            </span>
          </div>

          <p className="mt-6 max-w-lg text-sm leading-relaxed text-blue-200/70 md:text-base">
            I turn complex problems into efficient, data-driven solutions —
            working across artificial intelligence, data science, and the web.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <a
              href="/CV_Muhammad Adnan Kurniawan.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 md:text-base"
            >
              <i
                className="ri-download-2-line text-lg transition-transform duration-300 group-hover:translate-y-0.5"
                aria-hidden="true"
              />
              Download CV
            </a>
            <button
              type="button"
              onClick={() => onNavigate("projects")}
              className="glass inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold text-blue-100 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50 hover:text-white md:text-base"
            >
              View Projects
              <i className="ri-arrow-right-line text-lg" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-8 flex items-center gap-2">
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

        <div className="order-1 flex justify-center md:order-2">
          <div className="animate-float relative">
            <div
              className="absolute -inset-6 rounded-full bg-blue-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-1 rounded-[2rem] bg-linear-to-tr from-blue-500/60 via-indigo-400/30 to-transparent"
              aria-hidden="true"
            />
            <img
              src={DataImage.HeroImage}
              alt="Portrait of Muhammad Adnan Kurniawan"
              width="380"
              height="380"
              fetchPriority="high"
              decoding="async"
              className="relative aspect-square w-[240px] rounded-[2rem] object-cover shadow-2xl shadow-blue-900/50 sm:w-[280px] lg:w-[340px]"
            />
          </div>
        </div>
      </div>

      <dl className="mt-14 grid grid-cols-3 gap-3 md:max-w-xl md:gap-5">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="glass card-lift rounded-2xl px-3 py-4 text-center md:px-5 md:py-5 md:text-left"
          >
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="gradient-text font-display block text-2xl font-bold md:text-3xl">
                {s.value}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-blue-200/60 md:text-xs">
                {s.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </PageShell>
  );
}
