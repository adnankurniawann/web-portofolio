/**
 * Single source of truth for every word on the page — mirrors the CV, so a
 * CV update is a change here and nowhere else. Section components stay
 * purely presentational.
 */

export const PROFILE = {
  name: "Muhammad Adnan Kurniawan",
  lead: "Informatics student at ITB. I build web apps end to end, plus the data and models behind them.",
  location: "Bandung, Indonesia",
  email: "adnankrniawn@gmail.com",
  cv: "/CV-Muhammad-Adnan-Kurniawan.pdf",
  about: [
    "I study Informatics Engineering at Institut Teknologi Bandung, class of 2029. Most of my hours go into full-stack work. I design the schema, write the API, then ship the screens people use. The rest goes into data: cleaning messy records and moving them where someone needs them.",
    "This year I built two registration systems, one taking QRIS payments and one serving 200+ participants. I also wired up a pipeline that keeps a live site fed, and a flood warning system that estimates rainfall from signal loss on cell tower links. I like problems with messy data and a real user waiting on the result.",
    "I'm looking for a Software Engineer or AI Engineer internship.",
  ],
};

export const SOCIALS = [
  { label: "GitHub", href: "https://github.com/adnankurniawann" },
  { label: "LinkedIn", href: "https://linkedin.com/in/adnankurniawan" },
  { label: "Email", href: `mailto:${PROFILE.email}` },
];

export const EXPERIENCE = [
  {
    id: "inkubator-it",
    role: "Associate, Tech Development",
    org: "Inkubator IT, HMIF ITB",
    period: "2026 – now",
    points: [
      "I build web products for the incubator and its clients, from the first requirements meeting to handover.",
    ],
  },
  {
    id: "tec-backend",
    role: "Back End Developer",
    org: "Techno Entrepreneur Club (TEC) ITB",
    period: "May 2026 – Jul 2026",
    points: [
      "Wrote the backend for TEC Festival's competition registration: the REST API, the participant schema, and the login that lets entrants sign up and manage their own submissions.",
      "Added QRIS payments. Participants see the payment details in the app, and the server checks each transaction and records who has paid.",
    ],
  },
  {
    id: "tec-data",
    role: "Data Engineer Intern",
    org: "Techno Entrepreneur Club (TEC) ITB",
    period: "Dec 2025 – Jul 2026",
    points: [
      "Collected raw datasets and fixed the inconsistent records before they went in.",
      "Built a pipeline that pushes the clean data to the TEC website live, so the team stopped updating it by hand.",
    ],
  },
  {
    id: "sxc-summit",
    role: "Full Stack Developer",
    org: "StudentsxCEOs Grand Summit 15th",
    period: "Feb 2026 – Jul 2026",
    points: [
      "Built the registration platform for two competition tracks in Next.js and Supabase. More than 200 participants signed up through it.",
      "Handled auth and Postgres storage on Supabase, and split submission uploads across two storage backends.",
      "Synced every signup to Google Sheets, so the committee could follow registrations without touching the database.",
    ],
  },
  {
    id: "parade-wisuda",
    role: "Front End Developer",
    org: "Parade Wisuda ITB April 2026",
    period: "Feb 2026 – Apr 2026",
    points: [
      "Built the public site for ITB's April 2026 graduation parade in React and TypeScript: the landing page, a live countdown and the FAQ.",
    ],
  },
];

/**
 * `repo`, `image` and `result` are all optional — a project without a repo
 * renders as plain text, one without an image just has no preview.
 */
export const PROJECTS = [
  {
    id: "iitrack",
    name: "IITrack",
    kind: "Fullstack",
    year: "2026",
    desc: "Phase 2 of Inkubator IT's workflow tracker, which replaces manual handoffs between divisions. Two of us built it and took it through UAT in seven weeks.",
  },
  {
    id: "hujannet",
    name: "HujanNet",
    kind: "AI & Data",
    year: "2026",
    desc: "Flood early warning that reads rainfall from signal loss on existing cell tower links. An LSTM trained on real operator data from Italy and Sweden tells rain from signal noise, more than doubling the old threshold rule's score in Italy.",
    result: "3rd place, AIDeaNation 2026 (BRIN)",
    repo: "https://github.com/adnankurniawann/hujan-net",
    image: "/assets/proyek/hujannet.webp",
    imageW: 1200,
    imageH: 570,
    imageAlt:
      "HujanNet operations map: reconstructed rainfall over Puncak with microwave links, watershed status and a queue of pending alerts",
  },
  {
    id: "pulihgo",
    name: "PulihGo",
    kind: "Mobile",
    year: "2026",
    desc: "Stroke rehab app that measures range of motion with your phone's gyroscope and scores each exercise, no medical device needed.",
    result: "1st place, Health Track, Garuda Hacks 7.0",
  },
  {
    id: "gacha-makan",
    name: "Gacha Makan",
    kind: "AI & Fullstack",
    year: "2026",
    desc: "Can't decide where to eat? It picks from places near you. An LLM fills in missing restaurant categories, and a Thompson Sampling bandit cut regret 79% against random in simulation.",
    repo: "https://github.com/adnankurniawann/gacha-makan-ai",
    image: "/assets/proyek/gacha-makan.webp",
    imageW: 1200,
    imageH: 609,
    imageAlt:
      "Gacha Makan home screen: a single-tap warung picker for Jatinangor with spin and map entry points",
  },
];

export const ACHIEVEMENTS = [
  {
    id: "aideanation",
    title: "3rd Place, AIDeaNation 2026",
    org: "National AI Competition by BRIN",
    year: "2026",
  },
  {
    id: "garuda-hacks",
    title: "1st Place, Health Track",
    org: "Garuda Hacks 7.0 National Hackathon",
    year: "2026",
    href: "/assets/garuda-hacks-certificate.webp",
  },
  {
    id: "nymo",
    title: "Bronze Medal, NYMO 2024",
    org: "National Youth Math Olympiad, IYSA",
    year: "2024",
  },
  {
    id: "osagi",
    title: "2nd Place, OSAGI 2024",
    org: "Olimpiade Sains Geografi, Universitas Islam 45 Bekasi",
    year: "2024",
  },
];
