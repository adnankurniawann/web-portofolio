import { SKILLS } from "../content";
import { Section, SectionHeading, Card, Chip } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

function Group({ group, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal">
      <Card className="h-full">
        <div className="flex items-center gap-2.5">
          <i
            className={`${group.icon} text-brand-400 text-lg`}
            aria-hidden="true"
          />
          <h3 className="text-sm font-semibold tracking-wide text-white">
            {group.group}
          </h3>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5">
          {group.items.map((item) => (
            <li key={item}>
              <Chip>{item}</Chip>
            </li>
          ))}
        </ul>
      </Card>
    </li>
  );
}

export default function Skills() {
  return (
    <Section id="skills">
      <SectionHeading
        eyebrow="What I work with"
        title="Technical Skills"
      />

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {SKILLS.map((g, i) => (
          <Group key={g.group} group={g} delay={i * 60} />
        ))}
      </ul>
    </Section>
  );
}
