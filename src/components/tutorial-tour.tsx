"use client"

import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, CircleHelp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TOURS,
  TOUR_EVENT,
  hasSeenTour,
  markTourSeen,
  type TourKey,
} from "@/lib/tutorial"

export function startTour(tour: TourKey): void {
  window.dispatchEvent(new CustomEvent<TourKey>(TOUR_EVENT, { detail: tour }))
}

export function TourHelpButton({ tour, className }: { tour: TourKey; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => startTour(tour)}
      title="Putar ulang tutorial"
      aria-label="Putar ulang tutorial"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--accent)]",
        className
      )}
    >
      <CircleHelp className="h-4 w-4" />
    </button>
  )
}

interface Spot {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 8

export function TutorialTour({ tour }: { tour: TourKey }) {
  const steps = TOURS[tour]
  const [stepIdx, setStepIdx] = useState<number | null>(null)
  const [spot, setSpot] = useState<Spot | null>(null)

  const close = useCallback(
    (seen: boolean) => {
      if (seen) markTourSeen(tour)
      setStepIdx(null)
      setSpot(null)
    },
    [tour]
  )

  const measure = useCallback(
    (target: string) => {
      if (!target) {
        setSpot(null)
        return
      }
      const el = document.querySelector(`[data-tour="${target}"]`)
      if (!el) {
        setSpot(null)
        return
      }
      const r = el.getBoundingClientRect()
      setSpot({ top: r.top, left: r.left, width: r.width, height: r.height })
    },
    []
  )

  // Auto-start sekali saat kunjungan pertama
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (!hasSeenTour(tour)) setStepIdx(0)
    }, 900)
    return () => window.clearTimeout(t)
  }, [tour])

  // Dengarkan tombol "?" (TourHelpButton)
  useEffect(() => {
    const onEvent = (e: Event) => {
      if ((e as CustomEvent<TourKey>).detail === tour) setStepIdx(0)
    }
    window.addEventListener(TOUR_EVENT, onEvent)
    return () => window.removeEventListener(TOUR_EVENT, onEvent)
  }, [tour])

  // Sorot target tiap langkah berubah
  useEffect(() => {
    if (stepIdx === null) return
    const target = steps[stepIdx]?.target ?? ""
    const timers: number[] = []
    timers.push(
      window.setTimeout(() => {
        const el = target
          ? document.querySelector(`[data-tour="${target}"]`)
          : null
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" })
          timers.push(window.setTimeout(() => measure(target), 450))
        } else {
          measure(target)
        }
      }, 80)
    )
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [stepIdx, steps, measure])

  // Posisikan ulang saat scroll/resize
  useEffect(() => {
    if (stepIdx === null) return
    const target = steps[stepIdx]?.target ?? ""
    if (!target) return
    const onMove = () => measure(target)
    window.addEventListener("scroll", onMove, { passive: true })
    window.addEventListener("resize", onMove)
    return () => {
      window.removeEventListener("scroll", onMove)
      window.removeEventListener("resize", onMove)
    }
  }, [stepIdx, steps, measure])

  // Escape = lewati
  useEffect(() => {
    if (stepIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [stepIdx, close])

  if (stepIdx === null) return null
  const step = steps[stepIdx]
  const last = stepIdx === steps.length - 1

  const CARD_W = 320
  const CARD_H = 280
  const MARGIN = 16

  const centeredStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 92,
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: "min(340px, calc(100vw - 2rem))",
    maxHeight: "calc(100dvh - 2rem)",
    overflowY: "auto",
  }

  // ponytail: estimasi tinggi kartu + fallback tengah agar tak pernah terpotong
  const tooltipStyle: React.CSSProperties =
    spot && typeof window !== "undefined"
      ? (() => {
          const vw = window.innerWidth
          const vh = window.innerHeight
          const offscreen = spot.top + spot.height < 0 || spot.top > vh
          if (offscreen) return centeredStyle
          const spaceBelow = vh - (spot.top + spot.height)
          const spaceAbove = spot.top
          const left = Math.max(
            8,
            Math.min(spot.left + spot.width / 2 - CARD_W / 2, vw - CARD_W - MARGIN)
          )
          const base = {
            position: "fixed",
            zIndex: 92,
            left,
            width: "min(320px, calc(100vw - 2rem))",
            maxHeight: "calc(100dvh - 2rem)",
            overflowY: "auto",
          } as React.CSSProperties
          if (spaceBelow >= CARD_H) {
            return { ...base, top: spot.top + spot.height + PAD + 8 }
          }
          if (spaceAbove >= CARD_H) {
            return { ...base, bottom: vh - spot.top + PAD + 8 }
          }
          return centeredStyle
        })()
      : centeredStyle

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[90] bg-black/70" onClick={() => close(true)} />
      {/* Sorot */}
      {spot &&
        typeof window !== "undefined" &&
        spot.top + spot.height >= 0 &&
        spot.top <= window.innerHeight && (
        <div
          className="pointer-events-none fixed z-[91] rounded-xl border-2 border-[var(--accent)]"
          style={{
            top: spot.top - PAD,
            left: spot.left - PAD,
            width: spot.width + PAD * 2,
            height: spot.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(0,0,0,0.55), 0 0 24px rgba(45,212,191,0.5)",
          }}
        />
      )}
      {/* Kartu langkah */}
      <div className="glass-strong rounded-2xl p-4" style={tooltipStyle}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-semibold text-[var(--accent)]">
            Tutorial {stepIdx + 1}/{steps.length}
          </p>
          <button
            onClick={() => close(true)}
            aria-label="Lewati tutorial"
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <h3 className="mt-2 font-sans text-sm font-bold text-[var(--text-primary)]">
          {step.title}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          {step.body}
        </p>
        <div className="mt-3 flex items-center justify-center gap-1">
          {steps.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIdx ? "w-5 bg-[var(--accent)]" : "w-1.5 bg-[var(--border-strong)]"
              )}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            disabled={stepIdx === 0}
            onClick={() => setStepIdx((i) => (i === null ? i : Math.max(0, i - 1)))}
            className="text-xs disabled:opacity-30"
          >
            <ChevronLeft className="mr-1 h-3.5 w-3.5" />
            Kembali
          </Button>
          <button
            onClick={() => close(true)}
            className="text-xs text-[var(--text-muted)] underline-offset-2 hover:text-[var(--text-primary)] hover:underline"
          >
            Lewati
          </button>
          {last ? (
            <Button size="sm" onClick={() => close(true)} className="text-xs">
              Selesai
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setStepIdx((i) => (i === null ? i : Math.min(steps.length - 1, i + 1)))}
              className="text-xs"
            >
              Lanjut
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
