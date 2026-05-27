import { useEffect, useRef, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "animate.css";
import DataImage from "./data";
import { listTools } from "./data";

import ParticlesBackground from "./components/ParticlesBackground";
import Footer from "./components/Footer";

function App() {
  const projectScrollRef = useRef(null);

  // State untuk animasi kata-kata
  const [currentText, setCurrentText] = useState(0);
  const titles = ["AI Enthusiast", "ML Enthusiast", "Tech Enthusiast"];

  useEffect(() => {
    AOS.init({ duration: 1000, once: true, offset: 50 });

    // Interval ganti kata
    const interval = setInterval(() => {
      setCurrentText((prev) => (prev + 1) % titles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollProject = (direction) => {
    if (projectScrollRef.current) {
      const { current } = projectScrollRef;
      const scrollAmount = 300;
      if (direction === "left")
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      else current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // ... (biarkan experienceList & projectList tetap sama seperti sebelumnya) ...
  const experienceList = [
    {
      id: 1,
      nama: "Staff of Information Technology",
      instansi: "15th Grand Summit 2026",
      desk: "As a staff Information Technology professional, I specialize in developing and maintaining high-performance web applications to support organizational goals and enhance user engagement.",
      tools: ["Typescript", "Vite", "ReactJS", "TailwindCSS"],
      dad: "100",
    },
    {
      id: 2,
      nama: "Front End Developer",
      instansi: "Parade Wisuda April 2026",
      desk: "As a Front-End Developer within the IT staff, I design and implement responsive, user-friendly web interfaces using modern frameworks to ensure a seamless and high-performance digital experience.",
      tools: ["Typescript", "Vite", "ReactJS", "TailwindCSS"],
      dad: "200",
    },
    {
      id: 3,
      nama: "Head of Internal Division",
      instansi: "STEI-K Batch 2025",
      desk: "As Head of the Internal Division, I oversee organizational stability and synergy by managing internal operations, streamlining workflows, and fostering a cohesive environment to ensure all members are aligned with the organization's mission.",
      tools: [
        "Organizational Development",
        "Effective Communication",
        "Stakeholder Management",
      ],
      dad: "300",
    },
    {
      id: 4,
      nama: "IT Agency Intern",
      instansi: "TEC ITB",
      desk: "As an IT Agency Intern, I manage and process historical membership data while developing machine learning and artificial intelligence solutions. My focus is to optimize operational efficiency and support data-driven decisions.",
      tools: ["Python", "SQL", "Google Sheets", "Machine Learning"],
      dad: "400",
    },
  ];

  const projectList = [
    {
      id: 1,
      nama: "Gacha Makan",
      desk: "An interactive web application designed to help users randomly decide what or where to eat, making meal choices fun, effortless, and eliminating decision fatigue.",
      tools: ["React", "Tailwind CSS", "Vite", "TypeScript"],
      dad: "100",
    },
    {
      id: 2,
      nama: "Air Pollution Prediction Model",
      desk: "Built and optimized an XGBoost machine learning model using Kaggle datasets to accurately predict air quality indexes as part of a data science competition.",
      tools: ["Python", "XGBoost", "Data Science", "Kaggle"],
      dad: "200",
    },
  ];

  return (
    <>
      <ParticlesBackground />
      <div className="relative z-10">
        <div
          className="hero grid md:grid-cols-2 items-center pt-28 lg:pt-32 gap-12 max-w-5xl mx-auto grid-cols-1 overflow-hidden px-4 md:px-6"
          id="beranda"
        >
          <div className="animate__animated animate__fadeInLeft flex flex-col items-center md:items-end text-center md:text-right order-2 md:order-1 md:w-fit md:ml-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl/tight font-bold mb-4 md:mb-6 text-white">
              Hi, I am <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-extrabold mt-1 md:mt-2 inline-block tracking-wide">
                Muhammad Adnan Kurniawan
              </span>
            </h1>

            {/* Teks statis */}
            <p className="text-lg md:text-2xl font-semibold text-blue-100 mb-2">
              Informatics Student @ ITB
            </p>

            {/* Teks Animasi Bold */}
            <div className="h-10 mb-8">
              <span className="text-xl md:text-3xl font-extrabold text-blue-400 animate-text-rotate inline-block">
                {titles[currentText]}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-end gap-3 md:gap-4">
              <a
                href="/CV_Muhammad Adnan Kurniawan.pdf"
                className="inline-block bg-blue-600 text-white text-sm md:text-base px-6 py-3 rounded-2xl hover:bg-blue-500 transition-all font-semibold"
              >
                Download CV
              </a>
              <a
                href="https://www.linkedin.com/in/adnankurniawan/"
                className="inline-flex items-center gap-2 bg-transparent border border-blue-500 text-blue-400 px-6 py-3 rounded-2xl hover:bg-blue-500/10 transition-all font-semibold"
              >
                <i className="ri-linkedin-box-fill text-xl"></i> Connect
              </a>
            </div>
          </div>

          <img
            src={DataImage.HeroImage}
            className="w-[200px] sm:w-[260px] md:w-[300px] lg:w-[380px] aspect-square object-cover mx-auto md:mr-auto rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.3)] border-4 border-blue-400/50 order-1 md:order-2"
          />
        </div>

        {/* ... (About, Tools, Experience, Projects, Contact tetap sama) ... */}
        {/* === ABOUT SECTION === */}
        <div className="tentang mt-24 md:mt-32 py-10" id="tentang">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                About Me
              </h1>
            </div>
            <div className="xl:w-2/3 lg:w-3/4 w-full mx-auto p-8 bg-blue-950/40 backdrop-blur-lg border border-blue-800/30 rounded-2xl shadow-2xl">
              <p className="text-center md:text-left text-gray-200">
                I am an Informatics student at ITB passionate about AI, data
                science, and techno-entrepreneurship. I thrive on analyzing
                complex challenges and transforming them into efficient,
                data-driven solutions to drive strategic innovation in the tech
                industry.
              </p>

              {/* === EDUCATION === */}
              <div className="mt-8">
                <h2 className="text-sm font-bold tracking-widest text-blue-400 uppercase mb-4">
                  Education
                </h2>
                <div className="flex flex-col gap-3">
                  {/* ITB */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/30 border border-blue-700/30 hover:border-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                      <i className="ri-graduation-cap-fill text-xl"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">
                        Institut Teknologi Bandung
                      </p>
                      <p className="text-blue-300 text-xs md:text-sm">
                        Informatics Engineering · 2025 – Present
                      </p>
                    </div>
                  </div>

                  {/* SMAN 8 */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-900/30 border border-blue-700/30 hover:border-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400 shrink-0">
                      <i className="ri-book-2-fill text-xl"></i>
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm md:text-base">
                        SMAN 8 Jakarta
                      </p>
                      <p className="text-blue-300 text-xs md:text-sm">
                        Science · 2022 – 2025
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* === EXPERIENCE SECTION === */}
        <div
          className="proyek mt-24 md:mt-32 py-10 overflow-hidden"
          id="experience"
        >
          <div className="max-w-7xl mx-auto px-4">
            <h1
              className="text-center text-3xl md:text-4xl font-bold mb-2 text-white"
              data-aos="fade-up"
            >
              Experience
            </h1>
            <p
              className="text-sm md:text-base/loose text-center text-blue-200 opacity-80 mb-8 md:mb-10"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              My professional journey and organizational roles.
            </p>

            <div
              className="relative w-full overflow-x-auto pb-6 md:pb-10 pt-4 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex gap-6 md:gap-8 w-max px-2 md:px-10 relative">
                <div className="absolute top-[14px] left-6 right-6 md:left-8 md:right-8 h-1 bg-blue-800/50 rounded-full z-0"></div>

                {experienceList.map((proyek, index) => (
                  <div
                    key={proyek.id || index}
                    className="relative snap-center w-[280px] sm:w-[320px] md:w-[400px] pt-10 md:pt-12 flex flex-col"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-950 border-4 border-blue-500 z-10 shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute top-6 md:top-8 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-blue-500/50 z-0"></div>

                    <div className="p-5 md:p-8 bg-blue-950/40 backdrop-blur-xl rounded-2xl border border-blue-800/40 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(37,99,235,0.2)] transition-all duration-300 flex flex-col h-full flex-grow relative group">
                      <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-100 leading-snug">
                        {proyek.nama}
                      </h1>
                      <h2 className="text-xs sm:text-sm md:text-base font-bold text-blue-400 mt-1 mb-3 md:mb-4 tracking-wide">
                        {proyek.instansi}
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base/loose mb-6 md:mb-8 text-gray-300 flex-grow text-justify">
                        {proyek.desk}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {proyek.tools &&
                          proyek.tools.map((tool, idx) => (
                            <span
                              className="py-1 px-2 md:px-3 text-[10px] md:text-xs border border-blue-500/30 bg-blue-900/50 text-blue-200 rounded-lg font-medium"
                              key={idx}
                            >
                              {tool}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex justify-center items-center gap-3 mt-2 md:mt-4 text-blue-400/60 animate-pulse"
              data-aos="fade-in"
              data-aos-delay="500"
            >
              <i className="ri-arrow-left-line text-sm md:text-base"></i>
              <span className="text-xs md:text-sm tracking-widest uppercase font-semibold">
                Swipe to explore
              </span>
              <i className="ri-arrow-right-line text-sm md:text-base"></i>
            </div>
          </div>
        </div>

        {/* === PROJECTS SECTION === */}
        <div
          className="projects mt-24 md:mt-32 py-10 overflow-hidden"
          id="projects"
        >
          <div className="max-w-7xl mx-auto px-4 relative">
            <div className="text-center mb-8 md:mb-10" data-aos="fade-up">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                Projects
              </h1>
              <p className="text-sm md:text-base/loose text-blue-200 opacity-80">
                Some of my recent highlighted works and explorations.
              </p>
            </div>

            <div
              ref={projectScrollRef}
              className="relative w-full overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex justify-start md:justify-center gap-4 md:gap-6 w-max mx-auto md:mx-0 px-4 md:px-0">
                {projectList.map((project) => (
                  <div
                    key={project.id}
                    className="snap-start w-[280px] sm:w-[320px] md:w-[380px] p-5 md:p-8 bg-blue-950/40 backdrop-blur-xl rounded-2xl border border-blue-800/40 hover:-translate-y-3 hover:shadow-[0_15px_30px_rgba(37,99,235,0.2)] transition-all duration-300 flex flex-col h-full"
                  >
                    <div className="w-10 h-10 md:w-12 md:h-12 mb-4 md:mb-6 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 text-xl md:text-2xl">
                      <i className="ri-folder-open-fill"></i>
                    </div>

                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-100">
                      {project.nama}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base/loose mb-6 md:mb-8 text-gray-300 flex-grow text-justify md:text-left">
                      {project.desk}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.tools &&
                        project.tools.map((tool, idx) => (
                          <span
                            className="py-1 px-2 md:px-3 text-[10px] md:text-xs border border-blue-500/30 bg-blue-900/50 text-blue-200 rounded-lg font-medium"
                            key={idx}
                          >
                            {tool}
                          </span>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="flex justify-center gap-4 md:gap-6 mt-6 md:mt-8"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <button
                onClick={() => scrollProject("left")}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-900/40 border border-blue-500/50 text-blue-300 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <i className="ri-arrow-left-s-line text-xl md:text-2xl"></i>
              </button>
              <button
                onClick={() => scrollProject("right")}
                className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-blue-900/40 border border-blue-500/50 text-blue-300 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <i className="ri-arrow-right-s-line text-xl md:text-2xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* === CONTACT SECTION === */}
        <div
          className="kontak mt-24 md:mt-32 sm:p-10 p-4 overflow-hidden"
          id="kontak"
        >
          <h1
            className="text-3xl md:text-4xl mb-2 font-bold text-center text-white"
            data-aos="zoom-in"
          >
            Contact
          </h1>
          <p
            className="text-sm md:text-base/loose text-center mb-8 md:mb-10 text-blue-200 opacity-80"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            Let's connect with me
          </p>
          <form
            action="https://formsubmit.co/adnankrniawn@email.com"
            method="POST"
            className="bg-blue-950/50 backdrop-blur-xl p-6 md:p-8 sm:w-[500px] w-full mx-auto rounded-2xl shadow-2xl border border-blue-800/50 hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)] transition-shadow duration-300"
            autoComplete="off"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-xs md:text-sm tracking-wide text-gray-200">
                  Full Name
                </label>
                <input
                  type="text"
                  name="nama"
                  placeholder="Enter your full name..."
                  className="bg-blue-900/30 text-sm md:text-base text-white border border-blue-800/60 p-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder-gray-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-xs md:text-sm tracking-wide text-gray-200">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email..."
                  className="bg-blue-900/30 text-sm md:text-base text-white border border-blue-800/60 p-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder-gray-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="pesan"
                  className="font-semibold text-xs md:text-sm tracking-wide text-gray-200"
                >
                  Message
                </label>
                <textarea
                  name="pesan"
                  id="pesan"
                  cols="45"
                  rows="5"
                  placeholder="Message..."
                  className="bg-blue-900/30 text-sm md:text-base text-white border border-blue-800/60 p-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all resize-none placeholder-gray-500"
                  required
                ></textarea>
              </div>
              <div className="text-center mt-2 md:mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-sm md:text-base text-white p-3 rounded-lg w-full font-bold tracking-wide shadow-lg hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300"
                >
                  Send Message
                </button>
              </div>
            </div>
          </form>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;
