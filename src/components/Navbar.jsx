import { useEffect, useState } from "react";

import { SECTIONS, PROFILE } from "../content";

/** Must match `scroll-mt` on the sections and `scroll-padding-top` in CSS. */
const NAV_OFFSET = 96;

/**
 * Anchor navigation with a scroll spy.
 *
 * The links are real <a href="#id"> rather than scroll handlers, so they can
 * be opened in a new tab, copied, and used from the keyboard — and they keep
 * working if the observer below never runs.
 */
const Navbar = ({ ready = true }) => {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [open, setOpen] = useState(false);

  // Close the mobile sheet on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean,
    );
    if (!els.length || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        // Callback order is not guaranteed, so pick the topmost visible
        // section rather than trusting whichever entry fired last.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Top edge pulled down past the bar so a section counts as active the
      // moment it clears the navbar, not while it is still hidden behind it.
      { rootMargin: `-${NAV_OFFSET}px 0px -55% 0px`, threshold: 0 },
    );

    els.forEach((el) => io.observe(el));

    // The last section is shorter than the remaining viewport, so it can
    // never satisfy the observer's bottom margin. Without this it would
    // stay un-highlighted no matter how far you scroll.
    const onScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;
      if (atBottom) setActive(SECTIONS[SECTIONS.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // The bar is centred with auto margins rather than -translate-x-1/2: the
  // entrance animation owns `transform`, and the two would overwrite each
  // other.
  return (
    <header
      className={`nav-enter ${
        ready ? "is-ready" : ""
      } fixed top-3 right-0 left-0 z-50 px-3 md:top-4 md:px-4`}
    >
      <nav
        aria-label="Primary"
        className="glass-strong mx-auto flex max-w-5xl items-center justify-between rounded-full py-2 pr-2 pl-4 md:pl-5"
      >
        <a
          href="#home"
          className="font-display shrink-0 py-2.5 text-sm font-bold tracking-tight text-white transition-colors duration-300 hover:text-blue-200 md:text-base"
        >
          adnan<span className="text-brand-400">.</span>
        </a>

        <ul className="hidden items-center gap-0.5 md:flex">
          {SECTIONS.map((s) => {
            const isActive = active === s.id;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative block rounded-full px-2 py-1.5 text-[13px] font-medium transition-colors duration-300 lg:px-3 ${
                    isActive
                      ? "text-white"
                      : "text-blue-200/60 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-blue-500/15"
                    />
                  )}
                  <span className="relative">{s.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href={PROFILE.cv}
          download
          className="bg-brand-600 hover:bg-brand-500 hidden shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition-colors duration-300 md:inline-block"
        >
          CV
        </a>

        <button
          type="button"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="flex h-11 w-11 items-center justify-center rounded-full text-xl text-blue-200 transition-colors hover:bg-blue-500/15 hover:text-white md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <i aria-hidden="true" className={open ? "ri-close-line" : "ri-menu-3-line"} />
        </button>
      </nav>

      {/* Inset to match the header's px-3: an absolutely positioned child
          resolves left/right against the padding box, so left-0 would let the
          sheet run past the gutter and touch the screen edges. */}
      <div
        id="mobile-nav"
        className={`glass-strong absolute top-full right-3 left-3 mt-2 origin-top overflow-hidden rounded-2xl transition-all duration-300 md:hidden ${
          open
            ? "visible scale-y-100 opacity-100"
            : "invisible scale-y-95 opacity-0"
        }`}
      >
        <ul className="flex flex-col p-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === s.id ? "true" : undefined}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-300 ${
                  active === s.id
                    ? "bg-blue-500/15 text-white"
                    : "text-blue-100/75 hover:bg-blue-500/10 hover:text-white"
                }`}
              >
                {s.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={PROFILE.cv}
              download
              onClick={() => setOpen(false)}
              className="text-brand-300 mt-1 block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-blue-500/10"
            >
              Download CV
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
