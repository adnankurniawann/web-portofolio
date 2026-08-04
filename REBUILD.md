# Rencana Rombak Total — adnan-identity

Dokumen kerja untuk membangun ulang portofolio jadi **satu halaman gelap, simpel, minimalis**, dengan isi yang mengikuti CV per Agustus 2026.

---

## 1. Keputusan yang sudah dikunci

| Hal | Keputusan |
| --- | --- |
| Landing page | **Dihapus.** Pengunjung langsung mendarat di hero. |
| Navigasi | **Satu halaman, scroll.** Navbar jadi anchor link + scroll-spy, bukan router. |
| Three.js (roket, astronot, starfield) | **Dicabut total.** Background diganti gradient CSS. |
| Hero | **Teks + foto diri** (`hero-img.webp`). |
| Jumlah bagian | **7** — Home · About · Experience · Projects · Achievements · Skills · Contact |
| Palet warna | **Tetap seperti sekarang** (navy + biru). Token di `@theme` dipertahankan. |
| Sumber isi | `CV_Muhammad_Adnan_Kurniawan.pdf` |

### Kenapa Three.js dicabut

Bukan cuma soal "minimalis". `SceneBackground.jsx` itu 1.859 baris dan menghasilkan chunk **529 kB** (134 kB gzip) — lebih besar dari seluruh sisa aplikasi digabung (222 kB). Setelah landing page hilang, roket dan astronotnya tidak punya tempat lagi, dan yang tersisa cuma starfield yang bisa ditiru dengan beberapa baris CSS.

> **Catatan:** file 3D-nya jangan dihapus permanen sebelum situs baru jadi. Langkah 1 menyimpannya di branch lama supaya masih bisa diambil kalau suatu saat mau dipakai ulang.

---

## 2. Struktur halaman yang dituju

```
┌─ Navbar (fixed, glass, 7 anchor + tombol CV)
│
├─ #home         Hero: nama, peran, ringkasan, 2 tombol, foto
├─ #about        Ringkasan panjang + Education + angka kunci
├─ #experience   3 organisasi / 4 peran, format timeline
├─ #projects     3 proyek (HujanNet, PulihGo, Gacha Makan)
├─ #achievements Juara Garuda Hacks + Leadership STEI-K
├─ #skills       6 kategori skill dari CV
├─ #contact      Email, telepon, lokasi, sosial
│
└─ Footer (ringkas: copyright + link sosial)
```

Semua bagian tinggal di **satu dokumen**. Tidak ada `useState` route, tidak ada `hashchange`, tidak ada remount antar bagian.

---

## 3. Peta file

### Dihapus

| File | Alasan |
| --- | --- |
| `src/components/SceneBackground.jsx` | Three.js dicabut |
| `src/components/Landing.jsx` | Tidak ada landing page lagi |
| `src/components/PreLoader.jsx` | Tanpa WebGL & aset berat, preloader cuma menunda konten |
| `src/data.js` | `listProyek` sudah mati; `listTools` diganti chip teks; import gambar hero pindah ke `content.js` |

### Ditulis ulang

| File | Perubahan |
| --- | --- |
| `src/content.js` | Isi total dari CV (lihat bagian 5) |
| `src/App.jsx` | Dari hash router → satu halaman berisi 7 `<section>` |
| `src/components/Navbar.jsx` | Anchor link + scroll-spy `IntersectionObserver` |
| `src/components/Footer.jsx` | Disederhanakan |
| `src/components/ui.jsx` | Primitif baru: `Section`, `SectionHeading`, `Chip`, `Card` |
| `src/sections/Home.jsx` | Jadi hero (teks + foto) |
| `src/sections/About.jsx` | Ringkasan + Education, tanpa grid logo tools |
| `src/sections/Experience.jsx` | Format timeline, isi dari CV |
| `src/sections/Projects.jsx` | 3 proyek dari CV |
| `src/sections/Contact.jsx` | Disederhanakan |
| `src/index.css` | Buang util yang mati, rapikan token |
| `index.html` | Meta description ikut ringkasan CV baru |

### Baru

- `src/sections/Achievements.jsx`
- `src/sections/Skills.jsx`

### Aset & dependensi

| Item | Aksi |
| --- | --- |
| `public/CV_Muhammad Adnan Kurniawan.pdf` | Ganti dengan CV baru, **ganti nama tanpa spasi** |
| `public/assets/proyek/*` (8 file) | Sudah mati sejak `listProyek` tak dipakai → hapus |
| `public/assets/tools/*` (10 file) | Tidak dipakai lagi kalau skill jadi chip teks → hapus |
| `public/assets/hero-img.webp` | **Dipertahankan** — dipakai hero |
| `three` | Uninstall |
| `@tsparticles/react`, `@tsparticles/slim` | Uninstall — **tidak pernah dipakai sama sekali**, bahkan sebelum rombak ini |

---

## 4. Langkah demi langkah

### Langkah 0 — Amankan yang lama

```bash
git checkout -b rebuild-minimal
```

Repo ini belum di-`git init`. Kalau memang belum, jalankan dulu:

```bash
git init && git add -A && git commit -m "Snapshot sebelum rombak"
```

Tanpa ini, versi lama (termasuk roket 3D-nya) hilang permanen begitu file dihapus.

---

### Langkah 1 — Pasang CV baru

1. Salin `CV_Muhammad_Adnan_Kurniawan.pdf` dari Downloads ke `public/`.
2. Hapus `public/CV_Muhammad Adnan Kurniawan.pdf` yang lama.
3. Nama file final: `CV-Muhammad-Adnan-Kurniawan.pdf` — tanpa spasi, tanpa underscore, supaya URL-nya bersih dan tidak jadi `%20` di address bar.

**Verifikasi:** `ls public/*.pdf` menampilkan tepat satu file.

---

### Langkah 2 — Cabut Three.js dan landing page

```bash
npm uninstall three @tsparticles/react @tsparticles/slim
```

Hapus keempat file di tabel "Dihapus". Lalu kosongkan `App.jsx` jadi kerangka sementara:

```jsx
export default function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <main className="grow">{/* section menyusul */}</main>
    </div>
  );
}
```

Sesuaikan juga `main.jsx` — buang `<PreLoader />` dan `<div className="backdrop-grid" />`.

**Verifikasi:** `npm run build` lolos, dan chunk `SceneBackground` hilang dari output. Ukuran bundle harusnya turun dari ±750 kB jadi di bawah 250 kB.

> Situs akan tampak kosong setelah langkah ini. Itu wajar — dibangun ulang dari Langkah 5.

---

### Langkah 3 — Tulis `content.js` dari CV

Ini sumber kebenaran tunggal untuk seluruh isi situs. Isi lengkapnya ada di **bagian 5** dokumen ini, tinggal salin.

Prinsip: komponen tetap murni presentasional. Kalau nanti ada baris CV yang berubah, cukup edit `content.js`, tidak menyentuh JSX satu pun.

**Verifikasi:** tidak ada lagi `import ... from "../data"` di mana pun.

---

### Langkah 4 — Rapikan `index.css`

1. **Token `@theme` dipertahankan apa adanya** — inilah "warna disesuaikan sama yang sekarang". Kecuali `--color-ember-*` yang tadinya aksen roket; hapus kalau setelah rombak tidak terpakai.
2. Hapus util yang mati bersama landing page: `.cta`, `.cta-ring`, `.cta-fill`, `.cta-glow`, `@property --cta-angle`, `@keyframes cta-sweep`, `.hint-swap`, `.dot-live`, `.landing-enter`, `.landing-leave`, `.view-enter`, `.backdrop-grid`, `.animate-float`, `.animate-text-rotate`, `.animate-pulse-ring`.
3. Sederhanakan `.backdrop-wash` — untuk tampilan minimalis, dua radial gradient sudah cukup, tidak perlu tiga.
4. **Pertahankan** `scroll-padding-top` di `html`. Ini yang bikin anchor tidak tertutup navbar fixed. Nilainya harus ≥ tinggi navbar + jarak amannya.
5. Tambah satu util baru untuk reveal saat scroll:

```css
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s var(--ease-expo),
    transform 0.6s var(--ease-expo);
}
.reveal.is-visible {
  opacity: 1;
  transform: none;
}
```

6. Di blok `prefers-reduced-motion`, pastikan `.reveal` langsung tampil final (`opacity: 1; transform: none`) dan `scroll-behavior: auto`.

**Verifikasi:** `npm run build`, lalu cari sisa nama class yang sudah dihapus dengan `grep -rn "landing-\|cta-\|backdrop-grid" src/`.

---

### Langkah 5 — Primitif UI (`ui.jsx`)

Empat komponen kecil supaya ketujuh bagian tampil konsisten:

```jsx
// Pembungkus tiap bagian: memberi id anchor, jarak vertikal seragam,
// dan scroll-margin supaya judulnya tidak tertutup navbar fixed.
export function Section({ id, children, className = "" }) { ... }

// Eyebrow + judul + garis tipis. Rata kiri (lebih minimalis dari rata tengah).
export function SectionHeading({ eyebrow, title, description }) { ... }

// Label teknologi.
export function Chip({ children }) { ... }

// Kartu bergaris tipis untuk experience/project/achievement.
export function Card({ children, className = "" }) { ... }
```

Aturan desain yang dipegang di seluruh situs:

- **Satu aksen saja** — biru (`brand-400`/`brand-500`). Tidak ada warna kedua.
- **Border tipis, bukan bayangan tebal.** `border-blue-500/15` di atas `bg-surface/40`.
- **Radius konsisten** — pakai `--radius-card`.
- **Hierarki lewat ukuran & opasitas teks**, bukan lewat kotak warna-warni.
- Semua judul bagian rata kiri; hanya hero yang boleh beda.

---

### Langkah 6 — Tulis ketujuh bagian

Urutan pengerjaan: `Home` → `About` → `Experience` → `Projects` → `Achievements` → `Skills` → `Contact`.

Tiap file mengekspor satu komponen tanpa prop, membaca datanya dari `content.js`, dan dibungkus `<Section id="...">`.

| Bagian | Isi | Bentuk |
| --- | --- | --- |
| `#home` | Nama, satu baris peran, ringkasan pendek, tombol *Download CV* + *Get in touch*, foto | 2 kolom di desktop, tumpuk di mobile |
| `#about` | Paragraf `SUMMARY`, kartu Education (ITB, IPK, coursework), 3 angka kunci | Teks kiri + kartu kanan |
| `#experience` | 4 peran di 3 organisasi | Timeline garis vertikal, tiap entri: peran, org, periode, bullet, chip teknologi |
| `#projects` | HujanNet, PulihGo, Gacha Makan | Kartu bertumpuk (bukan grid rapat — isinya panjang) |
| `#achievements` | Juara 1 Garuda Hacks 7.0 + Head of Internal STEI-K | 2 kartu |
| `#skills` | 6 kategori | Daftar per kategori berisi chip |
| `#contact` | Email, telepon, lokasi, LinkedIn, GitHub | Kartu kontak + baris sosial |

**Catatan isi yang perlu diputuskan saat menulis:**

- **PulihGo kemungkinan besar adalah karya juara Garuda Hacks 7.0** (Health Track, 2025 — tahun dan temanya cocok persis). CV tidak menyatakannya eksplisit. Kalau benar, tautkan keduanya: sebut "Garuda Hacks 7.0 winner" sebagai badge di kartu PulihGo. **Konfirmasi dulu sebelum ditulis** — kalau ternyata proyek yang berbeda, ini jadi klaim keliru di situs publik.
- Form kontak lama menembak ke `formsubmit.co`. Untuk minimalis, ganti jadi tombol `mailto:` saja. Form pihak ketiga menambah titik gagal tanpa manfaat jelas di portofolio.
- Angka kunci di About sebaiknya diambil dari fakta CV yang bisa diverifikasi: **IPK 3.69**, **42 staf dipimpin**, **200+ pengguna platform**. Jangan pakai angka karangan seperti "10+ tools" di versi lama.

---

### Langkah 7 — Navbar dengan scroll-spy

Dua hal yang harus benar:

**a) Link berupa anchor sungguhan.**

```jsx
<a href="#experience">Experience</a>
```

Bukan `<button onClick={scrollTo}>`. Anchor asli bisa dibuka di tab baru, di-klik kanan, disalin, dan tetap jalan kalau JS gagal dimuat.

**b) Scroll-spy pakai `IntersectionObserver`, bukan event `scroll`.**

```jsx
useEffect(() => {
  const ids = SECTIONS.map((s) => s.id);
  const els = ids
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const io = new IntersectionObserver(
    (entries) => {
      // Ambil entri paling atas yang sedang terlihat, bukan sekadar
      // entri terakhir yang memicu callback — urutannya tidak dijamin.
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id);
    },
    // Batas atas ditarik ke bawah sejauh tinggi navbar supaya bagian
    // dianggap aktif tepat saat lewat di bawah bar, bukan saat masih tertutup.
    { rootMargin: "-96px 0px -55% 0px", threshold: 0 },
  );

  els.forEach((el) => io.observe(el));
  return () => io.disconnect();
}, []);
```

**Yang mudah terlewat:**

- Bagian terakhir (`#contact`) sering tidak pernah jadi aktif karena tingginya kurang dari sisa viewport. Beri `min-height` yang cukup, atau tambahkan penanganan khusus saat scroll sudah menyentuh dasar halaman.
- Menu mobile harus menutup sendiri setelah anchor diklik.
- Tandai link aktif dengan `aria-current="true"`, bukan cuma beda warna.
- Sertakan **skip link** (`Skip to content`) di paling atas — dengan navbar fixed dan 7 anchor, pengguna keyboard butuh jalan pintas.

---

### Langkah 8 — `App.jsx` final

```jsx
export default function App() {
  return (
    <>
      <a href="#home" className="sr-only focus:not-sr-only ...">Skip to content</a>
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
```

**Tambahkan penanganan tautan lama.** Versi sekarang memakai hash router (`#/home`, `#/about`). Kalau ada yang sudah pernah membagikan tautan itu, sekarang akan mendarat di halaman kosong. Cukup satu efek kecil:

```jsx
useEffect(() => {
  const m = window.location.hash.match(/^#\/(\w+)$/);
  if (m && document.getElementById(m[1])) {
    window.location.replace(`#${m[1]}`);
  }
}, []);
```

---

### Langkah 9 — Meta & aksesibilitas

1. `index.html`: perbarui `<meta name="description">` mengikuti SUMMARY di CV, dan `og:description`. Judul boleh tetap.
2. Hapus komentar `<!-- NOTE: #beranda ... -->` di `index.html` — mengacu ke scroll spy versi lama yang sudah tidak ada.
3. Pastikan hanya ada **satu `<h1>`** di seluruh halaman (di hero). Judul tiap bagian pakai `<h2>`.
4. Foto hero wajib punya `alt` yang bermakna, plus `width`/`height` supaya tidak menggeser layout saat dimuat.
5. Cek kontras teks. `text-blue-200/55` yang dipakai di landing lama itu di bawah ambang WCAG AA untuk teks kecil di atas latar gelap — untuk teks isi, pakai minimal `/70`.
6. Uji navigasi penuh **hanya dengan keyboard**: Tab harus bisa menjangkau semua 7 anchor, tombol CV, dan link kontak, dengan focus ring yang selalu kelihatan.

---

### Langkah 10 — Bersih-bersih aset

Lakukan **setelah** situs baru berjalan, sebagai commit terpisah — supaya kalau ada yang perlu diambil lagi, masih mudah.

```bash
rm -rf public/assets/proyek public/assets/tools
```

Lalu pastikan `public/assets/` tinggal `favicon.ico` dan `hero-img.webp`.

---

### Langkah 11 — Verifikasi

```bash
npm run lint && npm run build
```

Checklist manual:

- [ ] Bundle turun di bawah 250 kB (dari ±750 kB)
- [ ] Tidak ada chunk `SceneBackground` di `dist/`
- [ ] Ketujuh anchor di navbar melompat ke bagian yang benar, judul tidak tertutup navbar
- [ ] Link aktif di navbar berubah sesuai posisi scroll, termasuk saat scroll ke paling bawah
- [ ] Menu mobile menutup setelah diklik
- [ ] Tombol CV mengunduh PDF yang benar
- [ ] Tampilan rapi di 360 px, 768 px, dan 1440 px
- [ ] `prefers-reduced-motion: reduce` mematikan smooth scroll dan animasi reveal
- [ ] Navigasi keyboard penuh, focus ring selalu terlihat
- [ ] Tidak ada error di console
- [ ] Semua isi cocok dengan CV — tidak ada sisa data lama (mis. "Air Pollution Prediction Model", "SMAN 8 Jakarta", "AI Enthusiast")

---

## 5. Isi `content.js` dari CV

Salin apa adanya. Semua angka dan tanggal di bawah ini diambil langsung dari CV.

```js
/* Sumber kebenaran tunggal untuk isi situs. Komponen tetap presentasional. */

export const PROFILE = {
  name: "Muhammad Adnan Kurniawan",
  role: "Informatics Engineering @ ITB",
  tagline: "Software & AI/ML Engineering",
  location: "Bandung, West Java, Indonesia",
  email: "adnankrniawn@gmail.com",
  phone: "+62 813-8528-5012",
  cv: "/CV-Muhammad-Adnan-Kurniawan.pdf",
  summary:
    "Informatics Engineering student at Institut Teknologi Bandung focused on artificial intelligence and software engineering. Experienced in building and shipping full-stack web systems, from database and API design to production frontends, alongside data engineering work. Interested in turning complex data into practical tools that solve real problems. Seeking a Software Engineer or AI/ML Engineer internship.",
};

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
  gpa: "3.69 / 4.00",
  credits: "18 credits completed",
  coursework: [
    "Algorithms and Programming",
    "Discrete Mathematics",
    "Computational Logic",
    "Computer Organization and Architecture",
  ],
};

export const HIGHLIGHTS = [
  { value: "3.69", label: "GPA / 4.00" },
  { value: "42", label: "Staff led at STEI-K" },
  { value: "200+", label: "Users on shipped platform" },
];

export const EXPERIENCE = [
  {
    id: "tec-be",
    role: "Back End Developer",
    org: "Techno Entrepreneur Club (TEC) ITB",
    location: "Remote",
    period: "May 2026 – Jul 2026",
    points: [
      "Built the backend of the TEC Fest competition registration system, finalizing the REST API endpoints for the production web application.",
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
    id: "sxc",
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
    id: "parade",
    role: "Frontend Developer",
    org: "Parade Wisuda ITB April 2026",
    location: "Remote",
    period: "Feb 2026 – Apr 2026",
    points: [
      "Developed the public-facing website for the April 2026 graduation parade, building the landing page, live countdown timer, and FAQ section.",
    ],
    tools: ["React", "TypeScript"],
  },
];

export const PROJECTS = [
  {
    id: "hujannet",
    name: "HujanNet",
    period: "Jul 2026 – Present",
    status: "Active",
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
    period: "2025",
    points: [
      "Built a post-stroke rehabilitation app using smartphone gyroscope sensors to track patient range of motion in real time, removing the need for dedicated medical hardware.",
      "Designed an exercise scoring system and progress dashboard, grounded in Indonesian Ministry of Health stroke prevalence data.",
    ],
    tools: ["React Native", "Firebase", "Gyroscope API"],
  },
  {
    id: "gacha-makan",
    name: "Gacha Makan",
    period: "Apr 2026 – Jun 2026",
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
    title: "1st Place, Health Track",
    org: "Garuda Hacks 7.0",
    period: "2025",
    desc: "",
  },
];

export const LEADERSHIP = [
  {
    id: "stei-k",
    role: "Head of Internal Division",
    org: "STEI-K ITB — Computing Division, School of Electrical Engineering and Informatics",
    period: "Nov 2025 – Jul 2026",
    points: [
      "Led 42 staff across two departments: a 26-person Academic Section delivering educational support and resources, and a 16-person Internal Relations Section running community programs.",
    ],
  },
];

export const SKILLS = [
  { group: "Languages", items: ["Python", "TypeScript", "JavaScript", "C", "SQL"] },
  { group: "Frontend", items: ["React", "Next.js", "Vite", "TailwindCSS", "React Native"] },
  {
    group: "Backend",
    items: ["Node.js", "REST API design", "Authentication", "Payment integration"],
  },
  {
    group: "Data",
    items: ["ETL pipelines", "Data cleaning", "NumPy", "Pandas", "Time-series analysis"],
  },
  {
    group: "Databases & Cloud",
    items: ["PostgreSQL", "Supabase", "Firebase", "Vercel"],
  },
  { group: "Tools", items: ["Git", "GitHub", "Linux", "Figma", "Google Sheets API"] },
];

export const SOCIALS = [
  {
    icon: "ri-linkedin-box-fill",
    label: "LinkedIn",
    href: "https://linkedin.com/in/adnankurniawan",
  },
  {
    icon: "ri-github-fill",
    label: "GitHub",
    href: "https://github.com/adnankurniawann",
  },
];
```

---

## 6. Beda isi CV vs situs sekarang

Situs sekarang **tidak cocok** dengan CV di banyak titik. Yang perlu dibuang:

| Ada di situs sekarang | Status menurut CV |
| --- | --- |
| "Air Pollution Prediction Model" (XGBoost, Kaggle) | Tidak ada di CV |
| "SMAN 8 Jakarta, 2022 – 2025" | Tidak ada di CV |
| Peran "Staff of Information Technology" di Grand Summit | CV menyebut **Full Stack Developer** |
| Peran "IT Agency Intern" di TEC | CV menyebut **Back End Developer** dan **Data Engineer Intern** |
| Instagram di daftar sosial | CV hanya mencantumkan LinkedIn & GitHub |
| Peran diri "AI Enthusiast / ML Enthusiast / Tech Enthusiast" | CV memakai posisi konkret, bukan "enthusiast" |
| Gacha Makan sebagai "React, Tailwind, Vite, TypeScript" | CV: **Next.js, TypeScript, Supabase, PostGIS** |
| `listProyek` di `data.js` | Kode mati, tidak pernah diimpor |

Yang **belum ada** di situs dan harus ditambah: HujanNet, PulihGo, Parade Wisuda ITB, juara Garuda Hacks 7.0, IPK & coursework, dan seluruh bagian Technical Skills.

---

## 7. Hal yang masih perlu kamu putuskan

1. **PulihGo = karya juara Garuda Hacks 7.0?** Kalau iya, keduanya ditautkan. Kalau tidak, dibiarkan terpisah. Jangan diasumsikan — ini tampil di situs publik.
2. **Tanggal di CV.** Beberapa periode terbaca maju dari hari ini (5 Agustus 2026), misalnya TEC Back End Developer "May 2026 – Jul 2026" yang sudah lewat, tapi juga StudentsxCEOs "Feb 2026 – Jul 2026". Ini konsisten, hanya perlu dipastikan tidak ada yang keliru ketik sebelum tayang.
3. **Foto hero.** `hero-img.webp` yang ada sekarang mau dipakai terus, atau mau diganti foto baru yang lebih formal?
4. **Domain di CV** menunjuk ke `porto-adnankurniawan.vercel.app`. Pastikan hasil rombak ini yang tayang di situ.
