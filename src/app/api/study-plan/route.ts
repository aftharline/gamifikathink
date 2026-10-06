import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import { guardAi, gateDenied } from "@/lib/ai-guard"

const planSchema = z.object({
  days: z.array(z.object({
    day: z.string(),
    topic: z.string(),
    tasks: z.array(z.string()).min(1).max(5),
    estMinutes: z.number().int().min(10).max(180),
  })).min(3).max(14),
})

export async function POST(req: NextRequest) {
  // Jatah AI tamu: total 1x semua fitur (login = bebas)
  const gate = await guardAi(req)
  if (!gate.allowed) return gateDenied(gate.status, gate.code, gate.message)
  const headers = gate.setCookie ? { "Set-Cookie": gate.setCookie } : undefined
  const ok = <T,>(data: T) => Response.json(data, headers ? { headers } : undefined)

  let target = "UTBK"
  let level = "SMA"
  let subject = "Matematika"
  let weakTopics: string[] = []
  try {
    const b = await req.json()
    if (typeof b.target === "string") target = b.target.slice(0, 100)
    if (typeof b.level === "string") level = b.level
    if (typeof b.subject === "string") subject = b.subject
    if (Array.isArray(b.weakTopics)) weakTopics = b.weakTopics.filter((x: unknown) => typeof x === "string").slice(0, 10)
  } catch { /* defaults */ }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return ok({
      days: ["Senin", "Rabu", "Jumat"].map((day, i) => ({
        day, topic: `${subject} dasar ${i + 1}`, tasks: ["Baca ringkasan 20 mnt", "Kerjakan 10 soal"], estMinutes: 45,
      })),
      source: "fallback",
    })
  }
  try {
    const { object } = await generateObject({
      model: google("gemini-3.5-flash"),
      schema: planSchema,
      system: "Kamu perencana belajar. Bahasa Indonesia, realistis, bertahap dari mudah ke sulit.",
      prompt: `Buat rencana 7 hari untuk target ${target}, ${subject} ${level}. Topik lemah: ${weakTopics.join(", ") || "umum"}.`,
    })
    return ok({ ...object, source: "ai" })
  } catch (e) {
    console.error("study-plan failed", e)
    return ok({ days: [], source: "fallback" })
  }
}
