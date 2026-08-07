/**
 * Single source of truth for every word on the page — mirrors the CV, so a
 * CV update is a change here and nowhere else. Section components stay
 * purely presentational.
 */

export const PROFILE = {
  name: "Muhammad Adnan Kurniawan",
  role: "Informatics Engineering @ ITB",
  tagline: "Software & AI Engineering",
  location: "Bandung, West Java, Indonesia",
  email: "adnankrniawn@gmail.com",
  phone: "+62 813-8528-5012",
  phoneHref: "+6281385285012",
  cv: "/CV-Muhammad-Adnan-Kurniawan.pdf",
  summary:
    "Informatics Engineering student at Institut Teknologi Bandung focused on artificial intelligence and software engineering. Experienced in building and shipping full-stack web systems, from database and API design to production frontends, alongside data engineering work. Interested in turning complex data into practical tools that solve real problems.",
  seeking: "Seeking a Software Engineer or AI Engineer internship.",
};

/** Drives the navbar, the footer and the scroll spy. Order is page order. */
export const SECTIONS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "achievements", label: "Achievements" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export const EDUCATION = {
  school: "Institut Teknologi Bandung",
  location: "Bandung, Indonesia",
  degree: "Bachelor of Engineering, Informatics Engineering",
  period: "2025 – 2029 (expected)",
};

export const HIGHLIGHTS = [
  { value: "1st", label: "Place at Garuda Hacks 7.0" },
  { value: "35", label: "Staff led at STEI-K" },
  { value: "200+", label: "Users on a shipped platform" },
];

export const EXPERIENCE = [
  {
    id: "tec-backend",
    role: "Back End Developer",
    org: "Techno Entrepreneur Club (TEC) ITB",
    location: "Remote",
    period: "May 2026 – Jul 2026",
    points: [
      "Built the backend of the TEC Festival competition registration system, finalizing the REST API endpoints for the production web application.",
      "Designed the database schema storing participant biodata and registration status, and implemented user authentication so entrants could self-register and manage their own submissions.",
      "Architected QRIS payment integration to present payment details, validate transactions, and persist payment status per participant.",
    ],
    tools: ["REST API", "Authentication", "QRIS", "Database Design"],
  },
  {
    id: "tec-data",
    role: "Data Engineer Intern",
    org: "Techno Entrepreneur Club (TEC) ITB",
    location: "Remote",
    period: "Dec 2025 – Jul 2026",
    points: [
      "Sourced and cleaned raw datasets, standardizing inconsistent records before ingestion.",
      "Built a pipeline delivering cleaned data to the TEC website in real time, replacing manual update steps.",
    ],
    tools: ["Python", "ETL", "Data Cleaning"],
  },
  {
    id: "sxc-summit",
    role: "Full Stack Developer",
    org: "StudentsxCEOs Grand Summit 15th",
    location: "Remote",
    period: "Feb 2026 – Jul 2026",
    points: [
      "Built a registration platform serving 200+ users, implementing dual-track flows for two separate competition categories.",
      "Implemented authentication and persistence on Supabase with Postgres, plus a dual-storage upload pipeline for participant submissions.",
      "Synced registration records to Google Sheets via API, giving the organizing committee live visibility without database access.",
    ],
    tools: ["Next.js", "React", "TypeScript", "Tailwind", "Supabase"],
  },
  {
    id: "parade-wisuda",
    role: "Front End Developer",
    org: "Parade Wisuda ITB April 2026",
    location: "Remote",
    period: "Feb 2026 – Apr 2026",
    points: [
      "Developed the public-facing website for the April 2026 graduation parade, building the landing page, live countdown timer, and FAQ section.",
    ],
    tools: ["React", "TypeScript"],
  },
];

/**
 * `repo` and `image` are both optional — a project without either still
 * renders, it just loses the thumbnail and stops being clickable.
 */
export const PROJECTS = [
  {
    id: "hujannet",
    name: "HujanNet",
    period: "2026 – Present",
    badge: "Active",
    repo: "https://github.com/radityawsgtg/Ujan",
    image: "/assets/proyek/hujannet.webp",
    imageW: 1200,
    imageH: 570,
    imageAlt:
      "HujanNet operations map: reconstructed rainfall over Puncak with microwave links, watershed status and a queue of pending alerts",
    points: [
      "Initiated and built a rainfall estimation system deriving precipitation intensity from microwave backhaul signal attenuation between cellular towers, targeting flood early warning in urban Indonesia.",
      "Processed commercial microwave link data with pycomlink to reconstruct spatial rainfall maps at finer resolution than existing weather radar coverage.",
      "Authored the full technical proposal submitted to BRIN AIDeaNation 2026.",
    ],
    tools: ["Python", "pycomlink", "Time-Series Analysis"],
  },
  {
    id: "pulihgo",
    name: "PulihGo",
    period: "2026",
    badge: "Garuda Hacks 7.0 winner",
    points: [
      "Built a post-stroke rehabilitation app using smartphone gyroscope sensors to track patient range of motion in real time, removing the need for dedicated medical hardware.",
      "Designed an exercise scoring system and progress dashboard, grounded in Indonesian Ministry of Health stroke prevalence data.",
    ],
    tools: ["React Native", "Firebase", "Gyroscope API"],
  },
  {
    id: "gacha-makan",
    name: "Gacha Makan",
    period: "2026",
    repo: "https://github.com/adnankurniawann/gacha-makan",
    image: "/assets/proyek/gacha-makan.webp",
    imageW: 1200,
    imageH: 609,
    imageAlt:
      "Gacha Makan home screen: a single-tap warung picker for Jatinangor with spin and map entry points",
    points: [
      "Built a restaurant discovery app that resolves decision fatigue by surfacing nearby options through a weighted random selection mechanic.",
      "Implemented the recommendation backend on Next.js route handlers, using PostGIS radius queries over Supabase Postgres to rank candidates by proximity.",
    ],
    tools: ["Next.js", "TypeScript", "Supabase", "PostGIS"],
  },
];

export const ACHIEVEMENTS = [
  {
    id: "garuda-hacks",
    icon: "ri-trophy-line",
    title: "1st Place, Health Track",
    org: "Garuda Hacks 7.0 National Hackathon",
    period: "2026",
    desc: "Awarded for PulihGo, the gyroscope-based post-stroke rehabilitation app.",
    href: "/assets/garuda-hacks-certificate.webp",
    linkLabel: "View certificate",
    image: "/assets/garuda-hacks-certificate.webp",
    imageW: 1400,
    imageH: 990,
    imageAlt:
      "Garuda Hacks 7.0 certificate of achievement presented to Muhammad Adnan Kurniawan for creating PulihGo and taking 1st place in the Health Track",
  },
];

export const LEADERSHIP = [
  {
    id: "stei-k",
    icon: "ri-team-line",
    role: "Head of Internal Division",
    org: "STEI-K ITB 2025 Vertera",
    orgDetail: "Computing Division, School of Electrical Engineering and Informatics",
    period: "Nov 2025 – Jul 2026",
    desc: "Led 35 staff across two departments: a 22-person Academic Section delivering educational support and resources, and a 13-person Internal Relations Section running community programs.",
  },
];

export const SKILLS = [
  {
    group: "Languages",
    icon: "ri-code-s-slash-line",
    items: ["Python", "TypeScript", "JavaScript", "C", "SQL"],
  },
  {
    group: "Front End",
    icon: "ri-layout-4-line",
    items: ["React", "Next.js", "Vite", "TailwindCSS", "React Native"],
  },
  {
    group: "Back End",
    icon: "ri-server-line",
    items: [
      "Node.js",
      "REST API design",
      "Authentication",
      "Payment integration",
    ],
  },
  {
    group: "Data",
    icon: "ri-database-2-line",
    items: [
      "ETL pipelines",
      "Data cleaning",
      "NumPy",
      "Pandas",
      "Time-series analysis",
    ],
  },
  {
    group: "Databases & Cloud",
    icon: "ri-cloud-line",
    items: ["PostgreSQL", "Supabase", "Firebase", "Vercel"],
  },
  {
    group: "Tools",
    icon: "ri-tools-line",
    items: ["Git", "GitHub", "Figma", "Google Sheets API"],
  },
];

export const SOCIALS = [
  {
    icon: "ri-linkedin-box-fill",
    label: "LinkedIn",
    handle: "in/adnankurniawan",
    href: "https://linkedin.com/in/adnankurniawan",
  },
  {
    icon: "ri-github-fill",
    label: "GitHub",
    handle: "adnankurniawann",
    href: "https://github.com/adnankurniawann",
  },
];
