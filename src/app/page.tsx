import Link from "next/link"
import Image from "next/image"
import {
  Swords,
  BookOpen,
  Camera,
  Gamepad2,
  Skull,
  Boxes,
  Layers,
  ScrollText,
  Trophy,
  Sigma,
  ExternalLink,
  Sparkles,
  FlaskConical,
  FileText,
  Brain,
  Wand2,
  ChevronRight,
  Play,
  Atom,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackgroundFX } from "@/components/background-fx"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { Mascot } from "@/components/lab/mascot"
import { LABS } from "@/lib/lab-catalog"
import { SUBJECTS } from "@/lib/subjects"
import { Reveal, CountUp, Spot, StickyCta } from "@/components/landing-fx"
import { LandingQuizDemo } from "@/components/landing-quiz-demo"
import { NavLinks, NavMenu } from "@/components/nav-menu"

const RINTIS_URL = "https://rintisnalar.vercel.app"

const shimmerStyle = {
  backgroundImage:
    "linear-gradient(110deg, var(--gold) 5%, var(--accent) 38%, var(--gold) 62%, var(--accent-2) 90%)",
  backgroundSize: "220% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  animation: "shimmer 7s linear infinite",
}

const heroStats = [
  { value: 18, label: "Lab interaktif" },
  { value: 14, label: "Mapel + ikon" },
  { value: 4, label: "Mode tutor AI" },
  { value: 10, label: "Tur terpandu" },
]

interface BentoItem {
  icon: typeof Swords
  title: string
  desc: string
  href: string
  span: string
  accent: string
}

const bento: BentoItem[] = [
  {
    icon: Swords,
    title: "Arena Belajar",
    desc: "Chat AI Game Master untuk 14 mapel berikon (Matematika s.d. Informatika), SD–SMA. 4 mode: Solver cepat, Socrates pemandu, Uji-ingatan dulu, dan Ujian Lisan bernilai. Foto soal via Gemini Vision, kanvas coret-coret, keyboard ∑, kalkulator mini.",
    href: "/arena",
    span: "sm:col-span-2",
    accent: "from-teal-400/30 to-cyan-500/10",
  },
  {
    icon: FlaskConical,
    title: "Lab Visual Interaktif",
    desc: "18 simulasi manipulatif + maskot Robo + cerita 3 babak: meriam proyektil, bandul, molekul H₂O, grafik, sel, otak visual, pizza pecahan, katrol seret, pH mixer, rantai makanan, word drop, imbuhan, pasar, peta, timeline, Garuda heraldik, magnet, sorting.",
    href: "/lab",
    span: "sm:col-span-2",
    accent: "from-violet-400/25 to-fuchsia-500/10",
  },
  {
    icon: FileText,
    title: "Materi + Podcast",
    desc: "Upload PDF (10MB, parse asli) → ringkasan AI → kartu/kuis grounded + podcast audio gratis.",
    href: "/materi",
    span: "",
    accent: "from-amber-400/25 to-orange-500/10",
  },
  {
    icon: Wand2,
    title: "Mini-app AI + Template",
    desc: "Ketik topik apa pun → AI meracik widget interaktif sandbox. Gagal? 3 template offline siap pakai.",
    href: "/lab",
    span: "",
    accent: "from-fuchsia-400/25 to-pink-500/10",
  },
  {
    icon: Skull,
    title: "Boss Battle + Ujian",
    desc: "Boss 5 soal, Ujian UTBK 10 soal, True/False + analisis knowledge gaps + Share paket.",
    href: "/kuis",
    span: "",
    accent: "from-red-400/25 to-orange-500/10",
  },
  {
    icon: Boxes,
    title: "AR Lab",
    desc: "7 model 3D + hotspot + kuis + mode AR, terhubung ke simulasi Lab.",
    href: "/ar",
    span: "",
    accent: "from-sky-400/25 to-blue-500/10",
  },
  {
    icon: Layers,
    title: "Kartu Mantra SRS",
    desc: "Duel flashcard + spaced repetition: kartu sulit muncul lebih dulu.",
    href: "/kartu",
    span: "",
    accent: "from-emerald-400/25 to-teal-500/10",
  },
  {
    icon: Brain,
    title: "Brain Games Visual",
    desc: "Stroop + kombo, reflek tap + rekor, pola grid + grade S/A/B.",
    href: "/otak",
    span: "",
    accent: "from-violet-400/25 to-purple-500/10",
  },
  {
    icon: ScrollText,
    title: "Dashboard + Buku Mantra",
    desc: "Streak, knowledge gaps, rencana 7 hari + riwayat pembahasan + Smart Text.",
    href: "/dashboard",
    span: "",
    accent: "from-teal-400/25 to-cyan-500/10",
  },
  {
    icon: Sigma,
    title: "Math Tools + LaTeX",
    desc: "Keyboard ∑π√∫, kalkulator mini, rumus KaTeX rapi.",
    href: "/arena",
    span: "",
    accent: "from-cyan-400/25 to-sky-500/10",
  },
  {
    icon: Trophy,
    title: "Streak + Leaderboard",
    desc: "Daily streak, XP & level, hemat-efek, papan peringkat.",
    href: "/leaderboard",
    span: "",
    accent: "from-yellow-400/25 to-amber-500/10",
  },
]

const jalur = [
  {
    icon: Swords,
    title: "Jalur Arena",
    href: "/arena",
    steps: ["Pilih 1 dari 14 mapel + jenjang", "Ketik, foto, atau coret soal", "Terima skenario game + pembahasan"],
  },
  {
    icon: FlaskConical,
    title: "Jalur Lab",
    href: "/lab",
    steps: ["Pilih 1 dari 18 simulasi", "Geser variabel, ikuti Robo", "Tuntaskan misi + kumpulkan XP"],
  },
  {
    icon: FileText,
    title: "Jalur Materi",
    href: "/materi",
    steps: ["Upload PDF / tempel teks", "Ringkas + putar podcast", "Jadi kartu / kuis grounded"],
  },
]

const bukti = [
  {
    group: "Masalahnya nyata",
    value: "18 dari 100",
    title: "Siswa mencapai level minimum matematika",
    desc: "PISA 2022: hanya 18% siswa Indonesia mencapai kecakapan minimum matematika (OECD: 69%).",
    sources: [
      {
        name: "OECD PISA 2022 Indonesia",
        url: "https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/indonesia_c2e1ae0e-en.html",
      },
    ],
  },
  {
    group: "Peluangnya di depan mata",
    value: "185 juta+",
    title: "Gamer di Indonesia",
      desc: "Salah satu pasar game terbesar Asia Tenggara. Anak-anak sudah hidup di dunia game.",
    sources: [
      {
        name: "TribunNews, Jan 2025",
        url: "https://www.tribunnews.com/techno/2025/01/23/jumlah-gamers-indonesia-kini-tembus-185-juta-orang",
      },
    ],
  },
  {
    group: "Buktinya menumpuk",
    value: "Efek besar",
    title: "Gamifikasi meningkatkan hasil belajar",
    desc: "Meta-analisis 41 studi: efek besar (g=0,822). Makanya tiap fitur berlapis: narasi, kombo, XP.",
    sources: [
      {
        name: "Frontiers in Psychology 2023",
        url: "https://doi.org/10.3389/fpsyg.2023.1253549",
      },
    ],
  },
]

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--background)]">
      <BackgroundFX />

      {/* Navbar */}
      <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--background)]/70 backdrop-blur-md">
        <div className="relative mx-auto flex w-full max-w-5xl items-center gap-2 px-4 py-2.5">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="GAMIFIKATHINK" width={28} height={28} className="glow-drop-cyan h-7 w-7" />
            <span className="glow-text-cyan font-sans text-xs font-bold tracking-wide text-[var(--text-primary)]">
              GAMIFIKATHINK
            </span>
            <span className="hidden rounded-full border border-teal-400/30 bg-teal-400/10 px-2 py-0.5 font-mono text-[10px] text-teal-300 min-[400px]:inline-block">
              v2.0 • 18 lab
            </span>
          </Link>
          <NavLinks desktop />
          <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--text-secondary)] md:inline-flex">
            <span className="fx-blink h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI siap
          </span>
          <Link href="/arena" className="ml-2 hidden sm:block">
            <Button size="sm" className="bg-gradient-jarvis btn-brutal h-8 rounded-lg px-3.5 text-xs font-medium text-white glow-cyan hover:brightness-110">
              Main
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
          <NavMenu />
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 pb-16">
        {/* HERO split */}
        <section className="grid w-full items-center gap-8 pt-10 sm:pt-14 lg:grid-cols-[1.1fr_.9fr]">
          <div className="text-center lg:text-left">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)]">
              Platform belajar gamifikasi, v2.0
            </p>
            <h1 className="animate-rise-in mt-3 font-sans font-bold leading-[0.95] tracking-tight text-[var(--text-primary)]">
              <span className="block text-4xl sm:text-5xl lg:text-6xl">Belajar Jadi</span>
              <span className="font-display block font-normal italic leading-[1.02] text-[clamp(3.5rem,10vw,7rem)]">
                <span className="text-gradient" style={shimmerStyle}>
                  Game Epik
                </span>
                <svg viewBox="0 0 320 14" aria-hidden="true" className="fx-draw -mt-1 h-3 w-3/4 max-w-75 sm:w-2/3 lg:mx-0 mx-auto lg:ml-1">
                  <path d="M4 10 Q 80 3 160 8 T 316 6" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base lg:mx-0">
              14 mapel berikon jadi skenario ala Mobile Legends & Roblox. 18 lab
              visual dengan maskot Robo: dari meriam proyektil hingga Garuda
              heraldik. Upload PDF jadi podcast, duel boss, AR 3D, streak XP.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap lg:justify-start sm:justify-center">
              <Link href="/arena">
                <Button className="bg-gradient-jarvis press h-11 rounded-xl px-6 text-sm font-medium text-white glow-cyan transition-all hover:brightness-110">
                  <Play className="mr-2 h-4 w-4" />
                  Masuk ke Arena
                </Button>
              </Link>
              <Link href="/lab">
                <Button variant="outline" className="h-11 rounded-xl px-6 text-sm font-medium">
                  <Atom className="mr-2 h-4 w-4" />
                  Jelajahi 18 Lab
                </Button>
              </Link>
              <PwaInstallButton variant="primary" />
            </div>
            <dl className="mx-auto mt-7 grid max-w-md grid-cols-4 gap-2 lg:mx-0">
              {heroStats.map((s) => (
                <div key={s.label} className="glass rounded-xl px-2 py-2.5 text-center">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-display text-2xl text-[var(--accent)]">
                    <CountUp to={s.value} />
                  </dd>
                  <dd className="mt-0.5 text-[10px] leading-tight text-[var(--text-muted)]">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Panggung Robo */}
          <div className="relative mx-auto w-full max-w-sm">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,.16),transparent_65%)]" />
            <div className="glass relative overflow-hidden rounded-3xl rounded-tr-md p-5">
              <div className="mb-3 flex items-center gap-1.5 border-b border-[var(--border)] pb-2.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                <span className="ml-2 font-mono text-[10px] text-[var(--text-muted)]">robo@lab:~</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="relative h-28 w-28 shrink-0">
                  <div className="orbit-cw pointer-events-none absolute inset-0" aria-hidden="true">
                    {SUBJECTS.slice(0, 8).map((s, i) => {
                      const a = i * 45
                      return (
                        <span key={s.value} className="orbit-item" style={{ transform: `rotate(${a}deg) translate(40px) rotate(${-a}deg)` }}>
                          <span>
                            <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                          </span>
                        </span>
                      )
                    })}
                  </div>
                  <div className="orbit-ccw pointer-events-none absolute inset-0" aria-hidden="true">
                    {SUBJECTS.slice(8, 13).map((s, i) => {
                      const a = i * 72
                      return (
                        <span key={s.value} className="orbit-item" style={{ transform: `rotate(${a}deg) translate(24px) rotate(${-a}deg)` }}>
                          <span>
                            <s.icon className="h-3 w-3" style={{ color: s.color }} />
                          </span>
                        </span>
                      )
                    })}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Mascot mood="wow" size={52} />
                  </div>
                </div>
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface-2)] px-3.5 py-2.5 text-left text-xs leading-relaxed text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">Halo, aku Robo! </span>
                  Aku memandu 18 lab, dari menembak meriam sampai membedah
                  Garuda. Pilih lab favoritmu di bawah!
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {LABS.slice(0, 6).map((l, i) => (
                  <Link
                    key={l.slug}
                    href={`/lab/${l.slug}`}
                    className={`fx-float flex flex-col items-center gap-1 rounded-xl border border-[var(--border)] bg-black/20 px-1 py-2.5 text-center transition-colors hover:border-teal-400/40`}
                    style={{ animationDelay: `${i * 0.35}s` }}
                  >
                    <l.icon className="h-4 w-4 text-teal-300" />
                    <span className="text-[10px] font-medium leading-tight text-[var(--text-secondary)]">{l.title}</span>
                  </Link>
                ))}
              </div>
              <Link
                href="/lab"
                className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-[var(--accent)] hover:brightness-110"
              >
                + 12 lab lainnya <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <LandingQuizDemo />
            <a
              href={RINTIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
            >
              <BookOpen className="h-3.5 w-3.5 text-[var(--accent)]" />
              Powered by RINTIS NALAR Learning Center
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </section>

        {/* MARQUEE 18 lab */}
        <Reveal className="mt-10 w-full sm:mt-12">
        <section aria-label="Daftar lab">
          <div className="lab-marquee group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 py-2.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="lab-marquee-track flex w-max items-center gap-2 pr-2">
              {[...LABS, ...LABS].map((l, i) => (
                <Link
                  key={`${l.slug}-${i}`}
                  href={`/lab/${l.slug}`}
                  aria-hidden={i >= LABS.length}
                  tabIndex={i >= LABS.length ? -1 : undefined}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-black/20 px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-teal-400/50 hover:text-teal-200"
                >
                  <l.icon className="h-3.5 w-3.5 text-teal-300" />
                  {l.title}
                </Link>
              ))}
            </div>
          </div>
        </section>
        </Reveal>

        {/* MARQUEE 14 mapel (arah balik) */}
        <Reveal className="mt-3 w-full">
        <section aria-label="Daftar mapel">
          <div className="lab-marquee lab-marquee-rev group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 py-2.5 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
            <div className="lab-marquee-track flex w-max items-center gap-2 pr-2">
              {[...SUBJECTS, ...SUBJECTS].map((s, i) => (
                <Link
                  key={`${s.value}-${i}`}
                  href="/arena"
                  aria-hidden={i >= SUBJECTS.length}
                  tabIndex={i >= SUBJECTS.length ? -1 : undefined}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] bg-black/20 px-3 py-1.5 text-xs text-[var(--text-secondary)] transition-colors hover:border-teal-400/50 hover:text-teal-200"
                >
                  <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
        </Reveal>

        {/* BENTO fitur */}
        <Reveal className="mt-10 w-full sm:mt-14">
        <section>
          <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            <span className="h-px w-8 bg-teal-400/40" /> 01: Senjata <span className="h-px w-8 bg-teal-400/40" />
          </p>
          <h2 className="relative mt-2 text-center font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            <span aria-hidden="true" className="ghost-num">01</span>
            Semua senjata <span className="font-display text-gradient text-2xl italic sm:text-3xl">belajarmu</span>
          </h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            18 lab, 14 mapel, 1 progres. Klik kartu untuk langsung masuk.
          </p>
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-4">
            {bento.map((f, bi) => (
              <Spot key={f.title} className={`glass group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/40 hover:shadow-[0_8px_32px_rgba(45,212,191,.15)] ${f.span} ${bi % 3 === 1 ? "rounded-tr-md" : ""}`}>
              <Link
                href={f.href}
                className="block"
              >
                <div className={`pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl opacity-60 transition-opacity group-hover:opacity-100 ${f.accent}`} />
                <div className="relative">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br opacity-90 transition-transform group-hover:scale-110 ${f.accent}`}>
                    <f.icon className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)]">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                    {f.desc}
                  </p>
                </div>
              </Link>
              </Spot>
            ))}
          </div>
        </section>
        </Reveal>

        {/* 3 JALUR */}
        <Reveal className="mt-10 w-full sm:mt-14">
        <section>
          <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            <span className="h-px w-8 bg-teal-400/40" /> 02: Jalur <span className="h-px w-8 bg-teal-400/40" />
          </p>
          <h2 className="relative mt-2 text-center font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            <span aria-hidden="true" className="ghost-num">02</span>
            Mulai lewat <span className="font-display text-gradient text-2xl italic sm:text-3xl">3 jalur</span>
          </h2>
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {jalur.map((j, i) => (
              <Link
                key={j.title}
                href={j.href}
                className="glass group rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-teal-400/40"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
                    <j.icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{j.title}</h3>
                  <span className="ml-auto font-mono text-xs text-[var(--text-muted)]">0{i + 1}</span>
                </div>
                <ol className="mt-3 space-y-1.5">
                  {j.steps.map((s, k) => (
                    <li key={s} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-teal-400/15 font-mono text-[10px] text-teal-300">
                        {k + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                  Mulai <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>
        </Reveal>

        {/* BUKTI ringkas */}
        <Reveal className="mt-10 w-full sm:mt-14">
        <section>
          <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            <span className="h-px w-8 bg-teal-400/40" /> 03: Bukti <span className="h-px w-8 bg-teal-400/40" />
          </p>
          <h2 className="relative mt-2 text-center font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            <span aria-hidden="true" className="ghost-num">03</span>
            Kenapa{" "}
            <span className="font-display text-gradient text-2xl italic sm:text-3xl">
              GAMIFIKATHINK?
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm leading-relaxed text-[var(--text-secondary)]">
            Krisis belajar itu nyata dan terukur. Kabar baiknya: anak-anak sudah
            hidup di dunia game. Belajar menyusul ke sana.
          </p>
          <div className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
            {bukti.map((s, i) => (
              <div key={s.title} className={`glass relative overflow-hidden rounded-2xl p-4 ${i === 1 ? "rounded-tr-md" : ""}`}>
                <span aria-hidden="true" className="font-display pointer-events-none absolute -top-2 right-2 select-none text-6xl italic text-teal-400/15">
                  &ldquo;
                </span>
                <p className="text-[11px] font-semibold text-[var(--accent)]">
                  {s.group}
                </p>
                <p className="font-display mt-1 text-3xl text-[var(--text-primary)]">
                  {s.value}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
                  {s.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                  {s.desc}
                </p>
                {s.sources.map((src) => (
                  <a
                    key={src.url}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    Sumber: {src.name}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </section>
        </Reveal>

        {/* FAQ */}
        <Reveal className="mt-10 w-full sm:mt-14">
        <section className="mx-auto max-w-2xl">
          <p className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--text-muted)]">
            <span className="h-px w-8 bg-teal-400/40" /> 04: Tanya <span className="h-px w-8 bg-teal-400/40" />
          </p>
          <h2 className="relative mt-2 text-center font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            <span aria-hidden="true" className="ghost-num">04</span>
            Sering <span className="font-display text-gradient text-2xl italic sm:text-3xl">ditanyakan</span>
          </h2>
          <div className="mt-5 space-y-2">
            {[
              { q: "Apakah gratis?", a: "Ya. Semua arena, lab, dan podcast bisa dimainkan gratis langsung dari browser, tanpa instal." },
              { q: "Perlu login / daftar?", a: "Tidak wajib. Kamu bisa langsung main sebagai Warrior. Login hanya dibutuhkan agar XP, streak, dan riwayat tersimpan antar perangkat." },
              { q: "Bisa offline?", a: "Halaman yang pernah dibuka tersimpan sebagai PWA. AI chat, kuis AI, dan widget AI tetap butuh internet." },
              { q: "HP kentang kuat?", a: "Kuat. Nyalakan sakelar Hemat efek di halaman Lab untuk mematikan partikel dan animasi berat. Semua simulasi tetap jalan." },
              { q: "Apakah XP bisa hilang?", a: "XP tersimpan di akunmu (saat login) dan progres lab di perangkat. Share paket ke teman via link agar progres kelompok ikut naik." },
            ].map((f) => (
              <details key={f.q} className="glass group rounded-2xl px-4 py-3">
                <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    {f.q}
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--accent)] transition-transform group-open:rotate-90" />
                  </span>
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
        </Reveal>

        {/* CTA akhir */}
        <Reveal className="mt-10 w-full sm:mt-14">
        <section id="cta-akhir" className="relative w-full overflow-hidden rounded-3xl border border-teal-400/20 bg-gradient-to-br from-teal-400/10 via-transparent to-cyan-400/10 p-8 text-center sm:p-10">
          <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-teal-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-cyan-400/15 blur-3xl" />
          <Mascot mood="champ" size={56} />
          <h2 className="mx-auto mt-3 max-w-md font-sans text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            Masalahnya data, jawabannya{" "}
            <span className="font-display text-gradient">bermain.</span>
          </h2>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/arena">
              <Button className="bg-gradient-jarvis press h-11 rounded-xl px-6 text-sm font-medium text-white glow-cyan transition-all hover:brightness-110">
                <Swords className="mr-2 h-4 w-4" />
                Masuk ke Arena
              </Button>
            </Link>
            <Link href="/lab">
              <Button variant="outline" className="h-11 rounded-xl px-6 text-sm font-medium">
                <Sparkles className="mr-2 h-4 w-4" />
                Coba Lab Gratis
              </Button>
            </Link>
          </div>
        </section>
        </Reveal>

        {/* Engine strip */}
        <div className="glass mt-10 flex w-full flex-col items-center gap-2 rounded-2xl p-4 text-center text-sm text-[var(--text-secondary)] sm:flex-row sm:justify-center sm:gap-6">
          <span className="inline-flex items-center gap-1.5">
            <Gamepad2 className="h-3.5 w-3.5 text-[var(--accent)]" />
            Soal teks dijawab ChatAnywhere
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Camera className="h-3.5 w-3.5 text-[var(--accent)]" />
            Foto soal dibaca Gemini Vision
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5 text-[var(--accent)]" />
            XP, streak & level tersimpan
          </span>
        </div>
      </div>

      {/* Footer */}
      <StickyCta />
      <footer className="relative z-10 border-t border-[var(--border)] bg-[var(--background)]/60 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-sans text-sm font-semibold text-[var(--text-primary)]">
              GAMIFIKATHINK
            </p>
            <a
              href={RINTIS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--accent)]"
            >
              Powered by RINTIS NALAR Learning Center
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1">
            {[
              { href: "/arena", label: "Arena" },
              { href: "/lab", label: "Lab" },
              { href: "/materi", label: "Materi" },
              { href: "/leaderboard", label: "Peringkat" },
            ].map((l) => (
              <Link key={l.href} href={l.href}>
                <Button variant="ghost" size="sm" className="text-xs">
                  {l.label}
                </Button>
              </Link>
            ))}
            <a href={RINTIS_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-xs">
                Learning Center
                <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </a>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            18 lab • 14 mapel • Siap dimainkan
          </span>
        </div>
      </footer>
    </div>
  )
}
