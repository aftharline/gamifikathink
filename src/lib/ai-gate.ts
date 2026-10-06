// Penjaga tamu terpusat: cek sesi + jatah lokal sebelum call AI.
// Dipakai semua 6 call-site AI (chat, quiz, flashcards, summarize, study-plan, widget).
import { createClient } from "@/lib/supabase/client"
import { hasLocalQuota, markLocalUsed, openLoginGate } from "@/lib/ai-quota"

export type GateResult = { ok: true; guest: boolean } | { ok: false }

/** true = boleh lanjut call AI. false = modal login dibuka, batalkan call. */
export async function ensureAiAccess(): Promise<GateResult> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return { ok: true, guest: false }
  } catch { /* anggap tamu */ }
  if (!hasLocalQuota()) {
    openLoginGate()
    return { ok: false }
  }
  return { ok: true, guest: true }
}

/** Panggil setelah AI sukses dipakai tamu (kunci jatah lokal). */
export function consumeLocalQuota(): void {
  markLocalUsed()
}

/** Peta respons 401 server -> buka modal + kunci lokal. true jika ditangani. */
export function handleGateResponse(status: number, code?: unknown): boolean {
  if (status === 401 || code === "LOGIN_REQUIRED") {
    markLocalUsed()
    openLoginGate()
    return true
  }
  return false
}
