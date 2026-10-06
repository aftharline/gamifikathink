"use client"

import { useEffect, useRef, useState } from "react"
import { Brain, Palette, Zap, Grid3x3, Check, X, Flame, Trophy } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { celebrate, sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { useLowFx } from "@/lib/use-fps"
import { createPool, spawn, step, draw, type Particle } from "@/lib/fx"

// Brain visual maksimal: kombo, grade S/A/B, layar hasil, confetti
export function BrainVisual() {
  const [tab, setTab] = useState<"stroop" | "reflex" | "pattern">("stroop")
  const tabs = [
    { id: "stroop", label: "Stroop", icon: <Palette className="h-3.5 w-3.5" /> },
    { id: "reflex", label: "Reflek", icon: <Zap className="h-3.5 w-3.5" /> },
    { id: "pattern", label: "Pola", icon: <Grid3x3 className="h-3.5 w-3.5" /> },
  ] as const
  return (
    <LabShell
      icon={<Brain className="h-5 w-5" />}
      title="Otak Visual"
      subject="Kognitif"
      theory="Stroop melatih fokus (abaikan tulisan, ikuti warna tinta), Reflek melatih kecepatan reaksi, Pola melatih memori spasial. Kombo jawaban benar melipatgandakan skor."
      scene={
        <div className="p-4">
          <div className="mb-3 flex gap-2">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); sfx.click() }}
                className={`fx-pop-in flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${tab === t.id ? "bg-teal-400/20 text-teal-100 shadow-[0_0_14px_rgba(45,212,191,.25)]" : "text-[var(--text-muted)] hover:text-teal-200"}`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          {tab === "stroop" && <Stroop />}
          {tab === "reflex" && <Reflex />}
          {tab === "pattern" && <Pattern />}
        </div>
      }
      controls={<p className="text-xs text-[var(--text-secondary)]">Target: Stroop 7/10, reflek di bawah 400 ms, atau pola level 6 untuk menuntaskan misi (+10 XP).</p>}
      stats={<>Latihan aktif: {tab}</>}
      actionLabel="Tandai selesai (+2 XP)"
      onAction={() => { grantXp(2); markLabDone("otak-visual") }}
      shareTitle="Lab Otak Visual"
      sharePayload={{ type: "lab", slug: "otak-visual" }}
    />
  )
}

const COLORS = [
  { name: "MERAH", hex: "#f87171" },
  { name: "HIJAU", hex: "#4ade80" },
  { name: "BIRU", hex: "#60a5fa" },
  { name: "KUNING", hex: "#facc15" },
]

function bestKey(tab: string): string {
  return `brain-best-${tab}`
}

function loadBest(tab: string): number {
  try {
    return Number(localStorage.getItem(bestKey(tab)) ?? 0) || 0
  } catch {
    return 0
  }
}

function saveBest(tab: string, v: number): void {
  try {
    const prev = loadBest(tab)
    if (v > prev) localStorage.setItem(bestKey(tab), String(v))
  } catch { /* abaikan */ }
}

function grade(score: number, total: number): string {
  const r = total ? score / total : 0
  if (r >= 0.9) return "S"
  if (r >= 0.7) return "A"
  if (r >= 0.5) return "B"
  return "C"
}

function Stroop() {
  const [score, setScore] = useState(0)
  const [round, setRound] = useState(0)
  const [combo, setCombo] = useState(0)
  const [idx, setIdx] = useState({ word: 0, color: 1 })
  const [flash, setFlash] = useState<"ok" | "no" | null>(null)
  const [finished, setFinished] = useState(false)
  const [best, setBest] = useState(() => loadBest("stroop"))
  const lowFx = useLowFx()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const poolRef = useRef<Particle[]>(createPool())

  const celebrateFx = () => {
    if (lowFx) return
    const c = canvasRef.current
    if (!c) return
    spawn(poolRef.current, c.width / 2, 20, 60, "#2dd4bf", 2.6, lowFx)
    spawn(poolRef.current, c.width / 2, 20, 30, "#fbbf24", 2, lowFx)
  }

  useEffect(() => {
    if (lowFx) return
    let raf = 0
    const loop = () => {
      const c = canvasRef.current
      if (c) {
        const ctx = c.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height)
          step(poolRef.current, 0.09)
          draw(ctx, poolRef.current)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [lowFx])

  const pick = (i: number) => {
    if (finished) return
    const ok = i === idx.color
    if (ok) {
      const nc = combo + 1
      setCombo(nc)
      setScore(score + (nc >= 3 ? 2 : 1))
      sfx.correct()
      if (nc >= 3) celebrateFx()
    } else {
      setCombo(0)
      sfx.wrong()
    }
    setFlash(ok ? "ok" : "no")
    setTimeout(() => setFlash(null), 220)
    // eslint-disable-next-line react-hooks/purity -- event handler
    const w = Math.floor(Math.random() * 4)
    // eslint-disable-next-line react-hooks/purity -- event handler
    let c = Math.floor(Math.random() * 4)
    if (c === w) c = (c + 1) % 4
    setIdx({ word: w, color: c })
    const r = round + 1
    setRound(r)
    if (r >= 10) {
      setFinished(true)
      const final = score + (ok ? 1 : 0)
      saveBest("stroop", final)
      setBest(loadBest("stroop"))
      if (final >= 7) { grantXp(10); markLabDone("otak-visual") }
      celebrate()
      celebrateFx()
    }
  }
  const reset = () => { setScore(0); setRound(0); setCombo(0); setFinished(false) }

  return (
    <div className="relative text-center">
      <canvas ref={canvasRef} width={320} height={60} className="pointer-events-none absolute inset-x-0 top-0 mx-auto" />
      <p className="text-xs text-[var(--text-muted)]">Pilih WARNA tintanya, bukan tulisannya.</p>
      <div className="mx-auto mt-2 flex max-w-55 items-center gap-2" style={{ maxWidth: 220 }}>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${(round / 10) * 100}%` }} />
        </div>
        {combo >= 2 && (
          <span className="fx-pop-in flex items-center gap-0.5 font-mono text-[11px] font-bold text-amber-300">
            <Flame className="h-3.5 w-3.5" />x{combo}
          </span>
        )}
      </div>
      {!finished ? (
        <>
          <p className={`mt-3 text-4xl font-black tracking-wide transition ${flash === "ok" ? "scale-105" : flash === "no" ? "opacity-70" : ""}`}
            style={{ color: COLORS[idx.color].hex, textShadow: `0 0 24px ${COLORS[idx.color].hex}66` }}>
            {COLORS[idx.word].name}
          </p>
          <p className="mt-1 font-mono text-xs text-teal-200">Ronde {Math.min(round + 1, 10)}/10 | Skor {score}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {COLORS.map((c, i) => (
              <button key={c.name} onClick={() => pick(i)}
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm font-bold transition hover:scale-[1.02] hover:border-teal-400/40 active:scale-95"
                style={{ color: c.hex }}>
                {c.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="fx-pop-in mt-3 rounded-2xl border border-teal-400/20 bg-black/30 p-4">
          <Trophy className="mx-auto h-8 w-8 text-amber-300" />
          <p className="mt-1 bg-gradient-to-r from-amber-200 via-teal-200 to-amber-200 bg-clip-text text-5xl font-black text-transparent" style={{ backgroundSize: "200% auto", animation: "fx-grade-shimmer 2.5s linear infinite" }}>
            {grade(score, 12)}
          </p>
          <p className="mt-1 text-sm text-[var(--text-primary)]">Skor {score}{best > 0 ? `, terbaik ${best}` : ""}. {score >= 7 ? "Fokus tajam, +10 XP." : "Butuh 7 untuk XP. Coba lagi!"}</p>
          <button onClick={reset} className="mt-2 rounded-xl bg-teal-400/20 px-4 py-1.5 text-xs font-bold text-teal-100">
            Main lagi
          </button>
        </div>
      )}
    </div>
  )
}

function Reflex() {
  const [state, setState] = useState<"wait" | "ready" | "go" | "done">("wait")
  const [ms, setMs] = useState(0)
  const [best, setBest] = useState(0)
  const [history, setHistory] = useState<number[]>([])
  const t0 = useState({ v: 0 })[0]
  const start = () => {
    sfx.click()
    setState("ready")
    setTimeout(() => { t0.v = Date.now(); setState("go") }, 1000 + Math.random() * 2000)
  }
  const tap = () => {
    if (state === "ready") { sfx.wrong(); setState("wait"); return }
    if (state !== "go") return
    const d = Date.now() - t0.v
    setMs(d); setState("done"); sfx.correct()
    setBest((b) => (b === 0 ? d : Math.min(b, d)))
    setHistory((h) => [...h.slice(-4), d])
    if (d < 400) { grantXp(10); markLabDone("otak-visual"); celebrate() }
  }
  return (
    <div className="text-center">
      <button onClick={state === "wait" || state === "done" ? start : tap}
        className={`h-36 w-full rounded-2xl text-lg font-black transition-all active:scale-[0.98] ${
          state === "go" ? "fx-tick-glow bg-emerald-400 text-emerald-950"
          : state === "ready" ? "bg-red-500/20 text-red-200"
          : "bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
        }`}>
        {state === "wait" && "Ketuk untuk mulai"}
        {state === "ready" && "Tunggu hijau..."}
        {state === "go" && "KETUK SEKARANG"}
        {state === "done" && (
          <span className="fx-pop-in flex flex-col items-center gap-1">
            <span className="font-mono text-3xl">{ms} ms</span>
            <span className="text-xs font-normal">{ms < 200 ? "Reflek dewa!" : ms < 400 ? "Kilat! +10 XP" : "Coba lagi, target di bawah 400 ms"}</span>
          </span>
        )}
      </button>
      <div className="mt-2 flex items-center justify-center gap-2 font-mono text-xs text-teal-200">
        {best > 0 && <span>Terbaik: {best} ms</span>}
        {history.length > 1 && (
          <span className="flex gap-1">
            {history.map((h, i) => (
              <span key={i} className={`rounded px-1 ${h < 400 ? "bg-teal-400/20" : "bg-white/10"}`}>{h}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

function Pattern() {
  const [seq, setSeq] = useState<number[]>([1, 5, 8])
  const [show, setShow] = useState(true)
  const [input, setInput] = useState<number[]>([])
  const [level, setLevel] = useState(3)
  const [wrong, setWrong] = useState(false)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset tampil pola tiap ronde
    setShow(true)
    setWrong(false)
    const t = setTimeout(() => setShow(false), 900 + level * 150)
    return () => clearTimeout(t)
  }, [seq, level])

  const press = (n: number) => {
    if (show || finished) return
    const next = [...input, n]
    setInput(next)
    if (next.length === seq.length) {
      if (next.every((v, i) => v === seq[i])) {
        sfx.correct(); grantXp(5)
        const nl = level + 1
        if (nl >= 6) {
          setFinished(true)
          markLabDone("otak-visual"); celebrate()
          return
        }
        setLevel(nl); setInput([])
        setSeq(Array.from({ length: nl }, () => Math.floor(Math.random() * 9)))
      } else { sfx.wrong(); setWrong(true); setInput([]) }
    }
  }
  const reset = () => { setSeq([1, 5, 8]); setLevel(3); setInput([]); setFinished(false) }
  return (
    <div className="text-center">
      <p className="text-xs text-[var(--text-muted)]">
        {finished ? "Tuntas!" : show ? "Hafalkan urutan menyala..." : "Ulangi urutannya!"} Level {level}
      </p>
      {!finished ? (
        <>
          <div className="mx-auto mt-2 grid gap-1.5" style={{ maxWidth: 180 }}>
            {Array.from({ length: 9 }).map((_, i) => {
              const lit = show && seq.includes(i)
              const order = show ? seq.indexOf(i) : -1
              const picked = input.includes(i)
              return (
                <button key={i} onClick={() => press(i)}
                  className={`flex h-12 items-center justify-center rounded-xl text-sm font-bold transition-all active:scale-90 ${
                    lit ? "bg-teal-400 text-teal-950 shadow-[0_0_16px_rgba(45,212,191,.6)]"
                    : wrong && picked ? "bg-red-500/40 text-red-100"
                    : picked ? "bg-white/20 text-white"
                    : "bg-white/5 text-[var(--text-muted)] hover:bg-white/10"
                  }`}>
                  {lit && order >= 0 ? order + 1 : ""}
                </button>
              )
            })}
          </div>
          {wrong && (
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-red-300">
              <X className="h-3.5 w-3.5" /> Urutan salah, coba lagi.
            </p>
          )}
        </>
      ) : (
        <div className="fx-pop-in mt-3 rounded-2xl border border-teal-400/20 bg-black/30 p-4">
          <Trophy className="mx-auto h-8 w-8 text-amber-300" />
          <p className="mt-1 text-sm text-[var(--text-primary)]">Memori level 6 tuntas! +XP masuk.</p>
          <button onClick={reset} className="mt-2 rounded-xl bg-teal-400/20 px-4 py-1.5 text-xs font-bold text-teal-100">
            Main lagi
          </button>
        </div>
      )}
      <div className="mx-auto mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" style={{ maxWidth: 180 }}>
        <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${(level / 6) * 100}%` }} />
      </div>
    </div>
  )
}

export function BrainGradeIcon() {
  return <Check className="h-4 w-4" />
}
