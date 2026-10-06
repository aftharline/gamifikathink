import { createHmac, timingSafeEqual } from "node:crypto"

// Pass tamu sekali pakai, stateless, signed HMAC (httpOnly cookie).
// Format: v1.<issuedAtMs>.<used> . <sigHex>

const COOKIE = "gt_pass"
const TTL_MS = 24 * 3600 * 1000

function secret(): string | null {
  const s = process.env.GUEST_PASS_SECRET
  return s && s.length >= 16 ? s : null
}

function sign(payload: string): string {
  return createHmac("sha256", secret()!).update(payload).digest("hex")
}

function parse(raw: string | undefined): { payload: string; used: boolean } | null {
  if (!raw) return null
  const dot = raw.lastIndexOf(".")
  if (dot < 0) return null
  const payload = raw.slice(0, dot)
  const sig = raw.slice(dot + 1)
  const sec = secret()
  if (!sec) return null
  const a = Buffer.from(sig, "utf8")
  const b = Buffer.from(sign(payload), "utf8")
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  const parts = payload.split(".")
  if (parts.length !== 3 || parts[0] !== "v1") return null
  const issued = Number(parts[1])
  if (!Number.isFinite(issued) || Date.now() - issued > TTL_MS) return null
  return { payload, used: parts[2] === "1" }
}

function cookieStr(value: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : ""
  return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=86400`
}

export const GUEST_PASS_COOKIE = COOKIE

export function readGuestPass(cookieHeader: string | null): "none" | "fresh" | "used" | "no-secret" {
  if (!secret()) return "no-secret"
  if (!cookieHeader) return "none"
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`))
  const p = parse(m?.[1])
  if (!p) return "none"
  return p.used ? "used" : "fresh"
}

/** Terbitkan pass baru (set-cookie). */
export function issueGuestPass(): string {
  const payload = `v1.${Date.now()}.0`
  return cookieStr(`${payload}.${sign(payload)}`)
}

/** Tandai pass terpakai (set-cookie). */
export function consumeGuestPass(): string {
  const payload = `v1.${Date.now()}.1`
  return cookieStr(`${payload}.${sign(payload)}`)
}

// Backstop rate-limit issuance per IP (in-memory; longgar 20/jam).
const hits = new Map<string, { n: number; reset: number }>()

export function guestPassRateOk(ip: string): boolean {
  const now = Date.now()
  const row = hits.get(ip)
  if (!row || now > row.reset) {
    hits.set(ip, { n: 1, reset: now + 3600_000 })
    return true
  }
  row.n++
  return row.n <= 20
}
