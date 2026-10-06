"use client"

export const dynamic = "force-dynamic"

import { useState, type CSSProperties } from "react"
import { useSearchParams } from "next/navigation"
import { Skull, Swords } from "lucide-react"
import { Suspense } from "react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { ArcReactor } from "@/components/arc-reactor"
import { BossBattle } from "@/components/boss-battle"
import { Button } from "@/components/ui/button"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { cn } from "@/lib/utils"
import { TutorialTour, TourHelpButton } from "@/components/tutorial-tour"
import { BOSSES } from "@/lib/quiz-bank"
import { SUBJECTS, LEVELS } from "@/lib/subjects"
import { sfx } from "@/lib/feedback"

export default function KuisPage() {
  return (
    <Suspense>
      <KuisInner />
    </Suspense>
  )
}

function KuisInner() {
  const search = useSearchParams()
  const src = search.get("src") ?? undefined
  const [subject, setSubject] = useState("Matematika")
  const [level, setLevel] = useState("SMP")
  const [questionTime, setQuestionTime] = useState(30)
  const [mode, setMode] = useState<"boss" | "exam" | "tf">("boss")
  const [started, setStarted] = useState(false)
  const count = mode === "exam" ? 10 : 5

  if (started) {
    return (
      <div className="relative flex h-screen overflow-hidden">
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-hidden">
          <BossBattle
            subject={subject}
            level={level}
            questionTime={questionTime}
            count={count}
            quizType={mode === "tf" ? "tf" : "mcq"}
            difficulty={mode === "exam" ? "UTBK" : "standar"}
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
            <Skull className="h-8 w-8 text-[var(--accent)]" />
            BOSS BATTLE
            <TourHelpButton tour="kuis" />
          </h1>
        <p className="mt-2 max-w-md text-center text-sm text-[var(--text-secondary)]">
          Taklukkan 5 soal untuk mengalahkan bos. Jawaban benar menyerang HP bos,
          combo berlipat ganda, dan hati adalah nyawamu.
          {src && <span className="mt-1 block text-[var(--accent)]">Grounded ke materi yang kamu upload.</span>}
        </p>

        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            Mode Ujian
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: "boss", label: "Boss (5)" },
                { v: "exam", label: "Ujian (10)" },
                { v: "tf", label: "True/False" },
              ] as const
            ).map((m) => (
              <button
                key={m.v}
                onClick={() => { sfx.click(); setMode(m.v) }}
                className={cn(
                  "glass rounded-xl p-3 text-center text-sm transition-all",
                  mode === m.v ? "border-l-2 border-l-[var(--accent)] glow-cyan text-[var(--accent)]" : "text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 w-full max-w-md">
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            Pilih Bos
          </p>
          <div className="grid grid-cols-2 gap-2" data-tour="kuis-boss">
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
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {(BOSSES[s.value] ?? BOSSES["Matematika"]).name}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            Pilih Jenjang
          </p>
            <div className="grid grid-cols-3 gap-2" data-tour="kuis-level">
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

        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
            Durasi Per Soal
          </p>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
              <span>30 dtk</span>
              <span className="text-lg font-bold text-[var(--accent)]">
                {questionTime} dtk
              </span>
              <span>60 dtk</span>
            </div>
            <input
              type="range"
              min={30}
              max={60}
              step={5}
              value={questionTime}
              onChange={(e) => setQuestionTime(Number(e.target.value))}
              className="range-jarvis mt-3 w-full"
              style={
                {
                  "--fill": `${((questionTime - 30) / 30) * 100}%`,
                } as CSSProperties
              }
              aria-label="Durasi per soal"
            />
          </div>
        </div>

          <Button
            className="mt-8 gap-2 px-8"
            size="lg"
            data-tour="kuis-start"
            onClick={() => {
              sfx.click()
              setStarted(true)
            }}
          >
            <Swords className="h-5 w-5" />
            MULAI PERTEMPURAN
          </Button>
        </div>
        <TutorialTour tour="kuis" />
      </main>
    </div>
  )
}
