"use client"

import { useEffect, useMemo, useState } from "react"
import { Brain, Timer, Zap } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { grantXp } from "@/lib/xp-events"
import { celebrate, sfx } from "@/lib/feedback"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { TutorialTour } from "@/components/tutorial-tour"

// ponytail: 2 mini-game tanpa lib baru: math sprint + memori urutan
export default function BrainPage() {
  const [mode, setMode] = useState<"menu" | "math" | "memory">("menu")
  const [score, setScore] = useState(0)
  const [time, setTime] = useState(60)
  const [q, setQ] = useState({ a: 0, b: 0 })
  const [seq, setSeq] = useState<number[]>([])
  const [seqInput, setSeqInput] = useState<number[]>([])
  const [level, setLevel] = useState(3)
  const [playing, setPlaying] = useState(false)

  const newQ = () => {
    // eslint-disable-next-line react-hooks/purity -- event handler, bukan render
    setQ({ a: 2 + Math.floor(Math.random() * 18), b: 2 + Math.floor(Math.random() * 18) })
  }

  useEffect(() => {
    if (!playing || mode !== "math") return
    if (time <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- akhir timer, sekali saja
      setPlaying(false)
      grantXp(Math.min(30, score))
      celebrate()
      return
    }
    const t = setTimeout(() => setTime(time - 1), 1000)
    return () => clearTimeout(t)
  }, [time, playing, mode, score])

  const startMath = () => { setScore(0); setTime(60); newQ(); setPlaying(true); setMode("math") }
  const answer = (v: number) => {
    if (v === q.a + q.b) { setScore(score + 1); sfx.correct() } else sfx.wrong()
    newQ()
  }
  const startMemory = () => {
    const s = Array.from({ length: level }, () => 1 + Math.floor(Math.random() * 4))
    setSeq(s); setSeqInput([]); setPlaying(true); setMode("memory")
  }
  // Opsi jawaban di-memo agar tidak regenerate tiap render
  /* eslint-disable react-hooks/purity -- memo initializer sengaja random per soal */
  const options = useMemo(() => {
    const arr = [q.a + q.b, q.a + q.b + 1 + Math.floor(Math.random() * 3), q.a + q.b - 1, q.a + q.b + 2]
    return [...arr].sort(() => Math.random() - 0.5)
  }, [q.a, q.b])
  /* eslint-enable react-hooks/purity */
  const pressSeq = (n: number) => {
    const next = [...seqInput, n]
    setSeqInput(next)
    if (next.length === seq.length) {
      if (next.every((v, i) => v === seq[i])) {
        sfx.correct(); setScore(score + level); setLevel(level + 1)
        grantXp(5)
        const s = Array.from({ length: level + 1 }, () => 1 + Math.floor(Math.random() * 4))
        setSeq(s); setSeqInput([])
      } else { sfx.wrong(); setPlaying(false) }
    }
  }

  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-md space-y-4 text-center">
          <div className="flex items-center gap-2 text-left">
            <MobileMenuTrigger />
            <h1 className="flex items-center gap-2 text-lg font-bold text-[var(--text-primary)]">
              <Brain className="h-5 w-5 text-[var(--accent)]" /> Brain Games
            </h1>
          </div>
          {mode === "menu" && (
            <div className="grid gap-2">
              <Button onClick={startMath} size="lg"><Zap className="mr-1 h-4 w-4" /> Matematika Kilat (60 dtk)</Button>
              <Button onClick={startMemory} variant="outline" size="lg">Memori Urutan</Button>
              <Link href="/lab/otak-visual" className="glass rounded-xl px-4 py-3 text-center text-sm text-[var(--accent)] hover:border-[var(--border-strong)]">
                Baru: Stroop warna, Reflek tap, Pola grid ke Lab Otak Visual
              </Link>
              <p className="text-xs text-[var(--text-muted)]">Skor: {score} • Level memori: {level}</p>
            </div>
          )}
          {mode === "math" && (
            <div className="glass rounded-2xl p-6">
              <p className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Timer className="h-3.5 w-3.5" /> {time} dtk • Skor {score}
              </p>
              <p className="mt-4 text-4xl font-bold text-[var(--text-primary)]">{q.a} + {q.b} = ?</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {options.map((v, i) => (
                    <button key={i} onClick={() => answer(v)}
                      className="rounded-xl border border-[var(--border)] p-3 text-lg hover:border-[var(--accent)]">
                      {v}
                    </button>
                  ))}
              </div>
              {!playing && <Button onClick={() => setMode("menu")} className="mt-4">Selesai (+XP)</Button>}
            </div>
          )}
          {mode === "memory" && (
            <div className="glass rounded-2xl p-6">
              <p className="text-xs text-[var(--text-muted)]">Hafalkan: {playing ? seq.join(" – ") : "selesai"}</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button key={n} onClick={() => pressSeq(n)}
                    className="rounded-xl border border-[var(--border)] p-4 text-xl hover:border-[var(--accent)]">
                    {n}
                  </button>
                ))}
              </div>
              <Button onClick={() => setMode("menu")} variant="outline" className="mt-4">Keluar</Button>
            </div>
          )}
        </div>
      </main>
      <TutorialTour tour="otak" />
    </div>
  )
}
