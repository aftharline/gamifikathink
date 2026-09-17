"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Heart,
  Zap,
  Skull,
  Trophy,
  RotateCcw,
  ChevronLeft,
} from "lucide-react"
import { ArcReactor } from "@/components/arc-reactor"
import { Button } from "@/components/ui/button"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { BackgroundFX } from "@/components/background-fx"
import { cn } from "@/lib/utils"
import { BOSSES, getFallbackQuestions, shuffleQuestions, type QuizQuestion } from "@/lib/quiz-bank"
import { XP_REWARDS } from "@/lib/xp"
import { grantXp } from "@/lib/xp-events"
import { celebrate, sfx } from "@/lib/feedback"

const BOSS_HP = 100
const HEARTS = 3

interface BattleState {
  qIndex: number
  score: number
  combo: number
  maxCombo: number
  hearts: number
  bossHp: number
  correctCount: number
}

const INITIAL_STATE: BattleState = {
  qIndex: 0,
  score: 0,
  combo: 0,
  maxCombo: 0,
  hearts: HEARTS,
  bossHp: BOSS_HP,
  correctCount: 0,
}

type BattleStatus = "loading" | "playing" | "won" | "lost"

interface BossBattleProps {
  subject: string
  level: string
  questionTime?: number
  onExit: () => void
}

export function BossBattle({ subject, level, questionTime = 30, onExit }: BossBattleProps) {
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null)
  const [state, setState] = useState<BattleState>(INITIAL_STATE)
  const [status, setStatus] = useState<BattleStatus>("loading")
  const [selected, setSelected] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [timeLeft, setTimeLeft] = useState(questionTime)
  const [xpEarned, setXpEarned] = useState(0)
  const [bossDefeated, setBossDefeated] = useState(false)
  const finishedRef = useRef(false)

  const boss = BOSSES[subject] ?? BOSSES["Matematika"]

  const loadQuestions = useCallback(() => {
    finishedRef.current = false
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, level }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          setQuestions(shuffleQuestions(data.questions))
        } else {
          setQuestions(getFallbackQuestions(subject))
        }
        setStatus("playing")
      })
      .catch(() => {
        setQuestions(getFallbackQuestions(subject))
        setStatus("playing")
      })
  }, [subject, level])

  useEffect(() => {
    loadQuestions()
  }, [loadQuestions])

  const finish = useCallback(
    (won: boolean, defeated: boolean) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const xp =
        state.correctCount * XP_REWARDS.quizCorrect +
        (defeated ? XP_REWARDS.bossDefeated : 0)
      setXpEarned(xp)
      setBossDefeated(defeated)
      setStatus(won ? "won" : "lost")
      if (won) {
        celebrate()
        sfx.win()
      } else {
        sfx.wrong()
      }
      grantXp(xp)
    },
    [state.correctCount]
  )

  useEffect(() => {
    if (status !== "playing" || !questions) return
    if (state.hearts <= 0) finish(false, false)
    else if (state.bossHp <= 0) finish(true, true)
    else if (state.qIndex >= questions.length) finish(true, false)
  }, [state, status, questions, finish])

  const answer = useCallback(
    (idx: number) => {
      if (!questions || status !== "playing" || selected != null) return
      const q = questions[Math.min(state.qIndex, questions.length - 1)]
      if (!q) return
      const correct = idx === q.answerIndex
      setSelected(idx)
      setFeedback(correct ? "correct" : "wrong")
      if (correct) sfx.correct()
      else sfx.wrong()
      setState((prev) => {
        const bossHpNext = Math.max(0, prev.bossHp - (correct ? 20 : 0))
        const heartsNext = Math.max(0, prev.hearts - (correct ? 0 : 1))
        const comboNext = correct ? prev.combo + 1 : 0
        return {
          qIndex: prev.qIndex,
          score: prev.score + (correct ? 100 * Math.min(comboNext, 5) : 0),
          combo: comboNext,
          maxCombo: Math.max(prev.maxCombo, comboNext),
          hearts: heartsNext,
          bossHp: bossHpNext,
          correctCount: prev.correctCount + (correct ? 1 : 0),
        }
      })
      window.setTimeout(() => {
        setSelected(null)
        setFeedback(null)
        setTimeLeft(questionTime)
        setState((prev) =>
          prev.qIndex >= questions.length
            ? prev
            : { ...prev, qIndex: prev.qIndex + 1 }
        )
      }, 1700)
    },
    [questions, status, selected, state.qIndex, questionTime]
  )

  useEffect(() => {
    if (status !== "playing" || !questions || selected != null) return
    const t = window.setTimeout(
      () => {
        if (timeLeft <= 0) {
          answer(-1)
        } else {
          setTimeLeft(timeLeft - 1)
          if (timeLeft <= 6) sfx.timer()
        }
      },
      timeLeft <= 0 ? 0 : 1000
    )
    return () => window.clearTimeout(t)
  }, [timeLeft, status, selected, questions, answer])

  const handleRestart = () => {
    setState(INITIAL_STATE)
    setSelected(null)
    setFeedback(null)
    setTimeLeft(questionTime)
    setXpEarned(0)
    setBossDefeated(false)
    setStatus("loading")
    loadQuestions()
  }

  const timePct = (timeLeft / questionTime) * 100
  const bossHpPct = (state.bossHp / BOSS_HP) * 100
  const question = questions?.[Math.min(state.qIndex, questions.length - 1)]
  const pointsGained = 100 * Math.min(state.combo + 1, 5)

  if (status === "loading" || !questions || !question) {
    return (
      <div className="relative flex h-full flex-col items-center justify-center">
        <BackgroundFX />
        <ArcReactor size="lg" className="animate-pulse-glow" />
        <p className="mt-6 font-mono text-xs uppercase tracking-[0.3em] text-[var(--text-muted)]">
          Menerbangkan {boss.name}…
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full flex-col overflow-y-auto p-4 sm:p-6">
      <BackgroundFX />

      {/* Top HUD */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <MobileMenuTrigger />
          <button
            onClick={() => {
              sfx.click()
              onExit()
            }}
            className="flex items-center gap-1 text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
          >
            <ChevronLeft className="h-4 w-4" />
            Tinggalkan Arena
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            {subject} • {level}
          </span>
          <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--accent)]">
            Soal {Math.min(state.qIndex + 1, questions.length)}/{questions.length}
          </span>
        </div>
      </div>

      {/* Boss card */}
      <div className="glass mx-auto mb-4 w-full max-w-md rounded-2xl p-5 text-center">
        <ArcReactor size="lg" className="mx-auto" />
        <h2 className="mt-3 glow-text-cyan font-sans text-xl font-bold text-[var(--text-primary)]">
          {boss.name}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--text-muted)]">
          {boss.title}
        </p>
        <p className="mt-2 text-xs italic text-[var(--text-secondary)]">
          &ldquo;{boss.quote}&rdquo;
        </p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            <span>HP BOSS</span>
            <span>{state.bossHp}/{BOSS_HP}</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-[var(--secondary)]">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                bossHpPct > 50
                  ? "bg-teal-400"
                  : bossHpPct > 25
                    ? "bg-amber-400"
                    : "bg-red-500"
              )}
              style={{ width: `${bossHpPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Player HUD */}
      <div className="mx-auto mb-4 flex w-full max-w-md items-center justify-between gap-2">
        <div className="flex gap-1">
          {Array.from({ length: HEARTS }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "h-5 w-5",
                i < state.hearts
                  ? "fill-red-500 text-red-500"
                  : "text-[var(--text-muted)] opacity-40"
              )}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {state.combo >= 2 && (
            <span className="flex items-center gap-1 font-mono text-xs font-bold text-[var(--gold)]">
              <Zap className="h-4 w-4" />
              x{Math.min(state.combo, 5)} COMBO
            </span>
          )}
          <span className="font-mono text-sm font-bold text-[var(--accent)]">
            {state.score.toLocaleString("id-ID")}
          </span>
        </div>
      </div>

      {/* Timer */}
      <div className="mx-auto mb-4 w-full max-w-md">
        <div className="mb-1 flex justify-between font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          <span>Waktu</span>
          <span className={cn(timeLeft <= 6 && "animate-pulse text-red-400")}>{timeLeft}s</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-[var(--secondary)]">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-linear",
              timeLeft > 10 ? "bg-[var(--accent)]" : "bg-red-500"
            )}
            style={{ width: `${timePct}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="mx-auto w-full max-w-md">
        <div className="glass rounded-2xl p-5">
          <p className="text-sm font-medium leading-relaxed text-[var(--text-primary)]">
            {question.question}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {question.options.map((option, i) => {
              const isCorrectOption = i === question.answerIndex
              const isSelected = selected === i
              return (
                <button
                  key={i}
                  disabled={selected != null}
                  onClick={() => {
                    sfx.click()
                    answer(i)
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                    selected == null &&
                      "border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-primary)] hover:border-[var(--accent)] hover:glow-cyan",
                    selected != null &&
                      isCorrectOption &&
                      "border-teal-400 bg-teal-400/10 text-teal-300",
                    selected != null &&
                      isSelected &&
                      !isCorrectOption &&
                      "border-red-500 bg-red-500/10 text-red-300",
                    selected != null &&
                      !isSelected &&
                      !isCorrectOption &&
                      "border-[var(--border)] text-[var(--text-muted)] opacity-50"
                  )}
                >
                  <span className="mr-2 font-mono text-xs text-[var(--text-muted)]">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {option}
                </button>
              )
            })}
          </div>

          {feedback && (
            <div
              className={cn(
                "mt-4 rounded-xl border p-3 text-xs leading-relaxed",
                feedback === "correct"
                  ? "border-teal-400/40 bg-teal-400/10 text-teal-300"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              )}
            >
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.2em]">
                {feedback === "correct" ? `BENAR! +${pointsGained}` : "SALAH"}
              </span>
              <span className="text-[var(--text-secondary)]">{question.explanation}</span>
            </div>
          )}
        </div>
      </div>

      {/* Result overlay */}
      {status !== "playing" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="glass w-full max-w-sm rounded-3xl p-6 text-center">
            {status === "won" ? (
              <Trophy className="mx-auto h-12 w-12 text-[var(--gold)]" />
            ) : (
              <Skull className="mx-auto h-12 w-12 text-red-400" />
            )}
            <h2
              className={cn(
                "mt-3 font-sans text-2xl font-bold",
                status === "won"
                  ? "glow-text-cyan text-[var(--text-primary)]"
                  : "text-[var(--text-primary)]"
              )}
            >
              {status === "won"
                ? bossDefeated
                  ? "BOSS DIKALAHKAN!"
                  : "MISI BERHASIL"
                : "MISI GAGAL"}
            </h2>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">
              {status === "won"
                ? bossDefeated
                  ? `${boss.name} tumbang oleh pukulanmu.`
                  : "Semua soal terjawab dan kamu selamat, Warrior!"
                : `${boss.name} masih bertahan. Bangkit dan lawan lagi, Warrior!`}
            </p>
            <div className="mt-4 space-y-2 rounded-2xl bg-[var(--surface-2)] p-4 font-mono text-sm">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Skor</span>
                <span className="text-[var(--text-primary)]">{state.score.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Combo Maks</span>
                <span className="text-[var(--gold)]">x{Math.max(state.maxCombo, 1)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Jawaban Benar</span>
                <span className="text-teal-300">{state.correctCount}/5</span>
              </div>
              <div className="flex justify-between border-t border-[var(--border)] pt-2 text-[var(--text-secondary)]">
                <span>XP Diperoleh</span>
                <span className="font-bold text-[var(--accent)]">+{xpEarned}</span>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button
                className="flex-1 gap-2"
                onClick={() => {
                  sfx.click()
                  handleRestart()
                }}
              >
                <RotateCcw className="h-4 w-4" />
                Lawan Lagi
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  sfx.click()
                  onExit()
                }}
              >
                Ganti Mapel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
