import { PROJECTS } from "../content";
import { Section, SectionHeading, Card, Chip } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

function Project({ item, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal">
      <Card interactive>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold text-white md:text-lg">
              {item.name}
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

      {/* Stacked rather than a tight grid — each entry carries several lines
          of detail that a narrow card column would squeeze unreadably. */}
      <ul className="space-y-5">
        {PROJECTS.map((item, i) => (
          <Project key={item.id} item={item} delay={i * 80} />
        ))}
      </ul>
    </Section>
  );
}
