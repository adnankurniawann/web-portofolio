import { PROJECTS } from "../content";
import { Section, SectionHeading, Card, Chip } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

function Project({ item, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal">
      <Card interactive className="relative">
        {item.image && (
          <div className="mb-6 overflow-hidden rounded-lg border border-blue-500/15 bg-abyss">
            {/* Intrinsic width/height reserve the box so the card does not
                jump as the screenshot decodes. */}
            <img
              src={item.image}
              alt={item.imageAlt}
              width={item.imageW}
              height={item.imageH}
              loading="lazy"
              decoding="async"
              className="block w-full"
            />
          </div>
        )}

        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-white md:text-lg">
              {item.repo ? (
                // The ::after overlay stretches this one link across the whole
                // card, so the card is clickable without adding two or three
                // duplicate links to the accessibility tree. z-10 is load
                // bearing: the bullet items below are position:relative and
                // come later in the DOM, so at auto z-index they paint over
                // the overlay and swallow clicks on most of the card.
                <a
                  href={item.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="after:rounded-card hover:text-brand-300 after:absolute after:inset-0 after:z-10"
                >
                  {item.name}
                  <i
                    className="ri-github-fill ml-2 align-middle text-base text-blue-200/60"
                    aria-hidden="true"
                  />
                  <span className="sr-only"> — view repository on GitHub</span>
                </a>
              ) : (
                item.name
              )}
            </h3>
            {item.badge && (
              <span className="border-brand-400/30 bg-brand-500/10 text-brand-200 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
                {item.badge}
              </span>
            )}
          </div>
          <span className="text-xs text-blue-200/55 md:text-sm">
            {item.period}
          </span>
        </div>

        <ul className="mt-4 space-y-2">
          {item.points.map((p) => (
            <li
              key={p}
              className="relative pl-4 text-sm leading-relaxed text-blue-100/70"
            >
              <span
                aria-hidden="true"
                className="absolute top-2 left-0 h-1 w-1 rounded-full bg-blue-400/50"
              />
              {p}
            </li>
          ))}
        </ul>

        <ul className="mt-5 flex flex-wrap gap-1.5">
          {item.tools.map((t) => (
            <li key={t}>
              <Chip>{t}</Chip>
            </li>
          ))}
        </ul>
      </Card>
    </li>
  );
}

export default function Projects() {
  return (
    <Section id="projects">
      <SectionHeading
        eyebrow="What I have built"
        title="Projects"
        description="Systems built end to end, from the problem statement through to a working product."
      />

      {/* Stacked rather than a tight grid — each entry carries a screenshot
          and several lines of detail that a narrow column would squeeze
          unreadably. */}
      <ul className="space-y-5">
        {PROJECTS.map((item, i) => (
          <Project key={item.id} item={item} delay={i * 80} />
        ))}
      </ul>
    </Section>
  );
}
