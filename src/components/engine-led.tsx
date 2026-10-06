"use client"

import { cn } from "@/lib/utils"

interface EngineLEDProps {
  engine: "gemini" | "chatanywhere"
  size?: "sm" | "md"
  showLabel?: boolean
  className?: string
}

const ENGINE_INFO = {
  gemini: { color: "bg-teal-400", label: "Gemini", name: "Gemini 3.5 Flash" },
  chatanywhere: { color: "bg-[var(--gold)]", label: "ChatAnywhere", name: "ChatAnywhere GPT-3.5" },
} as const

export function EngineLED({ engine, size = "sm", showLabel = false, className }: EngineLEDProps) {
  const info = ENGINE_INFO[engine]
  const dotSize = size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("relative flex", dotSize)}>
        <span className={cn("relative inline-flex h-full w-full rounded-full", info.color)} />
      </span>
      {showLabel && (
        <span className="text-xs text-[var(--text-secondary)]">
          {info.label}
        </span>
      )}
    </span>
  )
}
