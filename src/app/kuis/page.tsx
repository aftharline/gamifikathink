"use client"

export const dynamic = "force-dynamic"

import { useState, type CSSProperties } from "react"
import { Skull, Swords } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { ArcReactor } from "@/components/arc-reactor"
import { BossBattle } from "@/components/boss-battle"
import { Button } from "@/components/ui/button"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { cn } from "@/lib/utils"
import { BOSSES } from "@/lib/quiz-bank"
import { sfx } from "@/lib/feedback"

const SUBJECTS = ["Matematika", "Bahasa Inggris", "Fisika", "Kimia"]
const LEVELS = [
  { value: "SD", label: "🏫 SD", desc: "Dasar & Menyenangkan" },
  { value: "SMP", label: "📚 SMP", desc: "Menengah & Menantang" },
  { value: "SMA", label: "🎓 SMA", desc: "Lanjutan & Brutal" },
]

export default function KuisPage() {
  const [subject, setSubject] = useState("Matematika")
  const [level, setLevel] = useState("SMP")
  const [questionTime, setQuestionTime] = useState(30)
  const [started, setStarted] = useState(false)

  if (started) {
    return (
      <div className="relative flex h-screen overflow-hidden">
        <Sidebar />
        <main className="relative z-10 flex-1 overflow-hidden">
          <BossBattle
            subject={subject}
            level={level}
            questionTime={questionTime}
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
        </h1>
        <p className="mt-2 max-w-md text-center text-sm text-[var(--text-secondary)]">
          Taklukkan 5 soal untuk mengalahkan bos. Jawaban benar menyerang HP bos,
          combo berlipat ganda, dan hati adalah nyawamu.
        </p>

        <div className="mt-8 w-full max-w-md">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Pilih Bos
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  sfx.click()
                  setSubject(s)
                }}
                className={cn(
                  "glass rounded-xl p-3 text-left text-sm transition-all",
                  subject === s
                    ? "border-l-2 border-l-[var(--accent)] glow-cyan text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                )}
              >
                <p className="font-semibold">{s}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  {BOSSES[s].name}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Pilih Jenjang
          </p>
          <div className="grid grid-cols-3 gap-2">
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
                <p className="text-sm font-semibold text-[var(--text-primary)]">{lvl.label}</p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{lvl.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 w-full max-w-md">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
            Durasi Per Soal
          </p>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--text-secondary)]">
              <span>30 dtk</span>
              <span className="text-lg font-bold text-[var(--accent)]">
                {questionTime}s
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
          onClick={() => {
            sfx.click()
            setStarted(true)
          }}
        >
          <Swords className="h-5 w-5" />
          MULAI PERTEMPURAN
        </Button>
        </div>
      </main>
    </div>
  )
}
