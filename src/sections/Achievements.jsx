import { ACHIEVEMENTS, LEADERSHIP } from "../content";
import { Section, SectionHeading, Card } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

function Item({ icon, title, subtitle, detail, period, desc, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal">
      <Card className="h-full">
        <div className="flex items-start gap-3">
          <i
            className={`${icon} text-brand-400 mt-0.5 shrink-0 text-xl`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            <p className="text-brand-300 mt-1 text-sm">{subtitle}</p>
            {detail && (
              <p className="mt-0.5 text-xs text-blue-200/50">{detail}</p>
            )}
            <p className="mt-0.5 text-xs text-blue-200/55">{period}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-blue-100/70">{desc}</p>
      </Card>
    </li>
  );
}

/**
 * Award and leadership share a section: one entry each, and separate
 * sections for a single card apiece would read as padding.
 */
export default function Achievements() {
  return (
    <Section id="achievements">
      <SectionHeading
        eyebrow="Recognition and responsibility"
        title="Achievements & Leadership"
      />

      <ul className="grid gap-5 md:grid-cols-2">
        {ACHIEVEMENTS.map((a, i) => (
          <Item
            key={a.id}
            icon={a.icon}
            title={a.title}
            subtitle={a.org}
            period={a.period}
            desc={a.desc}
            delay={i * 80}
          />
        ))}

        {LEADERSHIP.map((l, i) => (
          <Item
            key={l.id}
            icon={l.icon}
            title={l.role}
            subtitle={l.org}
            detail={l.orgDetail}
            period={l.period}
            desc={l.desc}
            delay={(ACHIEVEMENTS.length + i) * 80}
          />
        ))}
      </ul>
    </Section>
  );
}
