import HeroImage from "/assets/hero-img.webp";

import { PROFILE, SOCIALS } from "../content";
import { useReveal } from "../hooks/useReveal";

/**
 * The first screen — a centred column, portrait first. It is the only
 * centred block on the site; every section below stays left-aligned so the
 * hero reads as the title page rather than as one more section.
 */
export default function Home() {
  const photoRef = useReveal();
  const textRef = useReveal({ delay: 120 });

  return (
    <section
      id="home"
      className="flex min-h-svh scroll-mt-24 flex-col items-center justify-center px-5 pt-24 pb-16 text-center md:px-8 md:pt-36 md:pb-20"
    >
      <div ref={photoRef} className="reveal">
        <div className="relative w-28 md:w-40">
          <div
            aria-hidden="true"
            className="bg-brand-500/15 absolute -inset-5 rounded-full blur-3xl"
          />
          {/* Explicit width/height so the centred column does not jump while
              the portrait is still loading. */}
          <img
            src={HeroImage}
            alt={`Portrait of ${PROFILE.name}`}
            width="320"
            height="320"
            decoding="async"
            className="relative aspect-square w-full rounded-full border border-blue-500/25 object-cover"
          />
        </div>
      </div>

      <div ref={textRef} className="reveal mt-6 flex flex-col items-center md:mt-8">
        <p className="eyebrow">{PROFILE.role}</p>

        <h1 className="mt-3 text-[2rem] leading-[1.08] font-bold text-white md:mt-4 md:text-6xl">
          {PROFILE.name}
        </h1>

        <p className="gradient-text font-display mt-3 text-lg font-semibold md:text-2xl">
          {PROFILE.tagline}
        </p>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-blue-100/70 md:mt-6 md:text-base">
          {PROFILE.summary}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:mt-8">
          <a
            href={PROFILE.cv}
            download
            className="bg-brand-600 hover:bg-brand-500 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300"
          >
            <i className="ri-download-2-line text-base" aria-hidden="true" />
            Download CV
          </a>

          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 px-5 py-2.5 text-sm font-semibold text-blue-100 transition-colors duration-300 hover:border-blue-400/60 hover:text-white"
          >
            Get in touch
            <i className="ri-arrow-down-line text-base" aria-hidden="true" />
          </a>
        </div>

        <ul className="mt-7 flex items-center justify-center gap-6 md:mt-8">
          {SOCIALS.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 py-1.5 text-sm text-blue-200/65 transition-colors duration-300 hover:text-white"
              >
                <i className={`${s.icon} text-xl`} aria-hidden="true" />
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
