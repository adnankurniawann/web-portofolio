import { EXPERIENCE } from "../content";
import { Section, SectionHeading, Chip } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

/** One entry on the timeline. Own component so each gets its own reveal. */
function Entry({ item, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal relative pb-10 pl-8 last:pb-0 md:pl-10">
      {/* The rail runs through every marker; the last entry stops it short
          so the line does not dangle past the final role. */}
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-0 left-[5px] w-px bg-blue-500/20 md:left-[7px]"
      />
      <span
        aria-hidden="true"
        className="border-brand-400 bg-void absolute top-1.5 left-0 h-3 w-3 rounded-full border-2 md:h-3.5 md:w-3.5"
      />

      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-base font-semibold text-white md:text-lg">
          {item.role}
        </h3>
        <span className="text-xs text-blue-200/55 md:text-sm">
          {item.period}
        </span>
      </div>

      <p className="text-brand-300 mt-1 text-sm">
        {item.org}
        <span className="text-blue-200/45"> · {item.location}</span>
      </p>

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

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {item.tools.map((t) => (
          <li key={t}>
            <Chip>{t}</Chip>
          </li>
        ))}
      </ul>
    </li>
  );
}

export default function Experience() {
  return (
    <Section id="experience">
      <SectionHeading
        eyebrow="Where I have worked"
        title="Experience"
        description="Engineering roles across student organisations and events, from backend and data pipelines to production frontends."
      />

      <ol className="mt-2">
        {EXPERIENCE.map((item, i) => (
          <Entry key={item.id} item={item} delay={i * 80} />
        ))}
      </ol>
    </Section>
  );
}
