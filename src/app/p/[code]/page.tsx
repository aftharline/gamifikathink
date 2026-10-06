"use client"

import { use, useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { createClient } from "@/lib/supabase/client"

export default function SharedPackPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params)
  const [data, setData] = useState<{ title?: string; payload?: unknown } | null>(null)
  useEffect(() => {
    const supabase = createClient()
    supabase.from("shared_packs").select("title,payload").eq("code", code).single()
      .then(({ data: d }) => setData(d as { title?: string; payload?: unknown } | null))
  }, [code])
  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-6">
        <div className="glass mx-auto max-w-xl rounded-2xl p-6">
          <p className="text-xs text-[var(--text-muted)]">Paket {code}</p>
          <h1 className="mt-1 text-lg font-bold text-[var(--text-primary)]">{data?.title ?? "Memuat…"}</h1>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-[var(--surface-2)] p-4 text-xs text-[var(--text-secondary)]">
            {data ? JSON.stringify(data.payload, null, 2).slice(0, 4000) : "…"}
          </pre>
        </div>
      </main>
    </div>
  )
}
