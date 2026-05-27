import { useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "animate.css";
import DataImage from "./data";
import { listTools } from "./data"; 

import ParticlesBackground from "./components/ParticlesBackground";

function App() {
  const projectScrollRef = useRef(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 50,
    });
  }, []);

  const scrollProject = (direction) => {
    if (projectScrollRef.current) {
      const { current } = projectScrollRef;
      const scrollAmount = 400; 
      
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  const experienceList = [
    {
      id: 1,
      nama: "Staff of Information Technology",
      instansi: "15th Grand Summit 2026",
      desk: "As a staff Information Technology professional, I specialize in developing and maintaining high-performance web applications to support organizational goals and enhance user engagement.",
      tools: ["Typescript", "Vite", "ReactJS", "TailwindCSS"],
      dad: "100"
    },
    {
      id: 2,
      nama: "Front End Developer",
      instansi: "Parade Wisuda April 2026",
      desk: "As a Front-End Developer within the IT staff, I design and implement responsive, user-friendly web interfaces using modern frameworks to ensure a seamless and high-performance digital experience.",
      tools: ["Typescript", "Vite", "ReactJS", "TailwindCSS"],
      dad: "200"
    },
    {
      id: 3,
      nama: "Head of Internal Division",
      instansi: "STEI-K Batch 2025",
      desk: "As Head of the Internal Division, I oversee organizational stability and synergy by managing internal operations, streamlining workflows, and fostering a cohesive environment to ensure all members are aligned with the organization's mission.",
      tools: ["Organizational Development", "Effective Communication", "Stakeholder Management"],
      dad: "300"
    },
    {
      id: 4,
      nama: "IT Agency Intern",
      instansi: "TEC ITB",
      desk: "As an IT Agency Intern, I manage and process historical membership data while developing machine learning and artificial intelligence solutions. My focus is to optimize operational efficiency and support data-driven decisions.",
      tools: ["Python", "SQL", "Google Sheets", "Machine Learning"],
      dad: "400"
    }
  ];

  // DATA PROJECT BARU (Gacha Makan & Air Pollution)
  const projectList = [
    {
      id: 1,
      nama: "Gacha Makan",
      desk: "An interactive web application designed to help users randomly decide what or where to eat, making meal choices fun, effortless, and eliminating decision fatigue.",
      tools: ["React", "Tailwind CSS", "Vite", "TypeScript"],
      dad: "100"
    },
    {
      id: 2,
      nama: "Air Pollution Prediction Model",
      desk: "Built and optimized an XGBoost machine learning model using Kaggle datasets to accurately predict air quality indexes as part of a data science competition.",
      tools: ["Python", "XGBoost", "Data Science", "Kaggle"],
      dad: "200"
    }
  ];

  return (
    <>
      <ParticlesBackground />

      <div className="relative z-10">
        
        {/* === HERO SECTION === */}
        <div className="hero grid md:grid-cols-2 items-center pt-24 lg:pt-28 gap-12 max-w-5xl mx-auto grid-cols-1 overflow-hidden px-4" id="beranda">
          
          <div className="animate__animated animate__fadeInLeft flex flex-col items-center md:items-end text-center md:text-right order-2 md:order-1 md:w-fit md:ml-auto">
            <h1 className="text-5xl/tight font-bold mb-6 text-white">
              Hi, I am <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300 font-extrabold mt-2 inline-block tracking-wide">
                Muhammad Adnan Kurniawan
              </span>
            </h1>
            
            <div className="relative inline-block w-max max-w-full mb-6 text-left">
              <span className="invisible text-lg lg:text-xl pr-2 text-left block">
                Informatics Student @ ITB | Tech Enthusiast
              </span>
              <p className="typing-text absolute top-0 left-0 h-full text-lg lg:text-xl text-blue-200 opacity-90 border-r-[6px] border-white whitespace-nowrap overflow-hidden pr-2 text-left">
                Informatics Student @ ITB | Tech Enthusiast
              </p>
            </div>
            
            <div className="flex items-center gap-3 mb-6 bg-blue-950/70 backdrop-blur-md w-fit p-4 rounded-2xl shadow-lg border border-blue-800/50 mx-auto md:mx-0 text-left md:text-right">
              <q className="text-gray-200 text-sm lg:text-base leading-relaxed">
                Dedicated to exploring the synergy between Artificial Intelligence
                and data to build impactful, technology-driven solutions.
              </q>
            </div>
            
            <div className="mt-2 flex flex-wrap items-center justify-center md:justify-end gap-4">
              <a
                href="/CV_Muhammad Adnan Kurniawan.pdf"
                download="CV_Muhammad Adnan Kurniawan.pdf"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300 font-semibold"
              >
                Download CV
              </a>
              <a
                href="https://www.linkedin.com/in/adnankurniawan/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-transparent border border-blue-500 text-blue-400 px-6 py-3 rounded-2xl hover:bg-blue-500/10 hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-300 font-semibold"
              >
                <i className="ri-linkedin-box-fill text-xl"></i>
                Connect with me
              </a>
            </div>
          </div>

          <img
            src={DataImage.HeroImage}
            alt="Hero Image"
            className="w-[260px] sm:w-[300px] lg:w-[380px] aspect-square object-cover mx-auto md:mr-auto animate__animated animate__fadeInRight hover:scale-105 transition-transform duration-500 rounded-3xl shadow-[0_0_30px_rgba(37,99,235,0.3)] border-4 border-blue-400/50 order-1 md:order-2"
            loading="lazy"
          />

        </div>

        {/* === ABOUT SECTION === */}
        <div className="tentang mt-32 py-10" id="tentang">
          <div
            className="xl:w-2/3 lg:w-3/4 w-full mx-auto p-8 bg-blue-950/40 backdrop-blur-lg border border-blue-800/30 rounded-2xl shadow-2xl hover:-translate-y-2 transition-all duration-500 px-4"
            data-aos="fade-up"
          >
            <img
              src={DataImage.HeroImage}
              alt="Image"
              className="w-24 aspect-square object-cover rounded-2xl mx-auto mb-6 sm:hidden border-2 border-blue-400"
              loading="lazy"
            />
            <p className="text-lg/loose mb-4 text-gray-200 text-center sm:text-left">
              I am an Informatics student at the School of Electrical Engineering
              and Informatics (STEI-K) ITB with a deep-seated interest in AI, data
              science, and techno-entrepreneurship. My approach to problem-solving
              is rooted in analytical thinking—I enjoy breaking down complex
              challenges into manageable steps to find efficient solutions.
              Looking ahead, I aim to become a tech professional who transforms
              data into strategic innovation.
            </p>
          </div>

          {/* === TOOLS SECTION === */}
          <div className="tools mt-32 overflow-hidden max-w-6xl mx-auto px-4">
            <h1
              className="text-4xl/snug font-bold mb-4 text-white"
              data-aos="fade-right"
            >
              Tools Used
            </h1>
            <p
              className="w-full text-base/loose text-blue-200 opacity-80"
              data-aos="fade-right"
              data-aos-delay="200"
            >
              Here are some tools that I usually use to create websites, design,
              and process data.
            </p>
            <div className="tools-box mt-14 grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5">
              {listTools.map((tool) => (
                <div
                  className="flex items-center gap-3 p-4 bg-blue-950/40 backdrop-blur-sm border border-blue-800/40 rounded-xl hover:bg-blue-800/60 hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-300 group cursor-pointer"
                  key={tool.id}
                  data-aos="zoom-in"
                  data-aos-delay={tool.dad}
                >
                  <img
                    src={tool.gambar}
                    alt="Tools Image"
                    className="w-14 bg-white/10 p-2 rounded-lg group-hover:bg-white/20 transition-colors"
                  />
                  <div>
                    <h4 className="font-bold text-gray-100">{tool.nama}</h4>
                    <p className="text-sm text-gray-400">{tool.ket}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === EXPERIENCE SECTION === */}
        <div className="proyek mt-32 py-10 overflow-hidden" id="proyek">
          <div className="max-w-7xl mx-auto px-4">
            <h1
              className="text-center text-4xl font-bold mb-2 text-white"
              data-aos="fade-up"
            >
              Experience
            </h1>
            <p
              className="text-base/loose text-center text-blue-200 opacity-80 mb-10"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              My professional journey and organizational roles.
            </p>

            <div 
              className="relative w-full overflow-x-auto pb-10 pt-4 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex gap-8 w-max px-4 md:px-10 relative">
                
                <div className="absolute top-[14px] left-8 right-8 h-1 bg-blue-800/50 rounded-full z-0"></div>

                {experienceList.map((proyek, index) => (
                  <div
                    key={proyek.id || index}
                    className="relative snap-center w-[320px] md:w-[400px] pt-12 flex flex-col"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-950 border-4 border-blue-500 z-10 shadow-[0_0_20px_rgba(59,130,246,0.6)] group-hover:scale-110 transition-transform duration-300"></div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[2px] h-4 bg-blue-500/50 z-0"></div>

                    <div className="p-6 md:p-8 bg-blue-950/40 backdrop-blur-xl rounded-2xl border border-blue-800/40 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(37,99,235,0.2)] transition-all duration-300 flex flex-col h-full flex-grow relative group">
                      <h1 className="text-xl md:text-2xl font-bold text-gray-100 leading-snug">{proyek.nama}</h1>
                      <h2 className="text-sm md:text-base font-bold text-blue-400 mt-1 mb-4 tracking-wide">{proyek.instansi}</h2>
                      <p className="text-sm md:text-base/loose mb-8 text-gray-300 flex-grow text-justify">{proyek.desk}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {proyek.tools && proyek.tools.map((tool, idx) => (
                          <span
                            className="py-1 px-3 text-xs border border-blue-500/30 bg-blue-900/50 text-blue-200 rounded-lg font-medium"
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
            
            <div className="flex justify-center items-center gap-3 mt-4 text-blue-400/60 animate-pulse" data-aos="fade-in" data-aos-delay="500">
              <i className="ri-arrow-left-line"></i>
              <span className="text-sm tracking-widest uppercase font-semibold">Swipe to explore</span>
              <i className="ri-arrow-right-line"></i>
            </div>
          </div>
        </div>

        {/* === PROJECTS SECTION (UPDATED) === */}
        <div className="projects mt-24 py-10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 relative">
            
            {/* Header Project DITENGAHKAN */}
            <div className="text-center mb-10" data-aos="fade-up">
              <h1 className="text-4xl font-bold mb-2 text-white">
                Projects
              </h1>
              <p className="text-base/loose text-blue-200 opacity-80">
                Some of my recent highlighted works and explorations.
              </p>
            </div>

            {/* Container Scroll Project (Menggunakan useRef) */}
            <div 
              ref={projectScrollRef}
              className="relative w-full overflow-x-auto pb-6 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {/* Flex container diatur agar kalau itemnya sedikit (cuma 2), dia tetap rapi */}
              <div className="flex justify-center md:justify-start gap-6 w-max mx-auto md:mx-0 px-4 md:px-0">
                {projectList.map((project) => (
                  <div
                    key={project.id}
                    className="snap-start w-[320px] sm:w-[380px] p-6 md:p-8 bg-blue-950/40 backdrop-blur-xl rounded-2xl border border-blue-800/40 hover:-translate-y-3 hover:shadow-[0_15px_30px_rgba(37,99,235,0.2)] transition-all duration-300 flex flex-col h-full"
                  >
                    {/* Ikon Folder Hiasan */}
                    <div className="w-12 h-12 mb-6 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 text-2xl">
                      <i className="ri-folder-open-fill"></i>
                    </div>

                    <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-100">{project.nama}</h1>
                    <p className="text-sm md:text-base/loose mb-8 text-gray-300 flex-grow">{project.desk}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {project.tools && project.tools.map((tool, idx) => (
                        <span
                          className="py-1 px-3 text-xs border border-blue-500/30 bg-blue-900/50 text-blue-200 rounded-lg font-medium"
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

            {/* Tombol < dan > DIPINDAH KE BAWAH TENGAH */}
            <div className="flex justify-center gap-6 mt-8" data-aos="fade-up" data-aos-delay="300">
              <button 
                onClick={() => scrollProject('left')}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-900/40 border border-blue-500/50 text-blue-300 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <i className="ri-arrow-left-s-line text-2xl"></i>
              </button>
              <button 
                onClick={() => scrollProject('right')}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-900/40 border border-blue-500/50 text-blue-300 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300 shadow-lg backdrop-blur-sm"
              >
                <i className="ri-arrow-right-s-line text-2xl"></i>
              </button>
            </div>

          </div>
        </div>

        {/* === CONTACT SECTION === */}
        <div className="kontak mt-24 sm:p-10 p-0 overflow-hidden" id="kontak">
          <h1
            className="text-4xl mb-2 font-bold text-center text-white"
            data-aos="zoom-in"
          >
            Contact
          </h1>
          <p
            className="text-base/loose text-center mb-10 text-blue-200 opacity-80"
            data-aos="zoom-in"
            data-aos-delay="200"
          >
            Let's connect with me
          </p>
          <form
            action="https://formsubmit.co/adnankrniawn@email.com"
            method="POST"
            className="bg-blue-950/50 backdrop-blur-xl p-8 sm:w-[500px] w-full mx-auto rounded-2xl shadow-2xl border border-blue-800/50 hover:shadow-[0_15px_40px_rgba(37,99,235,0.15)] transition-shadow duration-300"
            autoComplete="off"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm tracking-wide text-gray-200">Full Name</label>
                <input
                  type="text"
                  name="nama"
                  placeholder="Enter your full name..."
                  className="bg-blue-900/30 text-white border border-blue-800/60 p-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder-gray-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-sm tracking-wide text-gray-200">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email..."
                  className="bg-blue-900/30 text-white border border-blue-800/60 p-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all placeholder-gray-500"
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="pesan" className="font-semibold text-sm tracking-wide text-gray-200">Message</label>
                <textarea
                  name="pesan"
                  id="pesan"
                  cols="45"
                  rows="5"
                  placeholder="Message..."
                  className="bg-blue-900/30 text-white border border-blue-800/60 p-3 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all resize-none placeholder-gray-500"
                  required
                ></textarea>
              </div>
              <div className="text-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white p-3 rounded-lg w-full font-bold tracking-wide shadow-lg hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300"
                >
                  Send Message
                </button>
              </div>
            </div>
          </form>
        </div>

      </div>
    </>
  );
}

export default App;