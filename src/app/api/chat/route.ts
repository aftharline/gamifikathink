import { NextRequest } from "next/server"
import { google } from "@ai-sdk/google"
import { createOpenAI } from "@ai-sdk/openai"
import { guardAi, gateDenied } from "@/lib/ai-guard"
import { streamText, convertToModelMessages, type UIMessage } from "ai"

const GEMINI_MODEL = "gemini-3.5-flash"
const TEXT_MODEL = "gpt-3.5-turbo"
// ponytail: gpt-3.5-turbo tidak support vision, fallback gambar wajib model vision
const VISION_FALLBACK_MODEL = "gpt-4o-mini"

const chatanywhere = createOpenAI({
  baseURL: process.env.CHATANYWHERE_BASE_URL || "https://api.chatanywhere.tech/v1",
  apiKey: process.env.CHATANYWHERE_API_KEY,
})

type Engine = "gemini" | "chatanywhere"

function streamErrorMessage(error: unknown): string {
  if (isChatAnywhereAuthError(error)) {
    return "CHATANYWHERE_AUTH: Kunci ChatAnywhere bermasalah. Coba lagi via Gemini."
  }
  const msg = error instanceof Error ? error.message : String(error ?? "")
  return `AI_ERROR: ${msg}`.slice(0, 500)
}

// Batas longgar untuk data URL gambar (~6MB biner); klien sudah membatasi 4MB
const MAX_IMAGE_CHARS = 8_000_000

function isChatAnywhereAuthError(err: unknown): boolean {
  const e = err as {
    statusCode?: number
    data?: { error?: { type?: string; code?: string; message?: string } }
    message?: string
  }
  if (e?.statusCode === 401 || e?.statusCode === 403) return true
  const inner = e?.data?.error
  if (inner?.type === "chatanywhere_error") return true
  const msg = `${inner?.code ?? ""} ${inner?.message ?? ""} ${e?.message ?? ""}`
  return /ApiKey.*(失效|invalid|expired)|403 FORBIDDEN|chatanywhere/i.test(msg)
}

export type ChatMode = "solve" | "socratic" | "recall" | "oral"

function getSystemPrompt(subject: string, level: string, mode: ChatMode = "solve"): string {
  const base = `Kamu adalah Game Master dari GAMIFIKATHINK, sebuah platform belajar gamifikasi.

Kelas/Jenjang: ${level}
Mata Pelajaran: ${subject}
`
  const latex = `Semua rumus matematika/fisika/kimia WAJIB dalam LaTeX: inline $...$ untuk rumus dalam kalimat, display $$...$$ untuk persamaan penting. Jangan tulis rumus polosan seperti x^2 tanpa delimiter. Hanya pakai delimiter $, jangan pakai \\(...\\) atau \\[...\\].`
  const scenario = `Ubah soal ${subject} ini menjadi skenario naratif ala game populer (Mobile Legends, Roblox, Genshin Impact, dll). Pertahankan variabel dan angka asli soal. Gunakan bahasa Indonesia santai namun edukatif. Format markdown rapi.`

  if (mode === "socratic") {
    return `${base}
${latex}
GAYA: Socratic Mode. JANGAN langsung beri jawaban akhir. Pandu dengan 1-2 pertanyaan pemancing + 1 hint per giliran. Tunggu jawaban user sebelum lanjut. Jika user menjawab benar, apresiasi lalu lanjut ke langkah berikutnya. Jika salah, beri petunjuk tanpa membocorkan jawaban.
${scenario}

Struktur output:
## 🎮 Skenario Game
[cerita singkat]
## ❓ Pertanyaan Pemancing
[1-2 pertanyaan]
## 💡 Hint
[petunjuk tanpa jawaban langsung]`
  }
  if (mode === "recall") {
    return `${base}
${latex}
GAYA: Active Recall. UJI user dulu sebelum menjelaskan: ajukan 1 pertanyaan kunci tentang konsep, minta user jawab dari ingatan. Setelah user menjawab (atau menyerah dengan kata "nyerah"/"jawab"), baru berikan pembahasan step-by-step lengkap.
${scenario}

Struktur output tahap uji:
## 🧠 Uji Ingatan
[1 pertanyaan kunci]
Setelah user menjawab, lanjut dengan struktur solve lengkap.`
  }
  if (mode === "oral") {
    return `${base}
${latex}
GAYA: Ujian Lisan AI. Kamu penguji yang ketat namun suportif. Ajukan SATU pertanyaan lisan per giliran sesuai jenjang ${level}. Tunggu jawaban user. Nilai jawaban (skor 0-100) + feedback 1-2 kalimat + pertanyaan lanjutan yang lebih dalam jika benar, atau lebih mudah jika salah. Jangan borong banyak pertanyaan sekaligus.
Gunakan bahasa Indonesia.`
  }
  return `${base}
Tugasmu:
1. ${scenario}
2. Berikan pembahasan step-by-step dari nol hingga pengguna paham.
3. ${latex}

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
  // Jatah AI tamu: total 1x semua fitur (login = bebas)
  const gate = await guardAi(req)
  if (!gate.allowed) return gateDenied(gate.status, gate.code, gate.message)
  const gateCookie = gate.setCookie

  let body: {
    messages?: unknown
    subject?: unknown
    level?: unknown
    imageBase64?: unknown
    forceEngine?: unknown
    mode?: unknown
  } = {}
  try {
    body = await req.json()
  } catch {
    return Response.json(
      { code: "BAD_REQUEST", message: "Body request tidak valid." },
      { status: 400 }
    )
  }

  const messages = Array.isArray(body.messages) ? body.messages : []
  const subject =
    typeof body.subject === "string" && body.subject ? body.subject : "Matematika"
  const level = typeof body.level === "string" && body.level ? body.level : "SMP"
  const imageBase64 =
    typeof body.imageBase64 === "string" ? body.imageBase64 : null
  const forceEngine = body.forceEngine
  const rawMode = typeof body.mode === "string" ? body.mode : "solve"
  const mode: ChatMode =
    rawMode === "socratic" || rawMode === "recall" || rawMode === "oral" ? rawMode : "solve"
  if (imageBase64 && imageBase64.length > MAX_IMAGE_CHARS) {
    return Response.json(
      { code: "IMAGE_TOO_LARGE", message: "Ukuran gambar terlalu besar (maks 4MB)." },
      { status: 413 }
    )
  }

  const lastUserMsg = (messages?.[messages.length - 1] ?? {}) as IncomingMessage
  const userText =
    lastUserMsg.parts?.find((p) => p.type === "text")?.text ||
    lastUserMsg.content ||
    ""

  type UserContentPart = { type: "text"; text: string } | { type: "image"; image: string }
  const hasImage = !!imageBase64
  const userContent: string | UserContentPart[] = hasImage
    ? [
        { type: "text", text: userText || "Selesaikan soal dalam gambar ini" },
        { type: "image", image: imageBase64 },
      ]
    : userText

  const modelMessages = await convertToModelMessages(
    (messages?.slice(0, -1) ?? []) as UIMessage[]
  )
  const systemPrompt = getSystemPrompt(subject, level, mode)
  const hasChatAnywhereKey = !!process.env.CHATANYWHERE_API_KEY

  function pickEngines(): { primary: Engine; fallback: Engine } {
    if (forceEngine === "gemini" || forceEngine === "chatanywhere") {
      return {
        primary: forceEngine,
        fallback: forceEngine === "gemini" ? "chatanywhere" : "gemini",
      }
    }
    // Tanpa key ChatAnywhere, langsung Gemini agar tidak 403
    if (!hasChatAnywhereKey) return { primary: "gemini", fallback: "gemini" }
    // Teks → ChatAnywhere dulu, gambar → Gemini dulu
    return hasImage
      ? { primary: "gemini", fallback: "chatanywhere" }
      : { primary: "chatanywhere", fallback: "gemini" }
  }

  function modelFor(engine: Engine, forImage: boolean) {
    if (engine === "gemini") return google(GEMINI_MODEL)
    return chatanywhere(forImage ? VISION_FALLBACK_MODEL : TEXT_MODEL)
  }

  function streamResponse(engine: Engine, extraHeaders?: Record<string, string>) {
    const result = streamText({
      model: modelFor(engine, hasImage),
      system: systemPrompt,
      messages: [
        ...modelMessages,
        { role: "user", content: userContent },
      ],
      onError: ({ error }) => {
        console.warn(`[chat] stream error (engine=${engine}):`, error)
      },
    })
    return result.toUIMessageStreamResponse({
      headers: {
        "x-engine-used": engine,
        ...(gateCookie ? { "Set-Cookie": gateCookie } : {}),
        ...extraHeaders,
      },
      // ponytail: error mid-stream tak bisa di-catch; petakan ke pesan berkode
      // agar onError klien menerima CHATANYWHERE_AUTH/AI_ERROR, bukan generik
      onError: (error) => streamErrorMessage(error),
    })
  }

  const { primary, fallback } = pickEngines()

  try {
    return streamResponse(primary)
  } catch (primaryError) {
    // Gagal sebelum stream dimulai (mis. key hilang / model tidak dikenal)
    console.warn("Primary AI failed before streaming, switching to fallback:", primaryError)
    if (primary === fallback) {
      return Response.json(
        {
          code: primary === "chatanywhere" ? "CHATANYWHERE_AUTH" : "AI_ERROR",
          message:
            "Kunci ChatAnywhere bermasalah dan tidak ada cadangan. Periksa API key lalu coba lagi.",
        },
        { status: 503 }
      )
    }
    try {
      return streamResponse(fallback, {
        "x-fallback-reason":
          primary === "chatanywhere" && isChatAnywhereAuthError(primaryError)
            ? "chatanywhere-403"
            : "primary-error",
      })
    } catch (fallbackError) {
      console.error("Fallback AI also failed:", fallbackError)
      const authIssue =
        isChatAnywhereAuthError(primaryError) || isChatAnywhereAuthError(fallbackError)
      return Response.json(
        {
          code: authIssue ? "CHATANYWHERE_AUTH" : "AI_ERROR",
          message: authIssue
            ? "Kunci ChatAnywhere bermasalah. Coba lagi via Gemini."
            : "Gagal mendapatkan respons AI. Coba lagi.",
        },
        { status: authIssue ? 503 : 500 }
      )
    }
  }
}
