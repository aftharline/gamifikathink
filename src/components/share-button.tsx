"use client"

import { useState } from "react"
import { Share2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ShareButton({ title, payload }: { title: string; payload: unknown }) {
  const [busy, setBusy] = useState(false)
  const share = async () => {
    setBusy(true)
    try {
      const r = await fetch("/api/share", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, payload }),
      }).then((x) => x.json())
      if (!r.code) throw new Error()
      const url = `${location.origin}/p/${r.code}`
      await navigator.clipboard.writeText(url).catch(() => {})
      toast.success(`Link paket: ${url} (tersalin)`)
    } catch {
      toast.error("Gagal share. Jalankan supabase-astra.sql dulu.")
    } finally {
      setBusy(false)
    }
  }
  return (
    <button onClick={share} disabled={busy} className="glass rounded-xl px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Share2 className="h-3.5 w-3.5" />}
      <span className="ml-1">Share</span>
    </button>
  )
}
