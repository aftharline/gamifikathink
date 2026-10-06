import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { extractWidgetHtml } from "@/lib/widget"
import { guardAi, gateDenied } from "@/lib/ai-guard"

export async function POST(req: NextRequest) {
  // Jatah AI tamu: total 1x semua fitur (login = bebas)
  const gate = await guardAi(req)
  if (!gate.allowed) return gateDenied(gate.status, gate.code, gate.message)
  const headers = gate.setCookie ? { "Set-Cookie": gate.setCookie } : undefined
  const ok = <T,>(data: T) => Response.json(data, headers ? { headers } : undefined)

  let topic = ""
  try {
    const b = await req.json()
    if (typeof b.topic === "string") topic = b.topic.slice(0, 200)
  } catch {
    return Response.json({ code: "BAD_REQUEST", message: "Body tidak valid." }, { status: 400 })
  }
  if (topic.trim().length < 3) {
    return Response.json({ code: "TOO_SHORT", message: "Topik minimal 3 huruf." }, { status: 400 })
  }
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return Response.json(
      { code: "NO_KEY", message: "AI key belum dipasang. Pakai template offline di bawah.", title: topic, html: "" },
      { status: 503 }
    )
  }

  const system = [
    "Kamu pembuat widget belajar interaktif satu-file HTML.",
    "Hanya inline <style> dan <script> tanpa src eksternal, tanpa fetch/XHR/eval/iframe.",
    "Bahasa Indonesia, maks 10000 karakter.",
    "Balas HANYA blok ```html ... ``` tanpa penjelasan lain.",
  ].join(" ")

  async function attempt(concise: boolean): Promise<string> {
    const { text } = await generateText({
      model: google("gemini-3.5-flash"),
      system,
      prompt: `Buatkan mini-aplikasi interaktif untuk topik: ${topic}.${concise ? " WAJIB ringkas, di bawah 6000 karakter." : ""}`,
    })
    return text
  }

  try {
    let raw = await attempt(false)
    let html = extractWidgetHtml(raw)
    if (!html || html.length < 100) throw new Error("empty")
    if (raw.length > 12000) {
      // retry sekali versi ringkas
      raw = await attempt(true)
      html = extractWidgetHtml(raw)
    }
    if (!html || html.length < 100) throw new Error("empty")
    return ok({ title: topic, html, source: "ai" })
  } catch (e) {
    console.error("widget failed", e)
    return Response.json(
      {
        code: "AI_ERROR",
        message: "AI gagal generate. Coba lagi atau pakai template offline.",
        title: topic,
        html: "",
      },
      { status: 500 }
    )
  }
}
