"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Heart, Swords, ShieldAlert, Trophy, RotateCcw, ChevronLeft, Lightbulb, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingScreen } from "@/components/loading-screen"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { cn, normalizeMathDelimiters } from "@/lib/utils"
import { bankToCards, isDeckReplay, markDeckDone, type FlashCard } from "@/lib/flashcards"
import { getDueCards, gradeSrs } from "@/lib/srs"
import { touchStreak } from "@/lib/streak"
import { createClient } from "@/lib/supabase/client"
import { ShareButton } from "@/components/share-button"
import { getSubject } from "@/lib/subjects"
import { ensureAiAccess, consumeLocalQuota, handleGateResponse } from "@/lib/ai-gate"
import { BOSSES } from "@/lib/quiz-bank"
import { XP_REWARDS } from "@/lib/xp"
import { grantXp } from "@/lib/xp-events"
import { celebrate, sfx } from "@/lib/feedback"

const BOSS_HP = 100
const HEARTS = 3

function CardFace({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none text-[var(--text-primary)]">
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
        {normalizeMathDelimiters(text)}
      </ReactMarkdown>
    </div>
  )
}

interface FlashBattleProps {
  subject: string
  level: string
  sourceText?: string
  onExit: () => void
}

type BattleStatus = "loading" | "playing" | "won" | "lost"

export function FlashBattle({ subject, level, sourceText, onExit }: FlashBattleProps) {
  const [cards, setCards] = useState<FlashCard[] | null>(null)
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null)
  const [hearts, setHearts] = useState(HEARTS)
  const [bossHp, setBossHp] = useState(BOSS_HP)
  const [combo, setCombo] = useState(0)
  const [maxCombo, setMaxCombo] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [status, setStatus] = useState<BattleStatus>("loading")
  const [xpEarned, setXpEarned] = useState(0)
  const [replay, setReplay] = useState(false)
  const finishedRef = useRef(false)
  const lockRef = useRef(false)
  const advanceTimeoutRef = useRef<number | null>(null)

  const clearAdvanceTimeout = () => {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }

  useEffect(() => {
    return () => clearAdvanceTimeout()
  }, [])

  const boss = BOSSES[subject] ?? BOSSES["Matematika"]
  const damage = cards && cards.length > 0 ? Math.ceil(BOSS_HP / cards.length) : 20

  const loadDeck = useCallback(() => {
    finishedRef.current = false
    lockRef.current = false
    // Jatah AI tamu: total 1x (login = bebas); bank lokal tetap bisa dimainkan
    void ensureAiAccess().then((gate) => {
      if (!gate.ok) {
        setReplay(isDeckReplay(subject, level))
        setCards(getDueCards(bankToCards(subject), subject))
        setStatus("playing")
        return
      }
      if (gate.guest) consumeLocalQuota()
    fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, level, sourceText }),
    })
      .then((r) => {
        if (handleGateResponse(r.status)) throw new Error("LOGIN_REQUIRED")
        return r.json()
      })
      .then((data) => {
        const deck: FlashCard[] =
          Array.isArray(data?.cards) && data.cards.length > 0
            ? (data.cards as FlashCard[]).filter(
                (c) =>
                  typeof c?.front === "string" &&
                  c.front.length > 0 &&
                  typeof c?.back === "string" &&
                  c.back.length > 0
              )
            : []
        setReplay(isDeckReplay(subject, level))
        const base = deck.length > 0 ? deck : bankToCards(subject)
        // SRS: dahulukan kartu jatuh tempo
        setCards(getDueCards(base, subject))
        setStatus("playing")
      })
      .catch(() => {
        setReplay(isDeckReplay(subject, level))
        setCards(getDueCards(bankToCards(subject), subject))
        setStatus("playing")
      })
    })
  }, [subject, level, sourceText])

  useEffect(() => {
    loadDeck()
  }, [loadDeck])

  const finish = useCallback(
    (finalHearts: number, finalBossHp: number, finalCorrect: number, wasReplay: boolean) => {
      if (finishedRef.current) return
      finishedRef.current = true
      const defeated = finalBossHp <= 0
      const won = finalHearts > 0
      let xp = finalCorrect * XP_REWARDS.flashCorrect + (defeated ? XP_REWARDS.flashDeckClear : 0)
      // ponytail: deck bebas diulang, run ulang XP kecil (25%)
      if (wasReplay) xp = Math.ceil(xp / 4)
      setXpEarned(xp)
      setStatus(won ? "won" : "lost")
      if (won) {
        celebrate()
        sfx.win()
      } else {
        sfx.wrong()
      }
      // deck dianggap selesai hanya jika menang; kalah boleh coba lagi full XP
      if (won) markDeckDone(subject, level)
      grantXp(xp)
      touchStreak()
      try {
        const supabase = createClient()
        supabase.auth.getUser().then(({ data: { user } }) => {
          if (!user || !cards) return
          void supabase.from("quiz_attempts").insert({
            user_id: user.id, subject, level, mode: "flash",
            score: finalCorrect, total: cards.length,
          })
        })
      } catch { /* abaikan */ }
    },
    [subject, level, cards]
  )

  const advance = useCallback(
    (nextBossHp: number, nextHearts: number, nextCorrect: number, wasReplay: boolean) => {
      if (!cards) return
      const nextIndex = index + 1
      if (nextHearts <= 0) {
        finish(0, nextBossHp, nextCorrect, wasReplay)
        return
      }
      if (nextIndex >= cards.length) {
        finish(nextHearts, nextBossHp, nextCorrect, wasReplay)
        return
      }
      setIndex(nextIndex)
      setFlipped(false)
      setShowHint(false)
      setFeedback(null)
      lockRef.current = false
    },
    [cards, index, finish]
  )

  const grade = useCallback(
    (remembered: boolean) => {
      if (!cards || lockRef.current || !flipped || finishedRef.current) return
      lockRef.current = true
      const wasReplay = isDeckReplay(subject, level)
      gradeSrs(subject, cards[index]?.front ?? "", remembered)

      if (remembered) {
        const newCombo = combo + 1
        const newCorrect = correctCount + 1
        const newBossHp = Math.max(0, bossHp - damage - (newCombo >= 3 ? 5 : 0))
        setFeedback("correct")
        sfx.correct()
        setCombo(newCombo)
        setMaxCombo((m) => Math.max(m, newCombo))
        setCorrectCount(newCorrect)
        setBossHp(newBossHp)
        clearAdvanceTimeout()
        advanceTimeoutRef.current = window.setTimeout(
          () => advance(newBossHp, hearts, newCorrect, wasReplay),
          650
        )
      } else {
        const newHearts = hearts - 1
        setFeedback("wrong")
        sfx.wrong()
        setCombo(0)
        setHearts(newHearts)
        clearAdvanceTimeout()
        advanceTimeoutRef.current = window.setTimeout(
          () => advance(bossHp, newHearts, correctCount, wasReplay),
          650
        )
      }
    },
    [cards, flipped, combo, correctCount, bossHp, hearts, damage, subject, level, advance, index]
  )

  const restart = () => {
    sfx.click()
    clearAdvanceTimeout()
    setIndex(0)
    setFlipped(false)
    setShowHint(false)
    setFeedback(null)
    setHearts(HEARTS)
    setBossHp(BOSS_HP)
    setCombo(0)
    setMaxCombo(0)
    setCorrectCount(0)
    setXpEarned(0)
    setStatus("loading")
    setCards(null)
    loadDeck()
  }

  if (status === "loading" || !cards) {
    return <LoadingScreen label="Memanggil deck kartu mantra…" />
  }

  if (status === "won" || status === "lost") {
    const defeated = bossHp <= 0
    return (
      <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="glass rounded-2xl p-6">
          {status === "won" ? (
            <Trophy className="mx-auto h-10 w-10 text-[var(--gold)]" />
          ) : (
            <ShieldAlert className="mx-auto h-10 w-10 text-[var(--danger)]" />
          )}
          <h2 className="mt-3 font-sans text-xl font-bold text-[var(--text-primary)]">
            {status === "won"
              ? defeated
                ? `${boss.name} Tumbang!`
                : "Deck Selesai!"
              : "Kamu Kalah…"}
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {correctCount}/{cards.length} mantra dihafal • Kombo maks {maxCombo}x
            {replay ? " • run ulang (XP kecil)" : ""}
          </p>
          <p className="mt-2 text-xs font-bold text-[var(--accent)]">
            +{xpEarned} XP
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExit}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Keluar
          </Button>
          <Button onClick={restart}>
            <RotateCcw className="mr-1 h-4 w-4" />
            Main Lagi
          </Button>
        </div>
        <ShareButton title={`Deck ${subject} ${correctCount}/${cards.length}`} payload={{ type: "flashcards", subject, level, cards }} />
      </div>
    )
  }

  const card = cards[index]
  if (!card) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">Kartu tidak tersedia. Mulai ulang deck.</p>
        <Button onClick={restart}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Muat Ulang
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <MobileMenuTrigger />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span className="flex items-center gap-1 truncate">
              {(() => {
                const S = getSubject(subject)
                return <S.icon className="h-3 w-3 shrink-0" style={{ color: S.color }} />
              })()}
              {boss.name} • {Math.max(0, bossHp)}/100
            </span>
            <span>Kartu {index + 1}/{cards.length}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--secondary)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all"
              style={{ width: `${Math.max(0, bossHp)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: HEARTS }).map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "h-4 w-4",
                i < hearts ? "fill-red-500 text-red-500" : "text-[var(--text-muted)]"
              )}
            />
          ))}
        </div>
      </div>

      {combo >= 2 && (
        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-[var(--gold)]">
          <Flame className="h-3.5 w-3.5" />
          Kombo {combo}x
        </p>
      )}

      {/* Kartu flip */}
      <button
        onClick={() => {
          if (!flipped && !lockRef.current) {
            sfx.click()
            setFlipped(true)
          }
        }}
        className="block w-full text-left"
        style={{ perspective: "1000px" }}
        aria-label={flipped ? "Kartu terbuka" : "Ketuk untuk membuka kartu"}
      >
        <div
          className={`relative min-h-64 w-full transition-transform duration-500 ${!flipped ? "lift" : ""}`}
          style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
        >
          <div
            className={cn(
              "glass-strong absolute inset-0 overflow-y-auto rounded-2xl p-5",
              feedback === "correct" && "border-emerald-400/60",
              feedback === "wrong" && "border-red-500/60"
            )}
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              Mantra {index + 1} • ketuk untuk buka
            </p>
            <div className="mt-3">
              <CardFace text={card.front} />
            </div>
          </div>
          <div
            className={cn(
              "glass-strong absolute inset-0 overflow-y-auto rounded-2xl border-[var(--accent)]/40 p-5",
              feedback === "correct" && "border-emerald-400/60",
              feedback === "wrong" && "border-red-500/60"
            )}
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-xs font-semibold text-[var(--accent)]">
              Jawaban
            </p>
            <div className="mt-3">
              <CardFace text={card.back} />
            </div>
          </div>
        </div>
      </button>

      {card.hint && !flipped && (
        <div>
          {!showHint ? (
            <button
              onClick={() => {
                sfx.click()
                setShowHint(true)
              }}
              className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Intip bisikan mantra?
            </button>
          ) : (
            <p className="glass rounded-xl p-3 text-xs italic text-[var(--text-secondary)]">
              {card.hint}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pb-2">
        <Button
          onClick={() => grade(true)}
          disabled={!flipped}
          className="press bg-gradient-to-r from-teal-500 to-emerald-500 text-white disabled:opacity-30"
        >
          <Swords className="mr-1 h-4 w-4" />
          Hafal
        </Button>
        <Button
          onClick={() => grade(false)}
          disabled={!flipped}
          variant="outline"
          className="press"
        >
          <ShieldAlert className="mr-1 h-4 w-4" />
          Belum
        </Button>
      </div>
      {!flipped && (
        <p className="pb-4 text-center text-[11px] text-[var(--text-muted)]">
          Buka kartunya dulu, lalu jujur: hafal atau belum?
        </p>
      )}
    </div>
  )
}
