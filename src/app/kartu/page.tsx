"use client"

export const dynamic = "force-dynamic"

import { useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Layers, Swords } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { ArcReactor } from "@/components/arc-reactor"
import { FlashBattle } from "@/components/flash-battle"
import { Button } from "@/components/ui/button"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { cn } from "@/lib/utils"
import { TutorialTour, TourHelpButton } from "@/components/tutorial-tour"
import { SUBJECTS, LEVELS } from "@/lib/subjects"
import { sfx } from "@/lib/feedback"

export default function KartuPage() {
  return (
    <Suspense>
      <KartuInner />
    </Suspense>
  )
}

function KartuInner() {
  const search = useSearchParams()
  const src = search.get("src") ?? undefined
  const [subject, setSubject] = useState("Matematika")
  const [level, setLevel] = useState("SMP")
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <div className="relative flex h-screen overflow-hidden">
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-hidden">
          <FlashBattle
            subject={subject}
            level={level}
            sourceText={src}
            onExit={() => {
              setStarted(false)
            }}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-center p-4 pb-0 lg:hidden">
          <MobileMenuTrigger />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <ArcReactor size="lg" className="animate-pulse-glow" />
          <h1 className="mt-6 flex items-center gap-3 font-sans text-3xl font-bold text-[var(--text-primary)]">
            <Layers className="h-8 w-8 text-[var(--accent)]" />
            KARTU MANTRA
            <TourHelpButton tour="kartu" />
          </h1>
          <p className="mt-2 max-w-md text-center text-sm text-[var(--text-secondary)]">
            Balik tiap kartu mantra, lalu jujur: Hafal untuk menyerang bos,
            atau Belum dan bos menyerangmu. Kombo 3x+ menambah damage!
          </p>

          <div className="mt-8 w-full max-w-md">
            <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
              Pilih Deck
            </p>
            <div className="grid grid-cols-2 gap-2" data-tour="kartu-deck">
              {SUBJECTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => {
                    sfx.click()
                    setSubject(s.value)
                  }}
                  className={cn(
                    "glass rounded-xl p-3 text-left text-sm transition-all",
                    subject === s.value
                      ? "border-l-2 border-l-[var(--accent)] glow-cyan text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                  )}
                >
                  <p className="flex items-center gap-1.5 font-semibold">
                    <s.icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                    {s.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 w-full max-w-md">
            <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
              Pilih Jenjang
            </p>
            <div className="grid grid-cols-3 gap-2" data-tour="kartu-level">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  onClick={() => {
                    sfx.click()
                    setLevel(lvl.value)
                  }}
                  className={cn(
                    "glass rounded-xl p-3 text-center transition-all",
                    level === lvl.value
                      ? "border-l-2 border-l-[var(--accent)] glow-cyan"
                      : "hover:border-[var(--border-strong)]"
                  )}
                >
                  <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--text-primary)]">
                    <lvl.icon className="h-4 w-4" style={{ color: lvl.color }} />
                    {lvl.label}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                    {lvl.value === "SD" ? "Dasar & Menyenangkan" : lvl.value === "SMP" ? "Menengah & Menantang" : "Lanjutan & Brutal"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Button
            className="mt-8 gap-2 px-8"
            size="lg"
            data-tour="kartu-start"
            onClick={() => {
              sfx.click()
              setStarted(true)
            }}
          >
            <Swords className="h-5 w-5" />
            PANGGIL DECK
          </Button>
        </div>
        <TutorialTour tour="kartu" />
      </main>
    </div>
  )
}
