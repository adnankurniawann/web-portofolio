import { useEffect, useState } from "react";

import { PROFILE } from "./content";

import PreLoader from "./components/PreLoader";
import Home from "./sections/Home";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Achievements from "./sections/Achievements";

export default function App() {
  // The page mounts after the spinner, so the hero reveal plays in view
  // instead of finishing behind it.
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Older builds linked to #/projects-style routes and to sections that no
  // longer exist. Rewrite the first to a real anchor, drop the second so
  // shared links land cleanly on top.
  useEffect(() => {
    if (loading) return;
    const { hash } = window.location;
    const id = hash.replace(/^#\/?/, "");
    if (!id) return;

    if (!document.getElementById(id)) {
      window.history.replaceState(null, "", window.location.pathname);
    } else if (hash.startsWith("#/")) {
      window.location.replace(`#${id}`);
    } else {
      // The section mounted after the browser tried to jump to it.
      document.getElementById(id).scrollIntoView();
    }
  }, [loading]);

  if (loading) return <PreLoader />;

  return (
    <>
      <main>
        <Home />
        <Experience />
        <Projects />
        <Achievements />
      </main>

      <footer className="column text-small text-muted mt-36 pb-12 md:mt-48">
        <p className="max-w-[35rem]">
          {PROFILE.name} · {PROFILE.location} ·{" "}
          <a className="underline underline-offset-4 hover:text-ink" href="#top">
            Back to top
          </a>
        </p>
      </footer>
    </>
  );
}
