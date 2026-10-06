"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Loader2, LogIn, Swords } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BackgroundFX } from "@/components/background-fx"
import { createClient } from "@/lib/supabase/client"

function LoginInner() {
  const router = useRouter()
  const search = useSearchParams()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  /* eslint-disable react-hooks/set-state-in-effect -- inisialisasi status login sekali saat mount */
  useEffect(() => {
    if (search.get("error")) setError("Login gagal. Coba lagi atau main sebagai tamu.")
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace("/arena")
    }).catch(() => {})
  }, [supabase, router, search])
  /* eslint-enable react-hooks/set-state-in-effect */

  const loginGoogle = async () => {
    setBusy(true)
    setError(null)
    try {
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (err) throw err
    } catch {
      setError("Tidak bisa membuka Google. Cek koneksi atau main sebagai tamu.")
      setBusy(false)
    }
  }

  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden p-4">
      <BackgroundFX />
      <div className="glass relative z-10 w-full max-w-sm rounded-3xl p-6 text-center">
        <Image src="/logo.svg" alt="GAMIFIKATHINK" width={56} height={56} className="glow-drop-cyan mx-auto h-14 w-14" />
        <h1 className="mt-3 font-sans text-xl font-bold text-[var(--text-primary)]">
          Masuk <span className="font-display text-gradient">Warrior</span>
        </h1>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-secondary)]">
          Simpan XP, streak, dan riwayat antar perangkat. Tanpa login pun tetap bisa main penuh sebagai tamu.
        </p>
        {error && (
          <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 text-xs text-red-300">
            {error}
          </p>
        )}
        <Button onClick={loginGoogle} disabled={busy} className="mt-4 h-11 w-full gap-2" size="lg">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          Masuk dengan Google
        </Button>
        <Button variant="ghost" className="mt-2 w-full gap-2" onClick={() => router.push("/arena")}>
          <Swords className="h-4 w-4" />
          Main sebagai tamu
        </Button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  )
}
