import { useState } from "react";

import { PROJECTS } from "../content";
import { useReveal } from "../hooks/useReveal";

function Shot({ item, className = "" }) {
  return (
    <img
      src={item.image}
      alt={item.imageAlt}
      width={item.imageW}
      height={item.imageH}
      loading="lazy"
      decoding="async"
      className={`bg-surface aspect-[16/10] w-full rounded-[4px] object-cover object-top ${className}`}
    />
  );
}

function Row({ item, current, onActivate }) {
  const ref = useReveal();

  const body = (
    <>
      <span className="text-body flex items-baseline justify-between gap-6">
        <span className="font-medium text-white">
          {item.name}
          {item.repo && (
            <span
              aria-hidden="true"
              className="text-muted ml-1.5 inline-block transition duration-200 group-hover:translate-x-0.5 group-hover:text-white"
            >
              ↗
            </span>
          )}
        </span>
        <span className="text-small text-muted shrink-0 tabular-nums">
          {item.kind} · {item.year}
        </span>
      </span>
      <span className="text-body mt-1 block text-ink/85">{item.desc}</span>
      {item.result && (
        <span className="text-small text-brand-300 mt-1.5 block font-medium">
          {item.result}
        </span>
      )}
    </>
  );

  const rowClass = `group block py-4 transition-opacity duration-300 ${
    current ? "" : "xl:opacity-55"
  }`;

  return (
    <li
      ref={ref}
      className="reveal border-t border-white/10 last:border-b"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      {item.image && <Shot item={item} className="mt-6 xl:hidden" />}
      {item.repo ? (
        <a href={item.repo} target="_blank" rel="noreferrer" className={rowClass}>
          {body}
        </a>
      ) : (
        <div className={rowClass}>{body}</div>
      )}
    </li>
  );
}

/**
 * A ledger on the left; on xl a sticky preview on the right follows
 * whichever row is hovered or focused. Below xl each screenshot sits
 * inline above its row instead.
 */
export default function Projects() {
  const headRef = useReveal();
  const [activeId, setActiveId] = useState(PROJECTS[0].id);
  const active = PROJECTS.find((p) => p.id === activeId);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="column mt-36 md:mt-48"
    >
      <div className="xl:flex xl:gap-16">
        <div className="max-w-[35rem] xl:w-[35rem] xl:shrink-0">
          <h2
            id="projects-title"
            ref={headRef}
            className="reveal text-head font-medium tracking-[-0.02em] text-white"
          >
            Projects
          </h2>
          <ul className="mt-8">
            {PROJECTS.map((item) => (
              <Row
                key={item.id}
                item={item}
                current={item.id === activeId}
                onActivate={() => setActiveId(item.id)}
              />
            ))}
          </ul>
        </div>

        <div className="hidden xl:block xl:min-w-0 xl:flex-1" aria-hidden="true">
          <div className="sticky top-[20svh] mt-16">
            {active.image ? (
              <Shot item={active} />
            ) : (
              <div className="bg-surface/60 flex aspect-[16/10] w-full items-end rounded-[4px] border border-white/5 p-8">
                <p className="text-head font-medium text-white/80">
                  {active.name}
                  <span className="text-small text-muted mt-2 block font-normal">
                    {active.kind} · {active.year}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
