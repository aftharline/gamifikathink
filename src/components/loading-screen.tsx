"use client"

import { useEffect, useState } from "react"
import { ArcReactor } from "@/components/arc-reactor"
import { randomQuote } from "@/lib/quotes"

const QUOTE_INTERVAL_MS = 3000

interface LoadingScreenProps {
  /** Label proses, mis. "Memuat riwayat". Tanpa label hanya quote */
  label?: string
  className?: string
}

export function LoadingScreen({ label, className }: LoadingScreenProps) {
  const [quote, setQuote] = useState(() => randomQuote())

  useEffect(() => {
    const id = window.setInterval(() => setQuote(randomQuote()), QUOTE_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [])

  return (
    <div
      className={
        "flex h-full min-h-56 flex-col items-center justify-center gap-4 p-6 text-center " +
        (className ?? "")
      }
    >
      <ArcReactor size="md" className="animate-pulse-glow" />
      {label && (
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
      )}
      <div className="animate-fade-in max-w-sm" key={quote.text}>
        <p className="font-display text-base leading-relaxed text-[var(--text-secondary)]">
          “{quote.text}”
        </p>
        {quote.source && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">oleh {quote.source}</p>
        )}
      </div>
    </div>
  )
}
