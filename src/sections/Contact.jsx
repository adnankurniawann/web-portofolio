import { SOCIALS, EMAIL } from "../content";
import { PageShell, SectionHeading } from "../components/ui";

export default function Contact() {
  return (
    <PageShell>
      <SectionHeading
        eyebrow="Get In Touch"
        title="Let's Build Something"
        description="Have a project, an opportunity, or just want to say hello? My inbox is open."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        <div className="glass flex flex-col rounded-3xl p-7 md:p-9">
          <h3 className="text-xl font-bold text-white">
            Prefer something direct?
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-blue-200/70">
            Reach me on any of these — I usually reply within a day.
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="mt-7 flex items-center gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-xl text-blue-400">
              <i className="ri-mail-line" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs text-blue-300/70">Email</span>
              <span className="block truncate text-sm font-semibold text-white">
                {EMAIL}
              </span>
            </span>
          </a>

          <div className="mt-4 grid gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/50"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-xl text-blue-400">
                  <i className={s.icon} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-xs text-blue-300/70">
                    {s.label}
                  </span>
                  <span className="block text-sm font-semibold text-white">
                    @adnankurniawann
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>

        <form
          action={`https://formsubmit.co/${EMAIL}`}
          method="POST"
          autoComplete="on"
          className="glass rounded-3xl p-7 md:p-9"
        >
          <input
            type="hidden"
            name="_subject"
            value="New message from your portfolio"
          />
          <input type="hidden" name="_captcha" value="false" />
          <input
            type="text"
            name="_honey"
            tabIndex="-1"
            autoComplete="off"
            className="hidden"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="nama" className="text-sm font-semibold text-blue-100">
                Full Name
              </label>
              <input
                id="nama"
                type="text"
                name="nama"
                autoComplete="name"
                placeholder="Your name"
                required
                className="rounded-xl border border-blue-500/25 bg-blue-950/40 px-4 py-3.5 text-sm text-white transition-colors placeholder:text-blue-300/35 focus:border-blue-400 focus:outline-none md:text-base"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-semibold text-blue-100">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className="rounded-xl border border-blue-500/25 bg-blue-950/40 px-4 py-3.5 text-sm text-white transition-colors placeholder:text-blue-300/35 focus:border-blue-400 focus:outline-none md:text-base"
              />
              <p className="text-xs text-blue-300/50">
                I will only use this to reply to you.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="pesan" className="text-sm font-semibold text-blue-100">
                Message
              </label>
              <textarea
                id="pesan"
                name="pesan"
                rows="5"
                placeholder="Tell me about your idea, role, or question..."
                required
                className="resize-none rounded-xl border border-blue-500/25 bg-blue-950/40 px-4 py-3.5 text-sm text-white transition-colors placeholder:text-blue-300/35 focus:border-blue-400 focus:outline-none md:text-base"
              />
            </div>

            <button
              type="submit"
              className="group mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500 md:text-base"
            >
              Send Message
              <i
                className="ri-send-plane-fill transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
