"use client"

import { useState } from "react"
import { SpellCheck, Check, X, Lightbulb } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("imbuhan")!

// Aturan peluluhan me-: s/f/v luluh (menyapu), p ditahan dengan m (mempukul)? sederhanakan baku:
// me- + sapu → menyapu | me- + pukul → memukul | me- + foto → memfoto | me- + tulis → menulis | di-/ke- tanpa luluh
const ITEMS = [
  { base: "sapu", prefix: "me-", result: "menyapu", hint: "s luluh menjadi ny" },
  { base: "pukul", prefix: "me-", result: "memukul", hint: "p menjadi m" },
  { base: "tulis", prefix: "me-", result: "menulis", hint: "t menjadi n" },
  { base: "foto", prefix: "me-", result: "memfoto", hint: "f menjadi... tetap f? memfoto" },
  { base: "masak", prefix: "di-", result: "dimasak", hint: "di- tidak luluh" },
  { base: "depan", prefix: "ke-", result: "kedepan", hint: "ke- tidak luluh (kaidah umum)" },
]

const PREFIXES = ["me-", "di-", "ke-", "pe-"]

// Imbuhan Lab: pilih imbuhan + ketik hasil, animasi tempel
export function ImbuhanSim() {
  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState("me-")
  const [typed, setTyped] = useState("")
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)
  const item = ITEMS[idx]

  const check = () => {
    const ok = picked === item.prefix && typed.trim().toLowerCase() === item.result
    if (ok) {
      sfx.correct()
      const ns = score + 1
      setScore(ns)
      const nst = streak + 1
      setStreak(nst)
      if (nst > best) setBest(nst)
      if (nst >= 3) grantXp(2)
      setWrong(false)
      if (idx + 1 >= ITEMS.length) {
        setDone(true); grantXp(10); markLabDone("imbuhan")
      } else {
        setIdx(idx + 1); setTyped(""); setPicked("me-"); setShowHint(false)
      }
    } else {
      sfx.wrong()
      setWrong(true)
      setStreak(0)
    }
  }

  const reset = () => {
    setIdx(0); setTyped(""); setPicked("me-"); setScore(0)
    setStreak(0); setShowHint(false); setDone(false); setWrong(false)
    sfx.click()
  }

  return (
    <LabShell
      icon={<SpellCheck className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Imbuhan me- bisa meluluhkan huruf awal: s→ny (menyapu), p→m (memukul), t→n (menulis). Imbuhan di- dan ke- tidak meluluhkan."
      slug="imbuhan"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <div className="p-5 text-center">
          <div className="fx-pop-in mx-auto flex max-w-75 items-center justify-center gap-1" style={{ maxWidth: 300 }} key={idx}>
            <span className={`rounded-xl border-2 border-dashed px-3 py-2 font-mono text-lg font-bold ${picked === item.prefix ? "border-orange-400/60 bg-orange-400/10 text-orange-200" : "border-white/15 text-[var(--text-muted)]"}`}>
              {picked}
            </span>
            <span className="text-xl font-black text-teal-300">+</span>
            <span className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-mono text-lg font-bold text-white">
              {item.base}
            </span>
            <span className="text-xl font-black text-teal-300">=</span>
            <span className="min-w-20 rounded-xl bg-teal-400/15 px-3 py-2 font-mono text-lg font-bold text-teal-100">
              {typed || "?"}
            </span>
          </div>
          <p className="mt-3 font-mono text-xs text-[var(--text-muted)]">
            {showHint ? `Petunjuk: ${item.hint}` : "Pilih imbuhan, ketik hasil gabungannya."}
          </p>
          <div className="mx-auto mt-2 h-1.5 overflow-hidden rounded-full bg-white/10" style={{ maxWidth: 300 }}>
            <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${((done ? ITEMS.length : idx) / ITEMS.length) * 100}%` }} />
          </div>
        </div>
      }
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex gap-1.5">
            {PREFIXES.map((p) => (
              <button key={p} onClick={() => { setPicked(p); sfx.click() }}
                className={`flex-1 rounded-lg py-1.5 font-mono font-bold ${picked === p ? "bg-orange-400/25 text-orange-100" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>
                {p}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") check() }}
              placeholder={`cth: ${item.prefix}+${item.base} = ...`}
              className="flex-1 rounded-xl bg-black/30 px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-[var(--text-muted)]"
            />
            <button onClick={() => setShowHint(!showHint)} title="Petunjuk" className="rounded-xl border border-[var(--border)] px-3 text-amber-200">
              <Lightbulb className="h-4 w-4" />
            </button>
          </div>
          {!done ? (
            <button onClick={check} className="rounded-xl bg-orange-400/20 py-2 font-semibold text-orange-100">
              Cek ({idx + 1}/{ITEMS.length}), skor {score}, streak x{streak}{best > 0 ? ` (terbaik x${best})` : ""}
            </button>
          ) : (
            <div className="grid gap-2">
              <p className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-400/10 p-2 text-teal-300">
                <Check className="h-4 w-4" /> Sempurna {score}/{ITEMS.length}! +10 XP.
              </p>
              <button onClick={reset} className="rounded-xl border border-[var(--border)] py-1.5 text-[var(--text-muted)]">
                Ulangi dari awal
              </button>
            </div>
          )}
          {wrong && !done && (
            <p className="flex items-center justify-center gap-1.5 text-red-300">
                <X className="h-4 w-4" /> Belum tepat. Cek imbuhan dan ejaan.
            </p>
          )}
        </div>
      }
      stats={<>Soal {Math.min(idx + 1, ITEMS.length)}/{ITEMS.length} | skor {score}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("imbuhan") }}
      shareTitle="Lab Imbuhan"
      sharePayload={{ type: "lab", slug: "imbuhan" }}
    />
  )
}
