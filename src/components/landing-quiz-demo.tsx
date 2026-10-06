"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Check, X, RotateCcw, Swords, ChevronRight } from "lucide-react"
import { BANK } from "@/lib/quiz-bank"
import { sfx } from "@/lib/feedback"

const POOL = ["Matematika", "Fisika", "Biologi", "Bahasa Inggris"] as const

function pickQuestion(): DemoItem {
  const subject = POOL[Math.floor(Math.random() * POOL.length)]
  const bank = BANK[subject] ?? BANK["Matematika"]
  const q = bank[Math.floor(Math.random() * bank.length)]
  return { subject, ...q }
}

interface DemoItem {
  subject: string
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

// Deterministik untuk render server (hindari hydration mismatch);
// acak sungguhan dipilih setelah mount.
function firstQuestion(): DemoItem {
  const subject = POOL[0]
  const bank = BANK[subject] ?? BANK["Matematika"]
  return { subject, ...bank[0] }
}

// Demo kuis mini di landing: 1 soal sungguhan + feedback + ajakan main.
export function LandingQuizDemo() {
  const [item, setItem] = useState(firstQuestion)
  const [picked, setPicked] = useState<number | null>(null)
  const ok = picked !== null && picked === item.answerIndex

  /* eslint-disable react-hooks/set-state-in-effect -- acak sekali setelah mount (server deterministik) */
  useEffect(() => {
    setItem(pickQuestion())
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  const answer = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === item.answerIndex) sfx.correct()
    else sfx.wrong()
  }

  const next = () => {
    sfx.click()
    setItem(pickQuestion())
    setPicked(null)
  }

  return (
    <div className="glass mt-4 rounded-2xl p-4 text-left">
      <p className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5">Coba Boss Battle: {item.subject}</span>
        <button onClick={next} title="Soal lain" className="rounded-md p-1 hover:text-[var(--accent)]">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </p>
      <p className="mt-2 text-sm font-medium text-[var(--text-primary)]">{item.question}</p>
      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {item.options.map((o, i) => {
          const isRight = picked !== null && i === item.answerIndex
          const isWrong = picked === i && i !== item.answerIndex
          return (
            <button
              key={i}
              onClick={() => answer(i)}
              disabled={picked !== null}
              className={`rounded-xl border px-3 py-2 text-left text-xs transition-all ${
                isRight
                  ? "border-teal-400/60 bg-teal-400/10 text-teal-200"
                  : isWrong
                    ? "border-red-500/60 bg-red-500/10 text-red-200"
                    : "border-[var(--border)] text-[var(--text-secondary)] hover:border-teal-400/40 hover:text-[var(--text-primary)]"
              }`}
            >
              <span className="mr-1.5 font-mono text-[var(--text-muted)]">{String.fromCharCode(65 + i)}.</span>
              {o}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <div className="fx-pop-in mt-2.5 rounded-xl border border-[var(--border)] bg-black/20 p-2.5 text-xs">
          <p className={`flex items-center gap-1.5 font-semibold ${ok ? "text-teal-300" : "text-red-300"}`}>
            {ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {ok ? "Benar! Di Boss Battle ini menyerang bos + kombo." : "Kurang tepat. Di game aslinya hatimu berkurang."}
          </p>
          <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">{item.explanation}</p>
          <Link href="/kuis" className="mt-2 inline-flex items-center gap-1 font-semibold text-[var(--accent)]">
            <Swords className="h-3.5 w-3.5" /> Main sungguhan <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
