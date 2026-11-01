import { useState } from "react";

import { PROJECTS } from "../content";
import { useReveal } from "../hooks/useReveal";
import SectionTitle from "../components/SectionTitle";

function Row({ item, current, delay, onActivate }) {
  const ref = useReveal({ delay });

  // Below xl every row stays at full ink; the muted/current split only
  // means something next to the preview it drives.
  const tone = current ? "" : "xl:text-muted";

  const body = (
    <>
      <span className="text-body flex items-baseline justify-between gap-6">
        <span className={`font-medium text-white transition-colors duration-300 ${tone}`}>
          {item.name}
          {item.repo && (
            <span
              aria-hidden="true"
              className="text-muted ml-1.5 inline-block transition duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
            >
              ↗
            </span>
          )}
        </span>
        <span className="text-small text-muted shrink-0 tabular-nums">
          {item.kind} · {item.year}
        </span>
      </span>
      <span className={`text-body text-ink/85 mt-1 block transition-colors duration-300 ${tone}`}>
        {item.desc}
      </span>
      {item.result && (
        <span className={`text-small text-brand-300 mt-1.5 block font-medium transition-colors duration-300 ${tone}`}>
          {item.result}
        </span>
      )}
    </>
  );

  return (
    <li
      ref={ref}
      className="reveal relative border-t border-white/10 last:border-b"
      onMouseEnter={onActivate}
      onFocus={onActivate}
    >
      {/* Blue marker beside the row the preview is showing. */}
      <span
        aria-hidden="true"
        className={`bg-brand-400 absolute top-4 bottom-4 -left-5 hidden w-0.5 origin-top rounded-full transition-transform duration-500 xl:block ${
          current ? "scale-y-100" : "scale-y-0"
        }`}
      />
      {item.image && (
        <img
          src={item.image}
          alt={item.imageAlt}
          width={item.imageW}
          height={item.imageH}
          loading="lazy"
          decoding="async"
          className="bg-surface mt-6 aspect-[16/10] w-full rounded-[4px] object-cover object-top xl:hidden"
        />
      )}
      {item.repo ? (
        <a href={item.repo} target="_blank" rel="noreferrer" className="group block py-4">
          {body}
        </a>
      ) : (
        <div className="py-4">{body}</div>
      )}
    </li>
  );
}

/**
 * A ledger on the left; on xl a sticky preview on the right crossfades to
 * whichever row is hovered or focused. Below xl each screenshot sits
 * inline above its row instead.
 */
export default function Projects() {
  const [activeId, setActiveId] = useState(PROJECTS[0].id);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="column mt-36 md:mt-48"
    >
      <div className="xl:flex xl:gap-16">
        <div className="max-w-[35rem] xl:w-[35rem] xl:shrink-0">
          <SectionTitle id="projects-title" index={2}>
            Projects
          </SectionTitle>
          <ul className="mt-8">
            {PROJECTS.map((item, i) => (
              <Row
                key={item.id}
                item={item}
                current={item.id === activeId}
                delay={i * 80}
                onActivate={() => setActiveId(item.id)}
              />
            ))}
          </ul>
        </div>

        <aside
          className="sticky top-[24svh] hidden flex-1 self-start xl:block"
          aria-hidden="true"
        >
          {/* Every preview is stacked in one cell; only the active one is
              visible, so switching is a crossfade rather than a swap. */}
          <div className="bg-surface/70 relative grid aspect-[16/10] w-full max-w-[34rem] place-items-center overflow-hidden rounded-[4px] border border-white/5">
            {PROJECTS.map((p) => {
              const on = p.id === activeId;
              return p.image ? (
                <img
                  key={p.id}
                  src={p.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 h-full w-full object-cover object-top transition-[opacity,transform] duration-700 ease-out ${
                    on ? "scale-100 opacity-100" : "scale-[1.02] opacity-0"
                  }`}
                />
              ) : (
                <span
                  key={p.id}
                  className={`text-head font-medium tracking-[-0.02em] text-white transition-opacity duration-700 [grid-area:1/1] ${
                    on ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {p.name}
                </span>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
