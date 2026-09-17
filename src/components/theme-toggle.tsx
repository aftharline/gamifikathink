"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical next-themes hydration guard
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={cn("h-8 w-8", className)} />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-[var(--text-muted)] transition-all duration-300 hover:border-[var(--border)] hover:text-[var(--accent)] hover:glow-cyan",
        className
      )}
    >
      <span
        className={cn(
          "transition-transform duration-300",
          isDark ? "rotate-0" : "rotate-180"
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </span>
    </button>
  )
}
