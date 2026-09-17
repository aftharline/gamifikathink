"use client"

import { cn } from "@/lib/utils"

export function ArcReactor({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const dims = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-24 w-24",
  }[size]

  return (
    <div className={cn("relative flex items-center justify-center", dims, className)}>
      {/* Outer rotating ring */}
      <div className="animate-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-teal-400/40" />
      {/* Middle counter-rotating ring */}
      <div className="animate-spin-slower absolute inset-[15%] rounded-full border border-teal-200/40" />
      {/* Inner core */}
      <div className="bg-gradient-jarvis relative h-[45%] w-[45%] rounded-full glow-cyan">
        <div className="absolute inset-0 rounded-full bg-black/40" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-300/60 to-transparent mix-blend-screen" />
      </div>
    </div>
  )
}
