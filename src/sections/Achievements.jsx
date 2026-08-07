import { ACHIEVEMENTS, LEADERSHIP } from "../content";
import { Section, SectionHeading, Card } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

function Item({ item, title, subtitle, detail, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal">
      <Card className="relative h-full" interactive={!!item.href}>
        {item.image && (
          <div className="mb-6 overflow-hidden rounded-lg border border-blue-500/15">
            {/* Intrinsic size reserves the box so the card does not jump as
                the certificate decodes. */}
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

        <div className="flex items-start gap-3">
          <i
            className={`${item.icon} text-brand-400 mt-0.5 shrink-0 text-xl`}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white">
              {item.href ? (
                // Stretched link, same as the project cards. z-10 matters:
                // without it, later position:relative siblings paint over the
                // overlay and swallow clicks across most of the card.
                <a
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="after:rounded-card hover:text-brand-300 after:absolute after:inset-0 after:z-10"
                >
                  {title}
                  <span className="sr-only"> — {item.linkLabel}</span>
                </a>
              ) : (
                title
              )}
            </h3>
            <p className="text-brand-300 mt-1 text-sm">{subtitle}</p>
            {detail && (
              <p className="mt-0.5 text-xs text-blue-200/50">{detail}</p>
            )}
            <p className="mt-0.5 text-xs text-blue-200/55">{item.period}</p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-blue-100/70">
          {item.desc}
        </p>

        {item.href && (
          <p className="text-brand-300 mt-4 inline-flex items-center gap-1.5 text-xs font-semibold">
            {item.linkLabel}
            <i
              className="ri-arrow-right-up-line text-sm"
              aria-hidden="true"
            />
          </p>
        )}
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
            item={a}
            title={a.title}
            subtitle={a.org}
            delay={i * 80}
          />
        ))}

        {LEADERSHIP.map((l, i) => (
          <Item
            key={l.id}
            item={l}
            title={l.role}
            subtitle={l.org}
            detail={l.orgDetail}
            delay={(ACHIEVEMENTS.length + i) * 80}
          />
        ))}
      </ul>
    </Section>
  );
}
