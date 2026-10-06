// ponytail: progress lab di localStorage (mirip flashcards.ts)
export function labKey(slug: string): string {
  return `lab-done-${slug}`
}

export function isLabDone(slug: string): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(labKey(slug)) === "done"
}

export function markLabDone(slug: string): void {
  if (typeof window === "undefined") return
  try { localStorage.setItem(labKey(slug), "done") } catch { /* ignore */ }
}

export function isLabLocked(prereq: string | undefined): boolean {
  if (!prereq) return false
  return !isLabDone(prereq)
}
