"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { Boxes } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { ArModelCard } from "@/components/ar-model-card"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { AR_MODELS, AR_SUBJECTS } from "@/lib/ar-catalog"
import { sfx } from "@/lib/feedback"
import { cn } from "@/lib/utils"

export default function ArLabPage() {
  const [subject, setSubject] = useState<string>("Semua")

  const filtered =
    subject === "Semua"
      ? AR_MODELS
      : AR_MODELS.filter((m) => m.subject === subject)

  return (
    <div className="relative flex h-screen overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-center p-4 pb-0 lg:hidden">
          <MobileMenuTrigger />
        </div>
        <div className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-6">
          <h1 className="flex items-center gap-3 font-sans text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            <Boxes className="h-7 w-7 text-[var(--accent)]" />
            AR LAB
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
            Putar objek 3D langsung di sini, ketuk titik bernomor untuk
            penjelasannya, lalu tekan <strong>Lihat di AR</strong> untuk
            menempatkan model asli di mejamu. Interaksi hotspot & kuis ada di
            mode 3D — mode AR hanya menampilkan model.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["Semua", ...AR_SUBJECTS].map((s) => (
              <button
                key={s}
                onClick={() => {
                  sfx.click()
                  setSubject(s)
                }}
                className={cn(
                  "glass rounded-xl px-4 py-2 text-sm transition-all",
                  subject === s
                    ? "border-l-2 border-l-[var(--accent)] glow-cyan text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:border-[var(--border-strong)]"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <ArModelCard key={m.id} model={m} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-center text-sm text-[var(--text-muted)]">
              Belum ada model untuk mapel ini.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
