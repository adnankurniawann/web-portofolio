import { EXPERIENCE } from "../content";
import { useReveal } from "../hooks/useReveal";
import SectionTitle from "../components/SectionTitle";

function Job({ job, delay }) {
  const ref = useReveal({ delay });

  return (
    <li ref={ref} className="reveal xl:grid xl:grid-cols-2 xl:gap-x-16">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 xl:flex-col xl:items-start xl:justify-start">
        <h3 className="text-body font-medium text-ink">
          {job.role}
          <span className="text-muted">, {job.org}</span>
        </h3>
        <p className="text-small text-muted shrink-0 tabular-nums">
          {job.period}
        </p>
      </div>
      <ul className="text-body mt-2 space-y-3 text-ink/85 xl:mt-0">
        {job.points.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </li>
  );
}

export default function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="column mt-36 md:mt-48"
    >
      <div className="max-w-[35rem] xl:max-w-none">
        <SectionTitle id="experience-title" index={1}>
          Work experience
        </SectionTitle>
        <ol className="mt-10 space-y-9">
          {EXPERIENCE.map((job, i) => (
            <Job key={job.id} job={job} delay={i * 80} />
          ))}
        </ol>
      </div>
    </section>
  );
}
