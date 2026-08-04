import { PROJECTS } from "../content";
import { PageShell, SectionHeading, ToolChip } from "../components/ui";

export default function Projects({ onNavigate }) {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Selected Work"
        title="Projects"
        description="Recent builds and explorations across web development and machine learning."
      />

      <ul className="mx-auto grid max-w-4xl gap-5 sm:grid-cols-2 md:gap-6">
        {PROJECTS.map((p) => (
          <li key={p.id}>
            <article className="glass card-lift group flex h-full flex-col rounded-3xl p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-2xl text-blue-400 transition-transform duration-300 group-hover:scale-110">
                  <i className={p.icon} aria-hidden="true" />
                </span>
                <span className="font-display rounded-full border border-blue-500/20 px-3 py-1 text-[10px] font-semibold tracking-wider text-blue-300/80 uppercase">
                  {p.category}
                </span>
              </div>

              <h3 className="mt-6 text-lg font-bold text-white md:text-xl">
                {p.name}
              </h3>
              <p className="mt-3 grow text-xs leading-relaxed text-blue-100/70 md:text-sm md:leading-loose">
                {p.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {p.tools.map((t) => (
                  <ToolChip key={t}>{t}</ToolChip>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-12 text-center">
        <p className="text-sm text-blue-200/60">
          Interested in building something together?
        </p>
        <button
          type="button"
          onClick={() => onNavigate("contact")}
          className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 md:text-base"
        >
          Get in touch
          <i className="ri-arrow-right-line text-lg" aria-hidden="true" />
        </button>
      </div>
    </PageShell>
  );
}
