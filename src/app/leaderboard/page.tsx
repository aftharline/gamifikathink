"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { createClient } from "@/lib/supabase/client"
import { TutorialTour } from "@/components/tutorial-tour"

interface Row { display_name: string | null; email: string | null; xp: number; level: number }

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([])
  useEffect(() => {
    const supabase = createClient()
    supabase.from("profiles").select("display_name,email,xp,level")
      .order("level", { ascending: false }).order("xp", { ascending: false }).limit(20)
      .then(({ data }) => { if (data) setRows(data as Row[]) })
  }, [])
  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-md">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">🏆 Leaderboard</h1>
          </div>
          <div className="mt-4 space-y-2">
            {rows.length === 0 && (
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-xs text-[var(--text-muted)]">
                  Belum ada data (perlu login + main untuk isi XP).
                </p>
                <a href="/login" className="mt-2 inline-block rounded-xl bg-[var(--accent)]/15 px-4 py-2 text-xs font-semibold text-[var(--accent)]">
                  Masuk dengan Google
                </a>
              </div>
            )}
            {rows.map((r, i) => (
              <div key={i} className="glass flex items-center justify-between rounded-xl px-4 py-2.5 text-sm">
                <span className="text-[var(--text-secondary)]">
                  #{i + 1} {r.display_name ?? r.email ?? "Warrior"}
                </span>
                <span className="text-[var(--accent)]">Lv {r.level} • {r.xp} XP</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <TutorialTour tour="leaderboard" />
    </div>
  )
}
