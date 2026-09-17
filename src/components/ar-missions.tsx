"use client"

import { CheckCircle2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ArMission } from "@/hooks/use-ar-missions"

export function ArMissions({ missions }: { missions: ArMission[] }) {
  return (
    <div className="glass mt-4 rounded-2xl p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
        Misi AR — klaim XP 1x sehari
      </p>
      <div className="space-y-2">
        {missions.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
              m.done ? "bg-emerald-500/10" : "bg-white/[0.03]"
            )}
          >
            {m.done ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-[var(--text-muted)]" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {m.title}
              </p>
              <p className="truncate text-xs text-[var(--text-secondary)]">
                {m.desc}
              </p>
            </div>
            {m.done ? (
              <span className="shrink-0 rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
                Selesai
              </span>
            ) : (
              <span className="shrink-0 rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] font-bold text-[var(--accent)]">
                +{m.xp} XP
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
