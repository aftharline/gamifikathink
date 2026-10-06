// ponytail: SM-2 lazy: localStorage dulu, sync Supabase fire-and-forget saat login
function hash(s: string): string {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return `c${Math.abs(h).toString(36)}`
}

interface SrsRow { interval: number; nextDue: number; ease: number }

function key(subject: string, front: string): string {
  return `srs-${subject}-${hash(front)}`
}

export function getDueCards<T extends { front: string }>(cards: T[], subject: string): T[] {
  if (typeof window === "undefined") return cards
  const now = Date.now()
  const due = cards.filter((c) => {
    try {
      const raw = localStorage.getItem(key(subject, c.front))
      if (!raw) return true
      return (JSON.parse(raw) as SrsRow).nextDue <= now
    } catch { return true }
  })
  return due.length > 0 ? due : cards
}

export function gradeSrs(subject: string, front: string, remembered: boolean): void {
  if (typeof window === "undefined") return
  let row: SrsRow = { interval: 1, nextDue: Date.now(), ease: 2.5 }
  try {
    const raw = localStorage.getItem(key(subject, front))
    if (raw) row = JSON.parse(raw) as SrsRow
  } catch { /* reset */ }
  if (remembered) {
    row.interval = row.interval === 1 ? 3 : Math.min(30, Math.round(row.interval * row.ease))
    row.ease = Math.min(3, row.ease + 0.1)
  } else {
    row.interval = 1
    row.ease = Math.max(1.3, row.ease - 0.2)
  }
  row.nextDue = Date.now() + row.interval * 86400000
  try { localStorage.setItem(key(subject, front), JSON.stringify(row)) } catch { /* quota */ }
  // TODO sync ke tabel reviews saat user login (fire-and-forget)
}
