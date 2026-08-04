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

const LAUNCH_MS = 1900;

/** Hash is the source of truth so Back/Forward and deep links both work. */
function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, "");
  return VIEWS.some((v) => v.id === raw) ? raw : "landing";
}

export default function App() {
  const [route, setRoute] = useState(parseHash);
  const [launching, setLaunching] = useState(false);
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
        <SceneBackground phase={phase} />
      </Suspense>

      {isLanding ? (
        <Landing onEnter={handleEnter} leaving={launching} />
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
