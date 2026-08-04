import { PROFILE, SOCIALS } from "../content";
import { Section, SectionHeading, Card } from "../components/ui";
import { useReveal } from "../hooks/useReveal";

/**
 * A plain mailto instead of the old third-party form. On a portfolio a
 * hosted form is an extra dependency and an extra way to silently lose a
 * message; the address is the thing people actually want.
 *
 * min-h matters here too: as the last section it has to be tall enough to
 * fill the viewport, or the scroll spy can never mark it active.
 */
export default function Contact() {
  const ref = useReveal();

  const details = [
    {
      icon: "ri-mail-line",
      label: "Email",
      value: PROFILE.email,
      href: `mailto:${PROFILE.email}`,
    },
    {
      icon: "ri-phone-line",
      label: "Phone",
      value: PROFILE.phone,
      href: `tel:${PROFILE.phoneHref}`,
    },
    {
      icon: "ri-map-pin-line",
      label: "Location",
      value: PROFILE.location,
    },
  ];

  return (
    <Section id="contact" className="min-h-[70svh]">
      <SectionHeading
        eyebrow="Get in touch"
        title="Contact"
        description={PROFILE.seeking}
      />

      <div ref={ref} className="reveal">
        <Card>
          <ul className="grid gap-6 sm:grid-cols-3">
            {details.map((d) => (
              <li key={d.label}>
                <div className="flex items-center gap-2 text-blue-200/55">
                  <i className={`${d.icon} text-base`} aria-hidden="true" />
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    {d.label}
                  </span>
                </div>
                {d.href ? (
                  <a
                    href={d.href}
                    className="mt-1.5 block text-sm break-words text-blue-100 transition-colors duration-300 hover:text-white"
                  >
                    {d.value}
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm text-blue-100">{d.value}</p>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-blue-500/10 pt-6">
            <a
              href={`mailto:${PROFILE.email}`}
              className="bg-brand-600 hover:bg-brand-500 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300"
            >
              <i className="ri-send-plane-line text-base" aria-hidden="true" />
              Send an email
            </a>

            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-blue-500/25 px-4 py-2.5 text-sm text-blue-100 transition-colors duration-300 hover:border-blue-400/55 hover:text-white"
              >
                <i className={`${s.icon} text-base`} aria-hidden="true" />
                {s.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </Section>
  );
}
