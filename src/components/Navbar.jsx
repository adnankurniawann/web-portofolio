import { useState, useEffect } from "react";
import { VIEWS } from "../content";

/**
 * Primary navigation. Since sections are pages rather than scroll targets,
 * this bar stays pinned at all times — hiding it would leave no way to move
 * between sections.
 */
const Navbar = ({ current, onNavigate }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile sheet on Escape, and whenever the view changes.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  // Note: every menu entry routes through go(), which closes the sheet —
  // so there is no need to mirror `current` back into state here.
  const go = (id) => {
    setIsMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2">
      <nav
        aria-label="Primary"
        className="glass-strong flex items-center justify-between rounded-full px-4 py-2.5 shadow-[0_8px_32px_-8px_rgb(2_6_23/0.8)] md:px-6"
      >
        <button
          type="button"
          onClick={() => go("home")}
          className="gradient-text font-display text-base font-bold tracking-tight transition-transform duration-300 hover:scale-105 md:text-lg"
        >
          @adnankurniawann
        </button>

        <ul className="hidden items-center gap-1 md:flex">
          {VIEWS.map((v) => {
            const isActive = current === v.id;
            return (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => go(v.id)}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative block rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300 lg:px-4 ${
                    isActive ? "text-white" : "text-blue-200/70 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full border border-blue-400/40 bg-blue-500/15"
                    />
                  )}
                  <span className="relative">{v.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={() => go("contact")}
          className="hidden rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-500 md:inline-block"
        >
          Let's talk
        </button>

        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
          className="flex h-11 w-11 items-center justify-center rounded-full text-2xl text-blue-200 transition-colors hover:bg-blue-500/15 hover:text-white md:hidden"
          onClick={() => setIsMenuOpen((v) => !v)}
        >
          <i
            aria-hidden="true"
            className={isMenuOpen ? "ri-close-line" : "ri-menu-3-line"}
          />
        </button>
      </nav>

      <div
        id="mobile-nav"
        className={`glass-strong absolute top-full right-0 left-0 mt-3 origin-top overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "visible scale-y-100 opacity-100"
            : "invisible scale-y-95 opacity-0"
        }`}
      >
        <ul className="flex flex-col p-2">
          {VIEWS.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => go(v.id)}
                aria-current={current === v.id ? "page" : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-base font-medium transition-all duration-300 ${
                  current === v.id
                    ? "bg-blue-500/15 text-white"
                    : "text-blue-100/80 hover:bg-blue-500/10 hover:text-white"
                }`}
              >
                <i className={`${v.icon} text-lg`} aria-hidden="true" />
                {v.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
