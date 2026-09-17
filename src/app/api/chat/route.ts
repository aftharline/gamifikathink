import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText, convertToModelMessages, type UIMessage } from "ai"

const PRIMARY_MODEL = "gemini-3.5-flash"

const chatanywhere = createOpenAI({
  baseURL: process.env.CHATANYWHERE_BASE_URL || "https://api.chatanywhere.tech/v1",
  apiKey: process.env.CHATANYWHERE_API_KEY,
})
const FALLBACK_MODEL = "gpt-3.5-turbo"

function getSystemPrompt(subject: string, level: string): string {
  return `Kamu adalah Game Master dari GAMIFIKATHINK, sebuah platform belajar gamifikasi.

Kelas/Jenjang: ${level}
Mata Pelajaran: ${subject}

Tugasmu:
1. Ubah soal ${subject} ini menjadi skenario naratif ala game populer (Mobile Legends, Roblox, Genshin Impact, dll).
2. Pertahankan variabel dan angka asli dari soal — jangan mengubah data matematis/fisika/kimia soal.
3. Berikan pembahasan step-by-step dari nol hingga pengguna paham.
4. Gunakan bahasa Indonesia yang santai namun tetap edukatif.
5. Format output dengan markdown yang rapi.

Struktur output wajib:
## 🎮 Skenario Game
[cerita seru yang membungkus soal]

## 📝 Soal Asli
[soal asli]

## ⚔️ Langkah Penyelesaian
[step-by-step detail]

## 💡 Jawaban Akhir
[jawaban final]`
}

interface IncomingMessage {
  role?: string
  content?: string
  parts?: Array<{ type: string; text?: string }>
}

export async function POST(req: NextRequest) {
  const { messages, subject, level, imageBase64 } = await req.json()

  const lastUserMsg = (messages?.[messages.length - 1] ?? {}) as IncomingMessage
  const userText =
    lastUserMsg.parts?.find((p) => p.type === "text")?.text ||
    lastUserMsg.content ||
    ""

  type UserContentPart = { type: "text"; text: string } | { type: "image"; image: string }
  const userContent: string | UserContentPart[] = imageBase64
    ? [
        { type: "text", text: userText || "Selesaikan soal dalam gambar ini" },
        { type: "image", image: imageBase64 },
      ]
    : userText

  const modelMessages = await convertToModelMessages(
    (messages?.slice(0, -1) ?? []) as UIMessage[]
  )
  const systemPrompt = getSystemPrompt(subject, level)

  try {
    const result = streamText({
      model: google(PRIMARY_MODEL),
      system: systemPrompt,
      messages: [
        ...modelMessages,
        { role: "user", content: userContent },
      ],
    })
    return result.toUIMessageStreamResponse({
      headers: { "x-engine-used": "primary" },
    })
  } catch (primaryError) {
    console.warn("Primary AI failed, switching to fallback:", primaryError)

    const result = streamText({
      model: chatanywhere(FALLBACK_MODEL),
      system: systemPrompt,
      messages: [
        ...modelMessages,
        { role: "user", content: userContent },
      ],
    })
    return result.toUIMessageStreamResponse({
      headers: { "x-engine-used": "fallback" },
    })
  }
}
