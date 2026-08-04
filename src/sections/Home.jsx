import HeroImage from "/assets/hero-img.webp";

import { PROFILE, SOCIALS } from "../content";
import { useReveal } from "../hooks/useReveal";

/**
 * The first screen. No landing gate in front of it any more — this is what
 * loads. Deliberately the only oversized block on the page; every section
 * below it is calmer and left-aligned.
 */
export default function Home() {
  const textRef = useReveal();
  const photoRef = useReveal({ delay: 120 });

  return (
    <section
      id="home"
      className="scroll-mt-24 px-5 pt-32 pb-20 md:px-8 md:pt-40 md:pb-28"
    >
      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 md:grid-cols-[1.35fr_1fr] md:gap-16">
        <div ref={textRef} className="reveal">
          <p className="eyebrow mb-4">{PROFILE.role}</p>

          <h1 className="text-4xl leading-[1.05] font-bold text-white md:text-6xl">
            {PROFILE.name}
          </h1>

          <p className="gradient-text font-display mt-4 text-lg font-semibold md:text-2xl">
            {PROFILE.tagline}
          </p>

          <p className="mt-6 max-w-xl text-sm leading-relaxed text-blue-100/70 md:text-base">
            {PROFILE.summary}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
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

          <ul className="mt-8 flex items-center gap-5">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-200/60 transition-colors duration-300 hover:text-white"
                >
                  <i className={`${s.icon} text-xl`} aria-hidden="true" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div ref={photoRef} className="reveal order-first md:order-last">
          <div className="relative mx-auto w-44 md:w-full md:max-w-[17rem]">
            <div
              aria-hidden="true"
              className="bg-brand-500/12 absolute -inset-4 rounded-full blur-3xl"
            />
            {/* Explicit width/height so the circle does not reflow the hero
                text while the image is still loading. */}
            <img
              src={HeroImage}
              alt={`Portrait of ${PROFILE.name}`}
              width="320"
              height="320"
              decoding="async"
              className="relative aspect-square w-full rounded-full border border-blue-500/20 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
