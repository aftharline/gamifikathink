"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogIn, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { LOGIN_GATE_EVENT } from "@/lib/ai-quota"

// Modal paksa login saat jatah AI tamu habis (atau server 401).
export function LoginGateModal() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const on = () => setOpen(true)
    window.addEventListener(LOGIN_GATE_EVENT, on)
    return () => window.removeEventListener(LOGIN_GATE_EVENT, on)
  }, [])

  if (!open) return null

  const login = async () => {
    setBusy(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch {
      setBusy(false)
      router.push("/login")
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Wajib login">
      <div className="glass fx-pop-in w-full max-w-sm rounded-3xl p-6 text-center">
        <Lock className="mx-auto h-10 w-10 text-[var(--accent)]" />
        <h2 className="mt-3 font-sans text-lg font-bold text-[var(--text-primary)]">
          Jatah coba gratis habis
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          Tamu mendapat 1x pakai AI. Masuk dengan Google untuk akses tanpa batas:
          chat, kuis, kartu, ringkasan, lab widget, dan rencana belajar.
        </p>
        <Button onClick={login} disabled={busy} className="mt-4 h-11 w-full gap-2" size="lg">
          <LogIn className="h-4 w-4" />
          {busy ? "Membuka Google..." : "Masuk dengan Google"}
        </Button>
        <button
          onClick={() => setOpen(false)}
          className="mt-2 w-full rounded-xl py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Nanti saja (fitur non-AI tetap gratis)
        </button>
      </div>
    </div>
  )
}
