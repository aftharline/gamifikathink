import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { getFallbackQuestions } from "@/lib/quiz-bank"

const questionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
})

const quizSchema = z.object({
  questions: z.array(questionSchema).length(5),
})

export async function POST(req: NextRequest) {
  let subject = "Matematika"
  let level = "SMP"
  try {
    const body = await req.json()
    subject = typeof body.subject === "string" ? body.subject : subject
    level = typeof body.level === "string" ? body.level : level
  } catch {
    // body tidak wajib; pakai default
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json({ questions: getFallbackQuestions(subject) })
  }

  try {
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
      prompt: `Buat 5 soal pilihan ganda (4 opsi) untuk mata pelajaran ${subject}, jenjang ${level}.`,
    })
    return Response.json({ questions: object.questions })
  } catch (err) {
    console.error("Quiz generation failed, using fallback bank:", err)
    return Response.json({ questions: getFallbackQuestions(subject) })
  }
}
