import { PROFILE, SOCIALS } from "../content";

const Footer = () => (
  <footer className="border-t border-blue-500/10 px-5 py-8 md:px-8">
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
      <p className="text-xs text-blue-200/65">
        © {new Date().getFullYear()} {PROFILE.name}
      </p>

      <ul className="flex items-center gap-5">
        {SOCIALS.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="block p-1.5 text-lg text-blue-200/65 transition-colors duration-300 hover:text-white"
            >
              <i className={s.icon} aria-hidden="true" />
            </a>
          </li>
        ))}
        <li>
          <a
            href="#home"
            className="block px-1 py-2.5 text-xs text-blue-200/65 transition-colors duration-300 hover:text-white"
          >
            Back to top
          </a>
        </li>
      </ul>
    </div>
  </footer>
);

export default Footer;
