"use client"

import { useRef, useState } from "react"
import {
  Brain,
  Check,
  RotateCcw,
  Trophy,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { sfx, celebrate } from "@/lib/feedback"
import { cn } from "@/lib/utils"
import type { ArModel } from "@/lib/ar-catalog"

interface ArQuizProps {
  model: ArModel
  onPassed?: () => void
}

export function ArQuiz({ model, onPassed }: ArQuizProps) {
  const [started, setStarted] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const passedRef = useRef(false)

  const questions = model.quiz
  const total = questions.length

  if (total === 0) return null

  const reset = () => {
    sfx.click()
    setQIndex(0)
    setSelected(null)
    setCorrectCount(0)
    setFinished(false)
  }

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    if (idx === questions[qIndex].answerIndex) {
      sfx.correct()
      setCorrectCount((c) => c + 1)
    } else {
      sfx.wrong()
    }
  }

  const handleNext = () => {
    sfx.click()
    if (qIndex + 1 >= total) {
      setFinished(true)
      const passed = correctCount === total
      if (passed) {
        celebrate()
        sfx.win()
        if (!passedRef.current) {
          passedRef.current = true
          onPassed?.()
        }
      }
    } else {
      setQIndex((i) => i + 1)
      setSelected(null)
    }
  }

  return (
    <div className="glass mt-4 rounded-2xl p-4">
      <p className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
        <Brain className="h-3.5 w-3.5 text-[var(--accent)]" />
        Kuis Model — {total} soal
      </p>

      {!started ? (
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Uji pemahamanmu tentang {model.title}. Jawab semua dengan benar
            untuk menaklukkan misi kuis!
          </p>
          <Button
            className="mt-3 gap-2"
            onClick={() => {
              sfx.click()
              setStarted(true)
            }}
          >
            Mulai Kuis
          </Button>
        </div>
      ) : !finished ? (
        <div className="animate-fade-in" key={qIndex}>
          <p className="font-mono text-[10px] text-[var(--text-muted)]">
            SOAL {qIndex + 1}/{total} • BENAR {correctCount}
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">
            {questions[qIndex].question}
          </p>
          <div className="mt-3 space-y-2">
            {questions[qIndex].options.map((opt, i) => {
              const isAnswer = i === questions[qIndex].answerIndex
              const isSelected = i === selected
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={selected !== null}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                    selected === null
                      ? "border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-white/5"
                      : isAnswer
                        ? "border-emerald-400/60 bg-emerald-500/10 text-[var(--text-primary)]"
                        : isSelected
                          ? "border-red-400/60 bg-red-500/10 text-[var(--text-primary)]"
                          : "border-[var(--border)] opacity-60"
                  )}
                >
                  {selected !== null && isAnswer ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : selected !== null && isSelected ? (
                    <X className="h-4 w-4 shrink-0 text-red-400" />
                  ) : null}
                  <span>{opt}</span>
                </button>
              )
            })}
          </div>
          {selected !== null && (
            <div className="animate-fade-in mt-3">
              <p className="rounded-lg bg-white/5 p-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                {questions[qIndex].explanation}
              </p>
              <Button size="sm" className="mt-3 w-full" onClick={handleNext}>
                {qIndex + 1 >= total ? "Lihat Hasil" : "Soal Berikutnya"}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center">
          {correctCount === total ? (
            <>
              <Trophy className="mx-auto h-8 w-8 text-[var(--gold)] glow-text-gold" />
              <p className="mt-2 text-sm font-semibold text-[var(--text-primary)]">
                Sempurna! {correctCount}/{total} benar.
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Misi kuis selesai — XP otomatis diklaim.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {correctCount}/{total} benar — belum sempurna.
              </p>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Ulangi untuk menaklukkan misi kuis dan klaim XP.
              </p>
              <Button size="sm" variant="outline" className="mt-3 gap-2" onClick={reset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Ulangi Kuis
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
