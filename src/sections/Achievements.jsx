import { ACHIEVEMENTS } from "../content";
import { useReveal } from "../hooks/useReveal";
import SectionTitle from "../components/SectionTitle";

function Award({ item, delay }) {
  const ref = useReveal({ delay });

  return (
    <li
      ref={ref}
      className="reveal flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
    >
      <p className="text-body">
        <span className="font-medium text-ink">{item.title}</span>
        <span className="text-muted">, {item.org}</span>
        {item.href && (
          <>
            {" "}
            <a
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="text-small text-brand-300 decoration-brand-300/40 whitespace-nowrap underline underline-offset-4 hover:decoration-brand-300"
            >
              certificate
              <span className="sr-only"> for {item.title} (opens in new tab)</span>{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </>
        )}
      </p>
      <p className="text-small text-muted shrink-0 tabular-nums">{item.year}</p>
    </li>
  );
}

export default function Achievements() {
  return (
    <section
      id="achievements"
      aria-labelledby="achievements-title"
      className="column mt-36 md:mt-48"
    >
      <div className="max-w-[35rem]">
        <SectionTitle id="achievements-title" index={3}>
          Achievements
        </SectionTitle>
        <ul className="mt-10 space-y-5">
          {ACHIEVEMENTS.map((a, i) => (
            <Award key={a.id} item={a} delay={i * 80} />
          ))}
        </ul>
      </div>
    </section>
  );
}
