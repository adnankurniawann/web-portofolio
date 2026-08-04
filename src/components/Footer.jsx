import { VIEWS, SOCIALS } from "../content";

const glow = {
  GitHub: "hover:drop-shadow-[0_0_10px_rgb(255_255_255/0.5)]",
  LinkedIn: "hover:drop-shadow-[0_0_10px_rgb(59_130_246/0.8)]",
  Instagram: "hover:drop-shadow-[0_0_10px_rgb(236_72_153/0.8)]",
};

const Footer = ({ onNavigate }) => {
  return (
    <footer className="relative z-10 w-full border-t border-blue-500/20 bg-blue-950/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-8 md:flex-row md:justify-between md:px-8">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="gradient-text font-display text-lg font-bold transition-transform duration-300 hover:scale-105"
        >
          @adnankurniawann
        </button>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-blue-200/80">
            {VIEWS.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(v.id)}
                  className="transition-colors duration-300 hover:text-white"
                >
                  {v.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              title={s.label}
              className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl text-blue-300 transition-all duration-300 hover:-translate-y-1 hover:bg-blue-500/10 hover:text-white ${glow[s.label] ?? ""}`}
            >
              <i className={s.icon} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>

      <div className="w-full border-t border-blue-500/10 py-5 text-center text-xs font-medium tracking-wide text-blue-300/50">
        &copy; {new Date().getFullYear()} Muhammad Adnan Kurniawan. All rights
        reserved.
      </div>
    </footer>
  );
};

export default Footer;
