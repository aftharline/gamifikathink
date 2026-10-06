import { describe, expect, it } from "vitest"
import {
  BANK,
  getFallbackQuestions,
  isValidQuizQuestion,
} from "@/lib/quiz-bank"
import { bankToCards } from "@/lib/flashcards"

describe("quiz-bank shape", () => {
  it("semua soal punya 4 opsi dan answerIndex valid", () => {
    for (const [subject, questions] of Object.entries(BANK)) {
      expect(questions.length, subject).toBeGreaterThan(0)
      for (const q of questions) {
        expect(q.options).toHaveLength(4)
        expect(q.answerIndex).toBeGreaterThanOrEqual(0)
        expect(q.answerIndex).toBeLessThan(4)
        expect(isValidQuizQuestion(q)).toBe(true)
      }
    }
  })

  it("fallback mengembalikan 5 soal untuk tiap subject valid", () => {
    for (const subject of Object.keys(BANK)) {
      expect(getFallbackQuestions(subject)).toHaveLength(5)
    }
  })

  it("menolak soal rusak", () => {
    expect(isValidQuizQuestion(null)).toBe(false)
    expect(isValidQuizQuestion({})).toBe(false)
    expect(
      isValidQuizQuestion({
        question: "x?",
        options: ["a", "b"],
        answerIndex: 5,
        explanation: "-",
      })
    ).toBe(false)
  })
})

describe("bankToCards", () => {
  it("belakang kartu memuat jawaban benar", () => {
    const cards = bankToCards("Matematika")
    expect(cards.length).toBeGreaterThan(0)
    const first = BANK["Matematika"][0]
    const card = cards.find((c) => c.front === first.question)
    expect(card?.back).toContain(first.options[first.answerIndex])
  })
})
