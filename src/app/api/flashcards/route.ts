import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { bankToCards } from "@/lib/flashcards"
import { guardAi, gateDenied } from "@/lib/ai-guard"

const cardSchema = z.object({
  front: z.string(),
  back: z.string(),
  hint: z.string(),
})

const deckSchema = z.object({
  cards: z.array(cardSchema).min(5).max(10),
})

const DECK_SIZE = 8

export async function POST(req: NextRequest) {
  // Jatah AI tamu: total 1x semua fitur (login = bebas)
  const gate = await guardAi(req)
  if (!gate.allowed) return gateDenied(gate.status, gate.code, gate.message)
  const headers = gate.setCookie ? { "Set-Cookie": gate.setCookie } : undefined
  const ok = <T,>(data: T) => Response.json(data, headers ? { headers } : undefined)

  let subject = "Matematika"
  let level = "SMP"
  let sourceText: string | null = null
  try {
    const body = await req.json()
    subject = typeof body.subject === "string" ? body.subject : subject
    level = typeof body.level === "string" ? body.level : level
    if (typeof body.sourceText === "string" && body.sourceText.length > 50) {
      sourceText = body.sourceText.slice(0, 12000)
    }
  } catch {
    // body tidak wajib; pakai default
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return ok({ cards: bankToCards(subject), source: "bank" })
  }

  try {
    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: deckSchema,
      system: [
        "Kamu adalah pembuat kartu mantra (flashcard) untuk game belajar.",
        "Selalu berbahasa Indonesia.",
        "Front: istilah, pertanyaan, atau soal singkat. Back: jawaban + penjelasan 1-2 kalimat.",
        "Hint: petunjuk kecil tanpa membocorkan jawaban.",
        "Semua rumus WAJIB LaTeX dengan delimiter $...$ (inline) atau $$...$$ (display).",
        "Buat kartu bervariasi dari mudah ke menantang.",
      ].join(" "),
      prompt: sourceText
        ? `Berdasarkan materi ini:\n${sourceText}\n\nBuat ${DECK_SIZE} kartu flashcard untuk ${subject}, ${level}.`
        : `Buat ${DECK_SIZE} kartu flashcard untuk mata pelajaran ${subject}, jenjang ${level}.`,
    })
    return ok({ cards: object.cards, source: "ai" })
  } catch (err) {
    console.error("Flashcard generation failed, using question bank:", err)
    return ok({ cards: bankToCards(subject), source: "bank" })
  }
}
