"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getStreak } from "@/lib/streak"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { TutorialTour } from "@/components/tutorial-tour"
import { ensureAiAccess, consumeLocalQuota, handleGateResponse } from "@/lib/ai-gate"

interface Attempt { subject: string; score: number; total: number; mode: string; created_at: string }

export default function DashboardPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [plan, setPlan] = useState<{ day: string; topic: string; tasks: string[] }[]>([])
  const [busy, setBusy] = useState(false)
  const [streak] = useState(() => getStreak())

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from("quiz_attempts").select("subject,score,total,mode,created_at")
        .eq("user_id", user.id).order("created_at", { ascending: false }).limit(20)
        .then(({ data }) => { if (data) setAttempts(data as Attempt[]) })
      supabase.from("study_plans").select("plan").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(1).single()
        .then(({ data }) => {
          const p = (data as { plan?: { days?: { day: string; topic: string; tasks: string[] }[] } } | null)?.plan
          if (p?.days) setPlan(p.days)
        })
    }).catch(() => {})
  }, [])

  // knowledge gaps: akurasi per mapel
  const bySubject: Record<string, { got: number; tot: number }> = {}
  for (const a of attempts) {
    const s = bySubject[a.subject] ?? { got: 0, tot: 0 }
    s.got += a.score; s.tot += a.total
    bySubject[a.subject] = s
  }
  const gaps = Object.entries(bySubject)
    .map(([subject, v]) => ({ subject, acc: v.tot ? Math.round((v.got / v.tot) * 100) : 0 }))
    .sort((a, b) => a.acc - b.acc)

  const makePlan = async () => {
    // Jatah AI tamu: total 1x (login = bebas)
    const gate = await ensureAiAccess()
    if (!gate.ok) return
    if (gate.guest) consumeLocalQuota()
    setBusy(true)
    try {
      const weak = gaps.filter((g) => g.acc < 70).map((g) => g.subject)
      const res = await fetch("/api/study-plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "Ujian Semester", subject: weak[0] ?? "Matematika", level: "SMA", weakTopics: weak }),
      })
      if (handleGateResponse(res.status)) {
        setBusy(false)
        return
      }
      const r = await res.json()
      setPlan(r.days ?? [])
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from("study_plans").insert({ user_id: user.id, target: "Ujian Semester", plan: r })
    } catch { toast.error("Gagal buat rencana.") } finally { setBusy(false) }
  }

  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">📊 Dashboard + Rencana Belajar</h1>
          </div>
          <div className="glass rounded-2xl p-4 text-sm text-[var(--text-secondary)]">
            🔥 Streak: <b className="text-[var(--accent)]">{streak} hari</b> • {attempts.length} upaya tersimpan
            {attempts.length === 0 && (
              <span className="mt-1 block text-xs text-[var(--text-muted)]">
                Masuk untuk sinkron progres antar perangkat. <a href="/login" className="text-[var(--accent)] underline">Masuk</a>
              </span>
            )}
          </div>
          <div className="glass rounded-2xl p-4">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Knowledge Gaps (akurasi terendah)</h3>
            {gaps.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--text-muted)]">Belum ada data. Main Boss Battle dulu.</p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm text-[var(--text-secondary)]">
                {gaps.map((g) => (
                  <li key={g.subject} className="flex justify-between">
                    <span>{g.subject}</span>
                    <span className={g.acc < 70 ? "text-red-400" : "text-teal-300"}>{g.acc}%</span>
                  </li>
                ))}
              </ul>
            )}
            <Button onClick={makePlan} disabled={busy} className="mt-3" size="sm">
              {busy && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />} Buat Rencana 7 Hari
            </Button>
          </div>
          {plan.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">Rencana Mingguan</h3>
              <ul className="mt-2 space-y-2">
                {plan.map((d, i) => (
                  <li key={i} className="rounded-xl bg-[var(--surface-2)] p-3 text-sm">
                    <b className="text-[var(--accent)]">{d.day}</b>: {d.topic}
                    <ul className="mt-1 list-disc pl-5 text-xs text-[var(--text-secondary)]">
                      {d.tasks.map((t, j) => <li key={j}>{t}</li>)}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
      <TutorialTour tour="dashboard" />
    </div>
  )
}
