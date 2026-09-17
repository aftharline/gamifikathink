import Link from "next/link"
import Image from "next/image"
import { Swords, BookOpen, Zap, Camera, Gamepad2 } from "lucide-react"
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

export default function LandingPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Multi Mapel",
      desc: "Matematika, Fisika, Kimia, Bahasa Inggris",
    },
    {
      icon: Camera,
      title: "AI Vision",
      desc: "Foto soal langsung diproses oleh AI",
    },
    {
      icon: Gamepad2,
      title: "Gamifikasi",
      desc: "Skenario hero, item, dan battle epik",
    },
  ]

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-[var(--background)] px-4 py-10 sm:py-12">
      <BackgroundFX />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
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
          Sistem Online • Dual AI Engine
        </div>

        {/* Title */}
        <h1 className="max-w-4xl font-sans text-3xl font-bold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
          Belajar Jadi{" "}
          <span className="text-gradient" style={shimmerStyle}>
            Game Epik
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-6 sm:text-base">
          Ubah soal Matematika, Fisika, Kimia, dan Bahasa Inggris jadi skenario seru ala
          Mobile Legends & Roblox. AI Game Master-mu sudah siap.
        </p>

        {/* CTA */}
        <div className="mt-7 flex flex-col items-center gap-3 sm:mt-9 sm:flex-row">
          <Link href="/arena">
            <Button className="bg-gradient-jarvis h-10 rounded-xl px-6 text-sm font-medium text-white glow-cyan transition-all hover:brightness-110 sm:h-11">
              Masuk ke Arena
              <Swords className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <PwaInstallButton variant="primary" />
        </div>

        {/* Feature strip */}
        <div className="glass mt-8 grid w-full max-w-2xl grid-cols-1 gap-1 rounded-2xl p-3 sm:mt-12 sm:grid-cols-3 sm:gap-2 sm:p-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <div className="bg-gradient-jarvis flex h-9 w-9 shrink-0 items-center justify-center rounded-lg opacity-90">
                <f.icon className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {f.title}
                </h3>
                <p className="truncate text-xs text-[var(--text-secondary)]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* HUD status bar */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-[var(--border)] bg-[var(--background)]/60 px-6 py-2.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] backdrop-blur-md sm:text-[11px]">
        <span className="hidden sm:inline">SYS.ONLINE // ENGINES: DUAL</span>
        <span>MODEL: GEMINI-3.5.FLASH + GPT-3.5</span>
        <span className="hidden items-center gap-1 sm:flex">
          <Zap className="h-3 w-3 text-[var(--accent)]" />
          STATUS: READY
        </span>
      </div>
    </div>
  )
}
