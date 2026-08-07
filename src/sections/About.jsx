import { PROFILE, EDUCATION, HIGHLIGHTS } from "../content";
import { Section, SectionHeading, Card } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

export default function About() {
  const bodyRef = useReveal();
  const eduRef = useReveal({ delay: 100 });

  return (
    <Section id="about">
      <SectionHeading eyebrow="Who I am" title="About" />

      <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-12">
        <div ref={bodyRef} className="reveal">
          <p className="text-sm leading-relaxed text-blue-100/75 md:text-base">
            {PROFILE.summary}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/75 md:text-base">
            {PROFILE.seeking}
          </p>

          {/* Every figure here traces to a line in the CV — no invented stats. */}
          {/* flex-col-reverse keeps the required <dt> before <dd> in the DOM
              while showing the number above its label. */}
          <dl className="mt-10 grid grid-cols-3 gap-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-[11px] leading-snug text-blue-200/60 md:text-xs">
                  {h.label}
                </dt>
                <dd className="font-display text-2xl font-bold text-white md:text-3xl">
                  {h.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div ref={eduRef} className="reveal">
          <Card>
            <div className="flex items-start gap-3">
              <i
                className="ri-graduation-cap-line text-brand-400 mt-0.5 text-xl"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white">
                  {EDUCATION.school}
                </h3>
                <p className="mt-1 text-xs text-blue-200/60">
                  {EDUCATION.location}
                </p>
              </div>
            </div>

            <p className="mt-4 border-t border-blue-500/10 pt-4 text-sm text-blue-100/80">
              {EDUCATION.degree}
            </p>
            <p className="mt-1 text-xs text-blue-200/55">{EDUCATION.period}</p>
          </Card>
        </div>
      </div>
    </Section>
  );
}
