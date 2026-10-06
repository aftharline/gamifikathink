import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  readGuestPass,
  consumeGuestPass,
  guestPassRateOk,
} from "@/lib/guest-pass"

export type GuardResult =
  | { allowed: true; setCookie?: string }
  | { allowed: false; status: number; code: string; message: string }

/**
 * Jatah AI tamu: total 1x semua fitur. Login = bebas.
 * Tamu pertama kali: jatah dikonsumsi atomik (cookie used=1) + rate-limit IP.
 */
export async function guardAi(req: NextRequest): Promise<GuardResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return { allowed: true }

  const status = readGuestPass(req.headers.get("cookie"))
  if (status === "fresh") {
    return { allowed: true, setCookie: consumeGuestPass() }
  }
  if (status === "none") {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown"
    if (!guestPassRateOk(ip)) {
      return { allowed: false, status: 429, code: "RATE_LIMITED", message: "Terlalu banyak percobaan. Coba lagi nanti atau masuk." }
    }
    return { allowed: true, setCookie: consumeGuestPass() }
  }
  // used | no-secret -> wajib login (fail-closed untuk tamu)
  return {
    allowed: false,
    status: 401,
    code: "LOGIN_REQUIRED",
    message: "Jatah coba gratis habis. Masuk untuk akses AI tanpa batas.",
  }
}

export function gateDenied(status: number, code: string, message: string): Response {
  return Response.json({ code, message }, { status })
}
