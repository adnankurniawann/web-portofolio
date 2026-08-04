import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./sections/Home";
import About from "./sections/About";
import Experience from "./sections/Experience";
import Projects from "./sections/Projects";
import Achievements from "./sections/Achievements";
import Skills from "./sections/Skills";
import Contact from "./sections/Contact";

export default function App() {
  // The previous build was a hash router (#/about). Anything already shared
  // with those links would now land on the hero with no explanation, so
  // rewrite them to the matching anchor once on load.
  useEffect(() => {
    const match = window.location.hash.match(/^#\/([\w-]+)$/);
    if (!match) return;

    const target = document.getElementById(match[1]);
    if (target) {
      window.location.replace(`#${match[1]}`);
    } else {
      // Unknown legacy route: drop the hash rather than leave a dead anchor.
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  return (
    <>
      <a
        href="#home"
        className="focus:bg-brand-600 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-full focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <Navbar />

      <main>
        <Home />
        <About />
        <Experience />
        <Projects />
        <Achievements />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </>
  );
}
