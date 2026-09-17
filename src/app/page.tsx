import Link from "next/link"
import Image from "next/image"
import {
  Boxes,
  ExternalLink,
  ScrollText,
  Skull,
  Smartphone,
  Sparkles,
  Swords,
  Trophy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackgroundFX } from "@/components/background-fx"
import { PwaInstallButton } from "@/components/pwa-install-button"

const shimmerStyle = {
  backgroundImage:
    "linear-gradient(120deg, transparent 0%, rgba(45,212,191,0.3) 40%, rgba(246,196,83,0.3) 60%, transparent 100%)",
  backgroundSize: "200% 100%",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  animation: "shimmer 6s linear infinite",
}

const RINTIS_NALAR_URL = "https://rintisnalar.vercel.app"

export default function LandingPage() {
  const features = [
    {
      icon: Sparkles,
      title: "Arena AI",
      desc: "Game Master dual AI + foto soal langsung dibahas",
      href: "/arena",
    },
    {
      icon: Skull,
      title: "Boss Battle",
      desc: "5 soal vs King Al-Gebra & 3 boss mapel",
      href: "/kuis",
    },
    {
      icon: Boxes,
      title: "AR Lab",
      desc: "7 model 3D + hotspot, animasi & kamera AR",
      href: "/ar",
    },
    {
      icon: ScrollText,
      title: "Buku Mantra",
      desc: "Semua pembahasan tersimpan + tautan 3D",
      href: "/buku-mantra",
    },
    {
      icon: Trophy,
      title: "Misi & XP",
      desc: "XP, level, combo, dan misi AR berhadiah",
      href: "/ar",
    },
    {
      icon: Smartphone,
      title: "PWA Offline",
      desc: "Install ke HP, halaman utama tetap terbuka",
      href: "/arena",
    },
  ]

  const steps = [
    {
      no: "01",
      title: "Pilih Mapel & Jenjang",
      desc: "Matematika, Fisika, Kimia, Bahasa Inggris — SD, SMP, SMA.",
    },
    {
      no: "02",
      title: "Belajar, Battle & Eksplor",
      desc: "Chat AI, lawan boss ber-timer, atau putar model 3D di AR Lab.",
    },
    {
      no: "03",
      title: "Kumpulkan XP",
      desc: "Selesaikan misi, jaga combo, dan naikkan level Warrior-mu.",
    },
  ]

  const stats = [
    { value: "4", label: "Mapel" },
    { value: "3", label: "Jenjang" },
    { value: "7", label: "Model 3D" },
    { value: "2", label: "AI Engine" },
  ]

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-x-hidden bg-[var(--background)] px-4 pb-16 pt-10 sm:pt-12">
      <BackgroundFX />

      {/* Content */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        {/* Logo */}
        <div className="animate-pulse-glow mb-6 sm:mb-8">
          <Image
            src="/logo.svg"
            alt="GAMIFIKATHINK"
            width={96}
            height={96}
            priority
            className="glow-drop-cyan h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
          />
        </div>

        {/* Badge */}
        <div className="glass mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] sm:mb-6 sm:text-[11px]">
          <span className="animate-pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Sistem Online • Dual AI Engine • AR Lab
        </div>

        {/* Title */}
        <h1 className="max-w-4xl font-sans text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
          Belajar Jadi{" "}
          <span className="text-gradient" style={shimmerStyle}>
            Game Epik
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-6 sm:text-base">
          Ubah soal Matematika, Fisika, Kimia, dan Bahasa Inggris jadi skenario
          seru ala Mobile Legends & Roblox. Chat dengan AI Game Master, kalahkan
          boss ber-timer, dan hadirkan model 3D seperti Ryuri langsung di
          mejamu.
        </p>

        {/* CTA */}
        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link href="/arena">
            <Button className="bg-gradient-jarvis h-10 rounded-xl px-6 text-sm font-medium text-white glow-cyan transition-all hover:brightness-110 sm:h-11">
              Masuk ke Arena
              <Swords className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/ar">
            <Button
              variant="outline"
              className="glass h-10 rounded-xl px-6 text-sm font-medium sm:h-11"
            >
              Jelajahi AR Lab
              <Boxes className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <PwaInstallButton variant="primary" />
        </div>

        {/* RINTIS NALAR Learning Center */}
        <a
          href={RINTIS_NALAR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="glass mt-4 inline-flex items-center gap-2 rounded-xl border-[var(--gold)]/40 px-5 py-2.5 text-sm font-semibold text-[var(--gold)] transition-all hover:brightness-110 glow-gold"
        >
          Kunjungi RINTIS NALAR Learning Center
          <ExternalLink className="h-4 w-4" />
        </a>

        {/* Stats */}
        <div className="glass mt-8 grid w-full max-w-2xl grid-cols-4 gap-2 rounded-2xl p-3 sm:mt-10 sm:p-4">
          {stats.map((s) => (
            <div key={s.label} className="px-2 py-1">
              <p className="text-gradient font-sans text-xl font-bold sm:text-2xl">
                {s.value}
              </p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--text-muted)] sm:text-[10px]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Feature grid */}
        <div className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Link
              key={f.title}
              href={f.href}
              className="glass group rounded-2xl p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-[var(--border-strong)]"
            >
              <div className="bg-gradient-jarvis flex h-9 w-9 items-center justify-center rounded-lg opacity-90">
                <f.icon className="h-4 w-4 text-white" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                {f.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                {f.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Steps */}
        <div className="mt-6 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.no}
              className="glass rounded-2xl p-4 text-left transition-colors hover:bg-white/5"
            >
              <p className="font-mono text-[10px] tracking-[0.2em] text-[var(--accent)]">
                STEP {s.no}
              </p>
              <h3 className="mt-1.5 text-sm font-semibold text-[var(--text-primary)]">
                {s.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* HUD status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-[var(--border)] bg-[var(--background)]/60 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] backdrop-blur-md sm:text-[11px]">
        <span className="hidden sm:inline">SYS.ONLINE // AR: 7 MODELS</span>
        <span>MODEL: GEMINI-3.5.FLASH + GPT-3.5</span>
        <span className="hidden items-center gap-1 sm:flex">
          <span className="animate-pulse-glow h-1.5 w-1.5 rounded-full bg-emerald-400" />
          STATUS: READY
        </span>
      </div>
    </div>
  )
}
