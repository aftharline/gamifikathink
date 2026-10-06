"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { FlaskConical, MessageCircleQuestion, Share2, ScrollText } from "lucide-react"
import { Mascot, type MascotMood } from "@/components/lab/mascot"
import { getTheme } from "@/lib/lab-themes"

interface Props {
  icon: ReactNode
  title: string
  subject: string
  theory: string
  scene: ReactNode
  controls: ReactNode
  stats: ReactNode
  actionLabel: string
  onAction: () => void
  shareTitle: string
  sharePayload: unknown
  slug?: string
  greeting?: string
  story?: [string, string, string]
  mascotMood?: MascotMood
}

/** Kerangka neon-gelap seragam untuk semua simulasi lab. */
export function LabShell({ icon, title, subject, theory, scene, controls, stats, actionLabel, onAction, shareTitle, sharePayload, slug = "", greeting, story, mascotMood = "happy" }: Props) {
  const share = async () => {
    try {
      const r = await fetch("/api/share", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: shareTitle, payload: sharePayload }),
      }).then((x) => x.json())
      if (r.code) await navigator.clipboard.writeText(`${location.origin}/p/${r.code}`).catch(() => {})
    } catch { /* abaikan */ }
  }
  const theme = getTheme(slug)
  return (
    <div className="fx-pop-in overflow-hidden rounded-2xl border border-teal-400/20 bg-gradient-to-b from-cyan-950/50 via-[var(--surface)] to-[var(--surface)] shadow-[0_0_36px_rgba(45,212,191,.08)]">
      <div className="relative flex items-center gap-3 overflow-hidden border-b border-[var(--border)] p-4">
        <div className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(90deg, ${theme.soft}, transparent 60%)` }} />
        <span className="fx-float relative flex h-11 w-11 items-center justify-center rounded-xl text-teal-200"
          style={{ background: `linear-gradient(135deg, ${theme.soft}, transparent)`, boxShadow: `0 0 22px ${theme.soft}`, color: theme.accent }}>
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-[var(--text-primary)]">{title}</h2>
          <p className="text-[11px] uppercase tracking-wider text-teal-300/80">{subject}</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
          <FlaskConical className="h-3.5 w-3.5" /> Lab
        </span>
      </div>
      <details className="border-b border-[var(--border)] px-4 py-2 text-xs text-[var(--text-secondary)]">
        <summary className="cursor-pointer text-[var(--accent)]">Teori singkat</summary>
        <p className="mt-1 leading-relaxed">{theory}</p>
      </details>
      {greeting && (
        <div className="flex items-start gap-2.5 border-b border-[var(--border)] bg-black/20 px-4 py-3">
          <Mascot mood={mascotMood} size={40} />
          <p className="rounded-xl rounded-tl-sm border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-xs leading-relaxed text-[var(--text-secondary)]">
            {greeting}
          </p>
        </div>
      )}
      {story && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-[var(--border)] px-4 py-2.5 text-[11px]">
          <ScrollText className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
          {story.map((s, i) => (
            <span key={i} className="flex shrink-0 items-center gap-1.5">
              {i > 0 && <span className="text-[var(--text-muted)]">→</span>}
              <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--text-secondary)]">
                <b style={{ color: theme.accent }}>{i + 1}.</b> {s}
              </span>
            </span>
          ))}
        </div>
      )}
      <div className="p-4">
        <div className="overflow-hidden rounded-xl border border-teal-400/15 bg-[radial-gradient(ellipse_at_top,rgba(45,212,191,.12),transparent_60%),linear-gradient(180deg,#0b1526,#0f172a)] shadow-[inset_0_0_40px_rgba(45,212,191,.06)]">
          {scene}
        </div>
        <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-3">{controls}</div>
        <div className="mt-2 font-mono text-xs text-teal-200">{stats}</div>
        <div className="mt-3 flex gap-2">
          <button onClick={onAction}
            className="flex-1 rounded-xl bg-teal-400/15 py-2 text-sm font-semibold text-teal-200 transition hover:bg-teal-400/25">
            {actionLabel}
          </button>
          <Link href="/arena" title="Tanya AI"
            className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-teal-400/40 hover:text-teal-200">
            <MessageCircleQuestion className="h-4 w-4" /> AI
          </Link>
          <button onClick={share} title="Bagikan"
            className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-teal-400/40 hover:text-teal-200">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
