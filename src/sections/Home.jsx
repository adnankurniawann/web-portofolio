import Portrait from "/assets/hero-img.webp";

import { PROFILE, SOCIALS } from "../content";
import { useReveal } from "../hooks/useReveal";

/**
 * Name, one line, the links, then the about prose. On xl the prose moves
 * into a second column beside the lead so the first screen is not one long
 * strip down the left edge.
 */
export default function Home() {
  const photoRef = useReveal();
  const nameRef = useReveal({ delay: 80 });
  const leadRef = useReveal({ delay: 160 });
  const linksRef = useReveal({ delay: 240 });
  const aboutRef = useReveal({ delay: 320 });

  return (
    <header id="top" className="column pt-[16svh] md:pt-[24svh]">
      <div className="max-w-[35rem] xl:grid xl:max-w-none xl:grid-cols-2 xl:grid-rows-[auto_auto_1fr] xl:gap-x-16">
        <div className="xl:col-span-2">
          <img
            ref={photoRef}
            src={Portrait}
            alt={`Portrait of ${PROFILE.name}`}
            width="640"
            height="640"
            decoding="async"
            className="reveal ring-brand-400/40 mb-8 size-20 rounded-full object-cover shadow-[0_0_48px_-6px_rgb(59_130_246/0.55)] ring-1 md:size-24"
          />

          <h1
            ref={nameRef}
            className="reveal text-display font-semibold tracking-[-0.035em] text-white"
          >
            {PROFILE.name}
          </h1>
        </div>

        <p
          ref={leadRef}
          className="reveal text-lead mt-6 font-medium xl:col-start-1 xl:row-start-2 xl:mt-10"
        >
          {PROFILE.lead}
        </p>

        <div
          ref={linksRef}
          className="reveal text-body mt-8 flex flex-wrap items-center gap-x-7 gap-y-4 self-start xl:col-start-1 xl:row-start-3"
        >
          <a
            href={PROFILE.cv}
            download
            className="bg-brand-400 text-void hover:bg-brand-300 rounded-[4px] px-5 py-3 font-medium transition duration-200 hover:-translate-y-0.5"
          >
            Download CV
          </a>
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              className="group decoration-muted underline underline-offset-[6px] transition-colors hover:decoration-brand-400"
            >
              {s.label}
              <span
                aria-hidden="true"
                className="ml-1 inline-block transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              >
                ↗
              </span>
            </a>
          ))}
        </div>

        <div
          ref={aboutRef}
          className="reveal text-body mt-10 space-y-5 text-ink/85 xl:col-start-2 xl:row-span-2 xl:row-start-2"
        >
          {PROFILE.about.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </header>
  );
}
