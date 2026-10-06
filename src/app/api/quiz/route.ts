import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { getFallbackQuestions } from "@/lib/quiz-bank"
import { guardAi, gateDenied } from "@/lib/ai-guard"

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).min(2).max(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
})

const tfSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(2),
  answerIndex: z.number().int().min(0).max(1),
  explanation: z.string(),
})

export async function POST(req: NextRequest) {
  // Jatah AI tamu: total 1x semua fitur (login = bebas)
  const gate = await guardAi(req)
  if (!gate.allowed) return gateDenied(gate.status, gate.code, gate.message)
  const headers = gate.setCookie ? { "Set-Cookie": gate.setCookie } : undefined
  const ok = <T,>(data: T) => Response.json(data, headers ? { headers } : undefined)

  let subject = "Matematika"
  let level = "SMP"
  let count = 5
  let type: "mcq" | "tf" = "mcq"
  let difficulty = "standar"
  let sourceText: string | null = null
  try {
    const body = await req.json()
    subject = typeof body.subject === "string" ? body.subject : subject
    level = typeof body.level === "string" ? body.level : level
    if (typeof body.count === "number" && body.count >= 3 && body.count <= 20) count = Math.floor(body.count)
    if (body.type === "tf") type = "tf"
    if (typeof body.difficulty === "string") difficulty = body.difficulty.slice(0, 20)
    if (typeof body.sourceText === "string" && body.sourceText.length > 50) {
      sourceText = body.sourceText.slice(0, 12000)
    }
  } catch {
    // body tidak wajib; pakai default
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return ok({ questions: getFallbackQuestions(subject).slice(0, Math.min(count, 5)) })
  }

  try {
    if (type === "tf") {
      const { object } = await generateObject({
        model: google("gemini-3.5-flash"),
        schema: z.object({ questions: z.array(tfSchema).min(3).max(20) }),
        system: "Kamu pembuat kuis Benar/Salah. Bahasa Indonesia. Opsi harus ['Benar','Salah'].",
        prompt: sourceText
          ? `Berdasarkan materi ini:\n${sourceText}\n\nBuat ${count} soal Benar/Salah (${subject}, ${level}, kesulitan ${difficulty}).`
          : `Buat ${count} soal Benar/Salah untuk ${subject}, jenjang ${level}, kesulitan ${difficulty}.`,
      })
      return ok({ questions: object.questions })
    }
    const quizSchema = z.object({ questions: z.array(questionSchema).min(3).max(20) })
    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: quizSchema,
      system: [
        "Kamu adalah pembuat soal kuis pelajaran untuk game Boss Battle.",
        "Selalu berbahasa Indonesia.",
        "Buat soal yang mendidik, jelas, dan sesuai jenjang siswa.",
        "Posisi jawaban benar (answerIndex) harus bervariasi, jangan selalu sama.",
        "Explanation harus singkat, jelas, dan mengajarkan konsep.",
      ].join(" "),
      prompt: sourceText
        ? `Berdasarkan materi ini:\n${sourceText}\n\nBuat ${count} soal pilihan ganda (4 opsi) untuk ${subject}, ${level}, kesulitan ${difficulty}.`
        : `Buat ${count} soal pilihan ganda (4 opsi) untuk mata pelajaran ${subject}, jenjang ${level}, kesulitan ${difficulty}.`,
    })
    return ok({ questions: object.questions })
  } catch (err) {
    console.error("Quiz generation failed, using fallback bank:", err)
    return ok({ questions: getFallbackQuestions(subject) })
  }
}
