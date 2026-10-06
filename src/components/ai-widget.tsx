"use client"

import { useState } from "react"
import { Loader2, Wand2, RotateCcw, LayoutTemplate } from "lucide-react"
import { toast } from "sonner"
import { WIDGET_TEMPLATES } from "@/lib/widget-templates"
import { ensureAiAccess, consumeLocalQuota, handleGateResponse } from "@/lib/ai-gate"

type Status = "idle" | "loading" | "ai" | "error"

export function AiWidget() {
  const [topic, setTopic] = useState("")
  const [html, setHtml] = useState("")
  const [title, setTitle] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState("")
  const [showTemplates, setShowTemplates] = useState(false)
  const busy = status === "loading"

  const gen = async () => {
    if (topic.trim().length < 3) { toast.error("Topik minimal 3 huruf"); return }
    // Jatah AI tamu: total 1x (login = bebas)
    const gate = await ensureAiAccess()
    if (!gate.ok) return
    if (gate.guest) consumeLocalQuota()
    setStatus("loading")
    setError("")
    try {
      const res = await fetch("/api/widget", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      })
      if (handleGateResponse(res.status)) {
        setStatus("error")
        setError("Jatah coba gratis habis. Masuk untuk lanjut.")
        setShowTemplates(true)
        return
      }
      const r = await res.json()
      if (r.html) {
        setHtml(r.html)
        setTitle(r.title ?? topic)
        setStatus("ai")
        setShowTemplates(false)
      } else {
        setError(r.message ?? "Gagal generate.")
        setStatus("error")
        setShowTemplates(true)
      }
    } catch {
      setError("Jaringan bermasalah.")
      setStatus("error")
      setShowTemplates(true)
    }
  }

  const applyTemplate = (id: string) => {
    const t = WIDGET_TEMPLATES.find((x) => x.id === id)
    if (!t) return
    setHtml(t.html)
    setTitle(`${t.title} (offline)`)
    setStatus("ai")
  }

  return (
    <div className="glass rounded-2xl p-4">
      <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)]">
        <Wand2 className="h-4 w-4 text-[var(--accent)]" /> Mini-app AI
      </h3>
      <div className="mt-2 flex gap-2">
        <input value={topic} onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void gen() }}
          placeholder="cth: simulasi fotosintesis interaktif"
          className="flex-1 rounded-xl bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none" />
        <button onClick={gen} disabled={busy}
          className="flex items-center gap-1.5 rounded-xl bg-[var(--accent)]/15 px-4 py-2 text-sm text-[var(--accent)] disabled:opacity-40">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : status === "error" ? <RotateCcw className="h-4 w-4" /> : <Wand2 className="h-4 w-4" />}
          {busy ? "Membuat..." : status === "error" ? "Coba lagi" : "Buat"}
        </button>
      </div>
      {busy && <p className="mt-2 text-xs text-[var(--text-muted)]">AI meracik widget... (maks ~60 dtk)</p>}
      {status === "error" && (
        <p className="mt-2 text-xs text-red-300">{error} Pilih template offline di bawah.</p>
      )}
      {(showTemplates || status === "error") && (
        <div className="mt-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)]">
            <LayoutTemplate className="h-3.5 w-3.5" /> Template offline (tanpa AI)
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {WIDGET_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => applyTemplate(t.id)}
                className="rounded-xl border border-[var(--border)] p-3 text-left hover:border-[var(--accent)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">{t.title}</span>
                <span className="mt-0.5 block text-[11px] text-[var(--text-muted)]">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {html && (
        <div className="mt-3">
          <p className="mb-1 text-xs text-[var(--text-muted)]">{title} (sandbox, aman)</p>
          <iframe title={title} sandbox="allow-scripts" srcDoc={html}
            className="h-72 w-full rounded-xl border border-[var(--border)] bg-white" />
        </div>
      )}
    </div>
  )
}
