import { listTools } from "../data";
import { FOCUS_AREAS, EDUCATION } from "../content";
import { PageShell, SectionHeading } from "../components/ui";

export default function About() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Who I Am"
        title="About Me"
        description="A short introduction to what I study, what I care about, and the tools I build with."
      />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="glass rounded-3xl p-7 md:p-9">
          <p className="text-sm leading-relaxed text-blue-100/85 md:text-base md:leading-loose">
            I am an Informatics student at{" "}
            <span className="font-semibold text-white">
              Institut Teknologi Bandung
            </span>
            , passionate about AI, data science, and techno-entrepreneurship. I
            thrive on breaking down complex challenges and turning them into
            efficient, data-driven solutions that push strategic innovation in
            the tech industry.
          </p>

          <div className="mt-8">
            <h3 className="eyebrow mb-4">Focus Areas</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {FOCUS_AREAS.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-3 rounded-xl border border-blue-500/15 bg-blue-500/5 px-4 py-3 transition-colors duration-300 hover:border-blue-400/40 hover:bg-blue-500/10"
                >
                  <i
                    className={`${f.icon} text-lg text-blue-400`}
                    aria-hidden="true"
                  />
                  <span className="text-xs font-medium text-blue-100 md:text-sm">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-7 md:p-9">
          <h3 className="eyebrow mb-5">Education</h3>
          <ol className="relative flex flex-col gap-6">
            <span
              className="absolute top-2 bottom-2 left-[19px] w-px bg-linear-to-b from-blue-500/60 to-transparent"
              aria-hidden="true"
            />
            {EDUCATION.map((e) => (
              <li key={e.school} className="relative flex gap-4">
                <span className="z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-950 text-blue-400">
                  <i className={`${e.icon} text-lg`} aria-hidden="true" />
                </span>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-white md:text-base">
                    {e.school}
                  </p>
                  <p className="mt-0.5 text-xs text-blue-300/80 md:text-sm">
                    {e.detail}
                  </p>
                  <p className="font-display mt-1 text-[11px] tracking-wide text-blue-400/70 md:text-xs">
                    {e.period}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Toolbox lives here now that there is no long scroll to host it. */}
      <div className="mt-10">
        <h3 className="eyebrow mb-5">Tools I Work With</h3>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {listTools.map((tool) => (
            <li
              key={tool.id}
              className="glass card-lift flex items-center gap-3 rounded-2xl p-3"
            >
              <img
                src={tool.gambar}
                alt=""
                width="40"
                height="40"
                loading="lazy"
                decoding="async"
                className="h-10 w-10 shrink-0 rounded-lg bg-white/10 object-contain p-1.5"
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white">
                  {tool.nama}
                </p>
                <p className="truncate text-[11px] text-blue-300/70">
                  {tool.ket}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  );
}
