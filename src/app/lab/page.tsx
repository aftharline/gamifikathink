"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Lock, FlaskConical, Check, Leaf } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { AiWidget } from "@/components/ai-widget"
import { TutorialTour } from "@/components/tutorial-tour"
import { LABS } from "@/lib/lab-catalog"
import { isLabDone, isLabLocked } from "@/lib/lab-progress"

export default function LabPage() {
  const [, setTick] = useState(0)
  const [eco, setEco] = useState(false)
  /* eslint-disable react-hooks/set-state-in-effect -- re-render sekali agar localStorage progress terbaca */
  useEffect(() => {
    setTick(1)
    try { setEco(localStorage.getItem("lab-lowfx") === "1") } catch { /* abaikan */ }
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */
  const toggleEco = () => {
    const next = !eco
    setEco(next)
    try { localStorage.setItem("lab-lowfx", next ? "1" : "0") } catch { /* abaikan */ }
  }
  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <FlaskConical className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Lab Visual Interaktif</h1>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            18 simulasi manipulatif. Geser variabel, lihat dampaknya live. Selesaikan misi untuk unlock berikutnya.
          </p>
          <button onClick={toggleEco} data-tour="lab-eco"
            className={`flex w-fit items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs ${eco ? "border-green-400/40 bg-green-400/10 text-green-200" : "border-[var(--border)] text-[var(--text-muted)]"}`}>
            <Leaf className="h-3.5 w-3.5" /> {eco ? "Hemat efek: ON" : "Hemat efek: off"}
          </button>
          <div className="grid gap-3 sm:grid-cols-2" data-tour="lab-grid">
            {LABS.map((l, i) => {
              const locked = isLabLocked(l.prereq)
              const done = isLabDone(l.slug)
              const card = (
                <div
                  className={`glass group relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${locked ? "opacity-50" : "hover:-translate-y-1 hover:border-teal-400/40 hover:shadow-[0_8px_32px_rgba(45,212,191,.15)]"}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-teal-400/10 blur-2xl transition-all group-hover:bg-teal-400/20" />
                  <l.icon className="h-7 w-7 text-teal-300 drop-shadow-[0_0_8px_rgba(45,212,191,.5)]" />
                  <h3 className="mt-2 flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
                    {l.title}
                    {locked && <Lock className="h-3.5 w-3.5" />}
                    {done && <Check className="h-3.5 w-3.5 text-teal-300" />}
                  </h3>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{l.desc}</p>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">{l.subject}{l.prereq ? ` • butuh: ${l.prereq}` : ""}</p>
                </div>
              )
              return locked ? <div key={l.slug}>{card}</div>
                : <Link key={l.slug} href={`/lab/${l.slug}`}>{card}</Link>
            })}
          </div>
          <AiWidget />
        </div>
      </main>
      <TutorialTour tour="lab" />
    </div>
  )
}
