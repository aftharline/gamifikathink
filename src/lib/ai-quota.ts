// Ponytail: jatah AI tamu = 1x total semua fitur. Cermin lokal (UX);
// penegakan final di server via guest-pass cookie (401 LOGIN_REQUIRED).

export const AI_USED_KEY = "ai-used"
export const LOGIN_GATE_EVENT = "gamifikathink:login-gate"

export function openLoginGate(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOGIN_GATE_EVENT))
  }
}

export function hasLocalQuota(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(AI_USED_KEY) !== "1"
}

export function markLocalUsed(): void {
  try {
    localStorage.setItem(AI_USED_KEY, "1")
  } catch { /* abaikan */ }
}
