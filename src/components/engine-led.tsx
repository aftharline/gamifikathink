"use client"

import { cn } from "@/lib/utils"

interface EngineLEDProps {
  engine: "primary" | "fallback"
  size?: "sm" | "md"
  showLabel?: boolean
  className?: string
}

const ENGINE_INFO = {
  primary: { color: "bg-teal-400", label: "GEMINI-3.5.FLASH", name: "Gemini 3.5 Flash" },
  fallback: { color: "bg-[var(--gold)]", label: "GPT-3.5", name: "GPT-3.5" },
} as const

export function EngineLED({ engine, size = "sm", showLabel = false, className }: EngineLEDProps) {
  const info = ENGINE_INFO[engine]
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("relative flex", dotSize)}>
        <span className={cn("animate-pulse-glow absolute inline-flex h-full w-full rounded-full opacity-60", info.color)} />
        <span className={cn("relative inline-flex h-full w-full rounded-full", info.color)} />
      </span>
      {showLabel && (
        <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          {info.label}
        </span>
      )}
    </span>
  )
}
