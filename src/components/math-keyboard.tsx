"use client"

import { useState } from "react"

const KEYS = ["π", "√", "²", "³", "×", "÷", "±", "≠", "≤", "≥", "∫", "∑", "∞", "θ", "λ", "Δ", "°", "frac"]

export function MathKeyboard({ onInsert }: { onInsert: (s: string) => void }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="rounded-lg px-2 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]">
        ∑ Math
      </button>
    )
  }
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2">
      {KEYS.map((k) => (
        <button
          key={k}
          onClick={() => onInsert(k === "frac" ? "\\frac{}{}" : k)}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-primary)] hover:bg-white/10"
        >
          {k}
        </button>
      ))}
      <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-xs text-[var(--text-muted)]">✕</button>
    </div>
  )
}
