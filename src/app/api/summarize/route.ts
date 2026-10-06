import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { guardAi, gateDenied } from "@/lib/ai-guard"

const summarySchema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()).min(3).max(8),
  flashcards_hint: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // Jatah AI tamu: total 1x semua fitur (login = bebas)
  const gate = await guardAi(req)
  if (!gate.allowed) return gateDenied(gate.status, gate.code, gate.message)
  const headers = gate.setCookie ? { "Set-Cookie": gate.setCookie } : undefined
  const ok = <T,>(data: T) => Response.json(data, headers ? { headers } : undefined)

  let text = ""
  let subject = "Matematika"
  let level = "SMA"
  try {
    const body = await req.json()
    if (typeof body.text === "string") text = body.text.slice(0, 15000)
    if (typeof body.subject === "string") subject = body.subject
    if (typeof body.level === "string") level = body.level
  } catch {
    return Response.json({ code: "BAD_REQUEST" }, { status: 400 })
  }
  if (text.length < 100) {
    return Response.json({ code: "TOO_SHORT", message: "Teks terlalu pendek (min 100 char)." }, { status: 400 })
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    // fallback lazy: potong 5 paragraf pertama
    const paras = text.split(/\n+/).filter(Boolean).slice(0, 5)
    return ok({
      summary: paras.join("\n\n").slice(0, 2000),
      keyPoints: paras.slice(0, 5),
      source: "fallback",
    })
  }
  try {
    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: summarySchema,
      system: "Kamu peringkas materi belajar. Bahasa Indonesia, padat, terstruktur, sesuai jenjang.",
      prompt: `Ringkas materi ${subject} (${level}) berikut menjadi ringkasan + poin penting:\n\n${text}`,
    })
    return ok({ ...object, source: "ai" })
  } catch (e) {
    console.error("summarize failed", e)
    return ok({ summary: text.slice(0, 2000), keyPoints: [], source: "fallback" })
  }
}
