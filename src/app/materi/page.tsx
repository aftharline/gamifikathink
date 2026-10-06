"use client"

import { useState } from "react"
import Link from "next/link"
import { Loader2, Sparkles, Play, Square, Layers, Swords } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { MaterialUpload } from "@/components/material-upload"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { TutorialTour } from "@/components/tutorial-tour"
import { ensureAiAccess, consumeLocalQuota, handleGateResponse } from "@/lib/ai-gate"

export default function MateriPage() {
  const [title, setTitle] = useState("")
  const [rawText, setRawText] = useState("")
  const [summary, setSummary] = useState("")
  const [points, setPoints] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const summarize = async () => {
    if (rawText.trim().length < 100) {
      toast.error("Teks minimal 100 karakter.")
      return
    }
    // Jatah AI tamu: total 1x (login = bebas)
    const gate = await ensureAiAccess()
    if (!gate.ok) return
    if (gate.guest) consumeLocalQuota()
    setBusy(true)
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, subject: "Umum", level: "SMA" }),
      })
      if (handleGateResponse(res.status)) {
        setBusy(false)
        return
      }
      const r = await res.json()
      setSummary(r.summary ?? "")
      setPoints(r.keyPoints ?? [])
      // simpan opsional (guest-safe)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await supabase.from("study_materials").insert({
            user_id: user.id, title: title || "Materi tanpa judul",
            content_text: rawText.slice(0, 15000), summary: r.summary ?? "",
          })
        }
      } catch { /* guest */ }
    } catch {
      toast.error("Gagal meringkas.")
    } finally {
      setBusy(false)
    }
  }

  const speak = () => {
    if (speaking) {
      speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const text = summary || rawText
    if (!text) return
    const u = new SpeechSynthesisUtterance(text.slice(0, 2000))
    u.lang = "id-ID"
    u.onend = () => setSpeaking(false)
    speechSynthesis.speak(u)
    setSpeaking(true)
  }

  const toQuery = encodeURIComponent(rawText.slice(0, 12000))

  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Materi Otomatis + Podcast</h1>
          </div>
          <MaterialUpload onText={(t, name) => { setRawText(t); setTitle(name); toast.success("Teks terekstrak, klik Ringkas.") }} />
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul materi…"
            className="glass w-full rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] outline-none"
          />
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste teks materi di sini, atau upload PDF di atas…"
            rows={8}
            className="glass w-full rounded-2xl p-4 text-sm text-[var(--text-primary)] outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={summarize} disabled={busy}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1 h-4 w-4" />}
              Ringkas AI
            </Button>
            <Button variant="outline" onClick={speak} disabled={!summary && !rawText}>
              {speaking ? <Square className="mr-1 h-4 w-4" /> : <Play className="mr-1 h-4 w-4" />}
              {speaking ? "Stop Podcast" : "Putar Podcast (gratis)"}
            </Button>
          </div>
          {summary && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-sm font-bold text-[var(--accent)]">Ringkasan</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{summary}</p>
              {points.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--text-secondary)]">
                  {points.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              )}
              <div className="mt-4 flex gap-2">
                <Link href={`/kartu?src=${toQuery}`} className="glass rounded-xl px-4 py-2 text-xs text-[var(--accent)]">
                  <Layers className="mr-1 inline h-3.5 w-3.5" />Jadi Kartu
                </Link>
                <Link href={`/kuis?src=${toQuery}`} className="glass rounded-xl px-4 py-2 text-xs text-[var(--accent)]">
                  <Swords className="mr-1 inline h-3.5 w-3.5" />Jadi Kuis
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <TutorialTour tour="materi" />
    </div>
  )
}
