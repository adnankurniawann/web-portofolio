import { useCallback, useEffect, useRef, useState, lazy, Suspense } from "react";

import { VIEWS } from "./content";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Landing from "./components/Landing";

import Home from "./sections/Home";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Contact from "./sections/Contact";

// Decorative — keep Three.js off the critical path.
const SceneBackground = lazy(() => import("./components/SceneBackground"));

const SECTIONS = { home: Home, about: About, experience: Experience, projects: Projects, contact: Contact };

const TITLES = {
  landing: "Muhammad Adnan Kurniawan — Informatics @ ITB",
  home: "Home — Muhammad Adnan Kurniawan",
  about: "About — Muhammad Adnan Kurniawan",
  experience: "Experience — Muhammad Adnan Kurniawan",
  projects: "Projects — Muhammad Adnan Kurniawan",
  contact: "Contact — Muhammad Adnan Kurniawan",
};

// Long enough for the scene to spool up, fly its victory loop and clear
// the top of the frame. Keep in sync with the launch timeline in
// SceneBackground — the navigation happens the moment the ship is gone.
const LAUNCH_MS = 2500;

/** Hash is the source of truth so Back/Forward and deep links both work. */
function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return VIEWS.some((v) => v.id === raw) ? raw : "landing";
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [launching, setLaunching] = useState(false);
  // The landing crew is parked and motionless until the visitor shows up.
  // Any sign of presence — a cursor, a tap, a key — starts the orbit.
  const [awake, setAwake] = useState(false);
  const launchTimer = useRef(0);

  // Keep React in sync with the address bar (covers Back/Forward too).
  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.title = TITLES[route] ?? TITLES.landing;
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);

  useEffect(() => () => window.clearTimeout(launchTimer.current), []);

  // Wake on the first sign of a visitor. Touch devices never fire
  // pointermove without a tap, so a short fallback timer makes sure the
  // orbit still plays for them instead of leaving a rocket parked forever.
  useEffect(() => {
    if (awake) return;

    const wake = () => setAwake(true);
    const events = ["pointermove", "pointerdown", "keydown", "wheel"];
    for (const type of events) {
      window.addEventListener(type, wake, { passive: true });
    }

    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const fallback = coarse ? window.setTimeout(wake, 2200) : 0;

    return () => {
      for (const type of events) window.removeEventListener(type, wake);
      window.clearTimeout(fallback);
    };
  }, [awake]);

  const navigate = useCallback((id) => {
    window.location.hash = `#/${id}`;
  }, []);

  const handleEnter = useCallback(() => {
    if (launching) return;

    // Skip the cinematic for anyone who asked for less motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      navigate("home");
      return;
    }

    setLaunching(true);
    launchTimer.current = window.setTimeout(() => {
      setLaunching(false);
      navigate("home");
    }, LAUNCH_MS);
  }, [launching, navigate]);

  const isLanding = route === "landing";
  const phase = launching ? "launching" : isLanding ? "landing" : "app";
  const Section = SECTIONS[route];

  return (
    <>
      <Suspense fallback={null}>
        <SceneBackground phase={phase} awake={awake} />
      </Suspense>

      {isLanding ? (
        <Landing onEnter={handleEnter} leaving={launching} awake={awake} />
      ) : (
        <div className="flex min-h-svh flex-col">
          <Navbar current={route} onNavigate={navigate} />

          {/* key remounts the page so the entrance animation replays */}
          <main key={route} className="view-enter relative z-10 grow">
            <Section onNavigate={navigate} />
          </main>

          <Footer onNavigate={navigate} />
        </div>
      )}
    </>
  );
}
