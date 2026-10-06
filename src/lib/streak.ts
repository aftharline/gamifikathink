// ponytail: streak local-first (jalan walau guest), sync Supabase saat login
export function todayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function touchStreak(): { streak: number; isNew: boolean } {
  if (typeof window === "undefined") return { streak: 0, isNew: false }
  const today = todayKey()
  const last = localStorage.getItem("streak-last") ?? ""
  let streak = parseInt(localStorage.getItem("streak-count") ?? "0", 10) || 0
  if (last === today) return { streak, isNew: false }
  const yesterday = todayKey(new Date(Date.now() - 86400000))
  streak = last === yesterday ? streak + 1 : 1
  try {
    localStorage.setItem("streak-last", today)
    localStorage.setItem("streak-count", String(streak))
  } catch { /* ignore */ }
  // TODO upsert ke tabel streaks saat login
  return { streak, isNew: true }
}

export function getStreak(): number {
  if (typeof window === "undefined") return 0
  return parseInt(localStorage.getItem("streak-count") ?? "0", 10) || 0
}
