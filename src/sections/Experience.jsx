import { EXPERIENCE } from "../content";
import { PageShell, SectionHeading, ToolChip } from "../components/ui";

export default function Experience() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Journey"
        title="Experience"
        description="Professional roles and organisational work that shaped how I build and collaborate."
      />

      {/* Vertical timeline — reads top-to-bottom now that each section is
          its own page, so nothing is hidden behind a horizontal swipe. */}
      <ol className="relative mx-auto max-w-3xl">
        <span
          className="absolute top-3 bottom-3 left-[21px] w-px bg-linear-to-b from-blue-500/70 via-blue-500/30 to-transparent md:left-[27px]"
          aria-hidden="true"
        />

        {EXPERIENCE.map((item, i) => (
          <li key={item.id} className="relative flex gap-5 pb-8 last:pb-0 md:gap-7">
            <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-950 text-sm font-bold text-blue-300 shadow-[0_0_18px_rgb(59_130_246/0.35)] md:h-14 md:w-14 md:text-base">
              {String(i + 1).padStart(2, "0")}
            </span>

            <article className="glass card-lift flex-1 rounded-3xl p-5 md:p-7">
              <h3 className="text-base leading-snug font-bold text-white md:text-xl">
                {item.role}
              </h3>
              <p className="mt-1.5 text-sm font-semibold text-blue-400">
                {item.org}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-blue-100/70 md:text-sm md:leading-loose">
                {item.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.tools.map((t) => (
                  <ToolChip key={t}>{t}</ToolChip>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </PageShell>
  );
}
