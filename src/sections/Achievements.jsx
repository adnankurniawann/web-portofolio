import { ACHIEVEMENTS } from "../content";
import { useReveal } from "../hooks/useReveal";

function Award({ item }) {
  const ref = useReveal();

  return (
    <li
      ref={ref}
      className="reveal flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
    >
      <p className="text-body">
        <span className="font-medium text-white">{item.title}</span>
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
              certificate ↗
            </a>
          </>
        )}
      </p>
      <p className="text-small text-muted shrink-0 tabular-nums">{item.year}</p>
    </li>
  );
}

export default function Achievements() {
  const headRef = useReveal();

  return (
    <section
      id="achievements"
      aria-labelledby="achievements-title"
      className="column mt-36 md:mt-48"
    >
      <div className="max-w-[35rem]">
        <h2
          id="achievements-title"
          ref={headRef}
          className="reveal text-head font-medium tracking-[-0.02em] text-white"
        >
          Achievements
        </h2>
        <ul className="mt-10 space-y-5">
          {ACHIEVEMENTS.map((a) => (
            <Award key={a.id} item={a} />
          ))}
        </ul>
      </div>
    </section>
  );
}
