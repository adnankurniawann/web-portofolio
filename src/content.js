/* Content lives here so the section components stay presentational. */

export const ROLES = ["AI Enthusiast", "ML Enthusiast", "Tech Enthusiast"];

export const FOCUS_AREAS = [
  { icon: "ri-brain-line", label: "Artificial Intelligence" },
  { icon: "ri-bar-chart-box-line", label: "Data Science" },
  { icon: "ri-code-s-slash-line", label: "Front-End Engineering" },
  { icon: "ri-rocket-2-line", label: "Techno-entrepreneurship" },
];

export const STATS = [
  { value: "4+", label: "Roles & internships" },
  { value: "10+", label: "Tools in daily use" },
  { value: "2025", label: "Started at ITB" },
];

export const EXPERIENCE = [
  {
    id: 1,
    role: "Staff of Information Technology",
    org: "15th Grand Summit 2026",
    desc: "Develop and maintain high-performance web applications that support organisational goals and lift user engagement across the event platform.",
    tools: ["TypeScript", "Vite", "ReactJS", "TailwindCSS"],
  },
  {
    id: 2,
    role: "Front End Developer",
    org: "Parade Wisuda April 2026",
    desc: "Design and implement responsive, user-friendly interfaces with modern frameworks to deliver a seamless, high-performance digital experience.",
    tools: ["TypeScript", "Vite", "ReactJS", "TailwindCSS"],
  },
  {
    id: 3,
    role: "Head of Internal Division",
    org: "STEI-K Batch 2025",
    desc: "Oversee organisational stability and synergy by managing internal operations, streamlining workflows, and keeping every member aligned with the mission.",
    tools: [
      "Organizational Development",
      "Effective Communication",
      "Stakeholder Management",
    ],
  },
  {
    id: 4,
    role: "IT Agency Intern",
    org: "TEC ITB",
    desc: "Manage and process historical membership data while building machine learning and AI solutions that optimise operations and support data-driven decisions.",
    tools: ["Python", "SQL", "Google Sheets", "Machine Learning"],
  },
];

export const PROJECTS = [
  {
    id: 1,
    name: "Gacha Makan",
    category: "Web Application",
    icon: "ri-restaurant-2-line",
    desc: "An interactive web app that randomly decides what or where to eat — turning meal choices into something fun and effortless, and cutting decision fatigue.",
    tools: ["React", "Tailwind CSS", "Vite", "TypeScript"],
  },
  {
    id: 2,
    name: "Air Pollution Prediction Model",
    category: "Machine Learning",
    icon: "ri-line-chart-line",
    desc: "Built and tuned an XGBoost model on Kaggle datasets to predict air quality indexes as part of a data science competition.",
    tools: ["Python", "XGBoost", "Data Science", "Kaggle"],
  },
];

export const EDUCATION = [
  {
    icon: "ri-graduation-cap-fill",
    school: "Institut Teknologi Bandung",
    detail: "Informatics Engineering",
    period: "2025 – Present",
  },
  {
    icon: "ri-book-2-fill",
    school: "SMAN 8 Jakarta",
    detail: "Science",
    period: "2022 – 2025",
  },
];

export const SOCIALS = [
  {
    icon: "ri-linkedin-box-fill",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/adnankurniawan/",
  },
  {
    icon: "ri-github-fill",
    label: "GitHub",
    href: "https://github.com/adnankurniawann",
  },
  {
    icon: "ri-instagram-fill",
    label: "Instagram",
    href: "https://www.instagram.com/adnankurniawann/",
  },
];

export const EMAIL = "adnankrniawn@gmail.com";

/* Route table — drives both the navbar and the hash router. */
export const VIEWS = [
  { id: "home", label: "Home", icon: "ri-home-5-line" },
  { id: "about", label: "About", icon: "ri-user-3-line" },
  { id: "experience", label: "Experience", icon: "ri-briefcase-4-line" },
  { id: "projects", label: "Projects", icon: "ri-folder-open-line" },
  { id: "contact", label: "Contact", icon: "ri-mail-send-line" },
];
