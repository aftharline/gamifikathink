import { BANK, type QuizQuestion } from "@/lib/quiz-bank"

export interface FlashCard {
  front: string
  back: string
  hint?: string
}

// ponytail: tanpa tabel baru, progres deck di localStorage dulu
function deckKey(subject: string, level: string): string {
  return `flash-deck-${subject}-${level}`
}

export function isDeckReplay(subject: string, level: string): boolean {
  if (typeof window === "undefined") return false
  return window.localStorage.getItem(deckKey(subject, level)) === "done"
}

export function markDeckDone(subject: string, level: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(deckKey(subject, level), "done")
}

/** Konversi soal MCQ bank menjadi kartu: depan = pertanyaan, belakang = jawaban + penjelasan */
export function bankToCards(subject: string): FlashCard[] {
  const pool: QuizQuestion[] = BANK[subject] ?? BANK["Matematika"]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.map((q) => ({
    front: q.question,
    back: `${q.options[q.answerIndex]}\n\n${q.explanation}`,
  }))
}
