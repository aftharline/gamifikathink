"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Send, Sparkles, Loader2, Swords, Plus, Scan } from "lucide-react"
import Link from "next/link"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "@/components/chat-message"
import { ImageUpload } from "@/components/image-upload"
import { EngineLED } from "@/components/engine-led"
import { ArcReactor } from "@/components/arc-reactor"
import { ThemeToggle } from "@/components/theme-toggle"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { createClient } from "@/lib/supabase/client"
import { TourHelpButton } from "@/components/tutorial-tour"
import { cn } from "@/lib/utils"
import { grantXp } from "@/lib/xp-events"
import { XP_REWARDS } from "@/lib/xp"
import { getRelatedModels } from "@/lib/ar-catalog"
import { ensureAiAccess, consumeLocalQuota, handleGateResponse } from "@/lib/ai-gate"
import { MathKeyboard } from "@/components/math-keyboard"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { MiniCalculator } from "@/components/mini-calculator"
import { touchStreak } from "@/lib/streak"

interface TextPart {
  type: "text"
  text: string
}

function getMessageText(m: UIMessage): string {
  return m.parts
    .filter((p): p is TextPart => p.type === "text")
    .map((p) => p.text)
    .join("")
}

interface ChatInterfaceProps {
  subject: string
  level: string
  resetSignal?: number
  onMessagesChange?: (count: number) => void
}

const QUICK_PROMPTS: Record<string, string[]> = {
  Matematika: [
    "Jelaskan rumus phytagoras dengan cerita game",
    "Soal: 2x + 5 = 15, berapa x?",
    "Jelaskan translasi titik (3,-5) oleh T(2,7)",
  ],
  "Bahasa Inggris": [
    "Buatkan cerita tentang past tense ala game RPG",
    "Apa beda 'a' dan 'an'? Contoh seperti game",
    "Jelaskan simple future tense dengan battle scene",
  ],
  Fisika: [
    "Jelaskan hukum Newton dengan game MOBA",
    "Soal: kecepatan 20 m/s, percepatan 2 m/s²",
    "Jelaskan energi kinetik ala game race",
  ],
  Kimia: [
    "Jelaskan ikatan ion ala game hero",
    "Apa itu molaritas? Contoh seperti game",
    "Jelaskan reaksi redoks dengan lore game",
  ],
  Biologi: [
    "Jelaskan fotosintesis ala game survival",
    "Apa beda mitosis dan meiosis? Contoh seperti game",
    "Jelaskan sistem pencernaan dengan quest RPG",
  ],
  "Bahasa Indonesia": [
    "Jelaskan teks eksposisi dengan cerita game",
    "Apa beda imbuhan me- dan di-? Contoh seperti game",
    "Jelaskan majas metafora ala lore game",
  ],
}

export function ChatInterface({ subject, level, resetSignal, onMessagesChange }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [chatMode, setChatMode] = useState<"solve" | "socratic" | "recall" | "oral">("solve")
  const [engine, setEngine] = useState<"gemini" | "chatanywhere">("chatanywhere")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [ping, setPing] = useState(42)
  const [supabase] = useState(() => createClient())
  const [isDragging, setIsDragging] = useState(false)
  const dragDepth = useRef(0)
  const [forceEngine, setForceEngine] = useState<"gemini" | "chatanywhere" | undefined>(undefined)
  const retriedRef = useRef(false)
  const retryTimeoutRef = useRef<number | null>(null)
  // Teks/mapel/engine saat pesan dikirim: anti stale closure di onFinish
  const lastSentRef = useRef<{ text: string; subject: string; level: string } | null>(null)
  const engineRef = useRef<"gemini" | "chatanywhere">("chatanywhere")

  const handleFiles = useCallback(async (files?: FileList | File[] | null) => {
    const file = files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.")
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 4MB.")
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => setImageBase64(event.target?.result as string)
    reader.onerror = () => toast.error("Gagal membaca gambar.")
    reader.readAsDataURL(file)
  }, [])

  const handleFetch = useCallback(
    async (input: URL | RequestInfo, init?: RequestInit) => {
      const started = performance.now()
      const response = await fetch(input, init)
      const usedEngine = response.headers.get("x-engine-used")
      const fallbackReason = response.headers.get("x-fallback-reason")
      const latency = Math.round(performance.now() - started)
      setPing(latency)
      if (usedEngine === "gemini" || usedEngine === "chatanywhere") {
        setEngine(usedEngine)
        if (fallbackReason === "chatanywhere-403") {
          toast("Kunci ChatAnywhere bermasalah, dijawab via Gemini", {
            description: "Soal diproses ulang otomatis tanpa aksi tambahan",
          })
        } else if (usedEngine === "gemini") {
          toast("Menjawab via Gemini Vision", {
            description: "Soal gambar diproses Gemini",
          })
        }
      } else if (usedEngine === "fallback") {
        // kompatibilitas header lama
        setEngine("chatanywhere")
        toast("Beralih ke jalur cadangan", {
          description: "Menggunakan ChatAnywhere",
        })
      } else if (usedEngine === "primary") {
        setEngine("gemini")
      }
      return response
    },
    []
  )

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ body, id, messages, trigger, messageId }) => ({
          body: {
            ...body,
            id,
            messages,
            trigger,
            messageId,
            subject,
            level,
            imageBase64,
            forceEngine,
            mode: chatMode,
          },
        }),
        fetch: handleFetch,
      }),
    [subject, level, imageBase64, forceEngine, handleFetch, chatMode]
  )

  const { messages, sendMessage, status, setMessages, regenerate } = useChat({
    transport,
    onFinish: ({ messages: finalMsgs, isError, isAbort, isDisconnect }) => {
      retriedRef.current = false
      setForceEngine(undefined)
      setImageBase64(null)
      if (isError || isAbort || isDisconnect) return
      const sent = lastSentRef.current
      lastSentRef.current = null
      const answer = finalMsgs.length > 0 ? finalMsgs[finalMsgs.length - 1] : undefined
      const answerText = answer && answer.role === "assistant" ? getMessageText(answer) : ""
      if (!sent || !answerText) return
      void (async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await supabase.from("chat_history").insert({
              user_id: user.id,
              subject: sent.subject,
              level: sent.level,
              question: sent.text,
              answer: answerText,
              engine_used: engineRef.current,
            })
            await grantXp(XP_REWARDS.chatCompleted)
          } else if (!sessionStorage.getItem("guest-xp-hint")) {
            sessionStorage.setItem("guest-xp-hint", "1")
            toast.info("Main sebagai tamu: masuk untuk simpan XP + riwayat.", {
              action: { label: "Masuk", onClick: () => { location.href = "/login" } },
            })
          }
        } catch (err) {
          console.error("Failed to save chat history:", err)
        }
      })()
    },
    onError: (err) => {
      const msg = err instanceof Error ? err.message : String(err ?? "")
      // Jatah tamu habis (server 401) -> modal login paksa
      if (/LOGIN_REQUIRED/i.test(msg)) {
        handleGateResponse(401, "LOGIN_REQUIRED")
        retriedRef.current = false
        setForceEngine(undefined)
        setImageBase64(null)
        lastSentRef.current = null
        return
      }
      // ponytail: satu retry otomatis via Gemini; tanpa loop
      const authLike = /CHATANYWHERE_AUTH|ApiKey|chatanywhere|403|401/i.test(msg)
      if (authLike && !retriedRef.current) {
        retriedRef.current = true
        setForceEngine("gemini")
        toast("Kunci ChatAnywhere bermasalah, mencoba ulang via Gemini…")
        // beri transport waktu memakai forceEngine terbaru (gambar dipertahankan)
        retryTimeoutRef.current = window.setTimeout(() => regenerate(), 50)
        return
      }
      retriedRef.current = false
      setForceEngine(undefined)
      setImageBase64(null)
      lastSentRef.current = null
      toast.error(
        authLike
          ? "Kunci ChatAnywhere bermasalah. Coba lagi via Gemini."
          : "Gagal mendapatkan respons. Coba lagi."
      )
    },
  })

  // Sinkronkan engine ke ref via effect (tulis ref langsung di handleFetch
  // memicu false positive react-hooks/refs pada transport useMemo)
  useEffect(() => {
    engineRef.current = engine
  }, [engine])

  // Prefill dari Smart Text (buku-mantra / materi)
  useEffect(() => {
    const pre = sessionStorage.getItem("arena-prefill")
    if (pre) {
      sessionStorage.removeItem("arena-prefill")
      // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill sekali saat mount
      setInput(pre)
    }
    touchStreak()
  }, [])

  // Laporkan jumlah pesan ke induk (untuk konfirmasi ganti mapel)
  const messageCount = messages.length
  useEffect(() => {
    onMessagesChange?.(messageCount)
  }, [messageCount, onMessagesChange])

  // Reset sesi saat induk meminta (ganti mapel/jenjang)
  const prevResetSignal = useRef(resetSignal)
  useEffect(() => {
    if (prevResetSignal.current === resetSignal) return
    prevResetSignal.current = resetSignal
    setMessages([])
    setImageBase64(null)
    setInput("")
    setForceEngine(undefined)
    retriedRef.current = false
    lastSentRef.current = null
  }, [resetSignal, setMessages])

  // Bersihkan timeout retry saat unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current !== null) window.clearTimeout(retryTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    // Jangan rebut scroll pengguna yang sedang baca ke atas saat streaming
    const el = scrollRef.current
    if (!el) return
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160
    if (nearBottom) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = useCallback(
    (text?: string, e?: React.FormEvent) => {
      e?.preventDefault()
      const finalText = text ?? input
      if (!finalText.trim() && !imageBase64) return

      // Jatah AI tamu: total 1x (login = bebas)
      void ensureAiAccess().then((gate) => {
        if (!gate.ok) return
        if (gate.guest) consumeLocalQuota()
        const outgoing = finalText || (imageBase64 ? "Selesaikan soal dalam gambar ini" : "")
        lastSentRef.current = { text: outgoing, subject, level }
        sendMessage({ text: outgoing })
        setInput("")
      })
      // gambar dipertahankan sampai respons selesai/gagal final (retry butuh file)
    },
    [input, imageBase64, sendMessage, subject, level]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setImageBase64(null)
    setInput("")
    setForceEngine(undefined)
    retriedRef.current = false
    lastSentRef.current = null
  }

  const isLoading = status === "submitted" || status === "streaming"
  const typing = status === "submitted"
  const hasStarted = messages.length > 0

  // Status proses AI berputar saat menunggu (satu interval, cleanup)
  const STATUS_TEXTS = [
    "Merangkum skenario game…",
    "Menyusun langkah penyelesaian…",
    "Merapikan rumus…",
    "Menulis pembahasan…",
  ]
  const [statusTextIdx, setStatusTextIdx] = useState(0)
  useEffect(() => {
    if (!isLoading) return
    const id = window.setInterval(
      () => setStatusTextIdx((i) => (i + 1) % STATUS_TEXTS.length),
      3000
    )
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- daftar statis
  }, [isLoading])

  return (
    <div
      className="relative flex h-full flex-col"
      onDragEnter={(e) => {
        e.preventDefault()
        dragDepth.current += 1
        if (e.dataTransfer.types.includes("Files")) setIsDragging(true)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => {
        e.preventDefault()
        dragDepth.current -= 1
        if (dragDepth.current <= 0) {
          dragDepth.current = 0
          setIsDragging(false)
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        dragDepth.current = 0
        setIsDragging(false)
        void handleFiles(e.dataTransfer.files)
      }}
    >
      {isDragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[var(--accent)]/10 p-6 text-center backdrop-blur-sm">
          <p className="text-sm font-medium text-[var(--accent)]">
            Tarik &amp; letakkan gambar soal di sini
          </p>
        </div>
      )}
      {/* Header HUD */}
      <div className="glass z-10 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <MobileMenuTrigger />
          <div className="bg-gradient-jarvis flex h-9 w-9 items-center justify-center rounded-xl glow-cyan">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold text-[var(--text-primary)]">
              Arena <span className="font-display text-base">{subject}</span>
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {level}
              {" • "}
              {subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* HUD status */}
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-secondary)] sm:flex">
            <EngineLED engine={engine} showLabel />
            <span className="text-[var(--accent)]">{ping}ms</span>
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isLoading ? "bg-teal-300" : "bg-emerald-400"
                )}
              />
              {isLoading ? "Menjawab…" : "Online"}
            </span>
          </div>

          <ThemeToggle />
          <TourHelpButton tour="arena" />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNewChat}
            className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Baru
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6" data-tour="arena-messages">
        {!hasStarted ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <ArcReactor size="lg" className="animate-pulse-glow" />
            <div>
              <h3 className="font-sans text-xl font-semibold text-[var(--text-primary)]">
                Siap Bertarung, <span className="font-display text-gradient text-2xl">Warrior</span>?
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                Ketik soal {subject}mu atau upload gambarnya. AI{" "}
                <span className="font-display">Game Master</span> akan mengubahnya
                menjadi skenario game epik!
              </p>
            </div>

            {/* Quick chips */}
            <div className="flex max-w-xl flex-wrap items-center justify-center gap-2 px-4">
              {(QUICK_PROMPTS[subject] || []).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  disabled={isLoading}
                  className="glass rounded-xl px-4 py-2 text-xs text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Model AR terkait */}
            {getRelatedModels(subject).length > 0 && (
              <div className="flex max-w-xl flex-wrap items-center justify-center gap-2 px-4">
                <span className="text-xs font-semibold text-[var(--text-secondary)]">
                  Lihat di AR:
                </span>
                {getRelatedModels(subject).map((m) => (
                  <Link
                    key={m.id}
                    href={`/ar/${m.id}`}
                    className="glass flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs text-[var(--accent)] transition-all hover:border-[var(--border-strong)] hover:brightness-110"
                  >
                    <Scan className="h-3.5 w-3.5" />
                    {m.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                role={m.role as "user" | "assistant"}
                content={getMessageText(m)}
                engine={m.role === "assistant" && getMessageText(m) ? engine : null}
                streaming={m.role === "assistant" && isLoading && getMessageText(m) === ""}
              />
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex gap-3">
                <div className="glass flex h-8 w-8 items-center justify-center rounded-full">
                  <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                </div>
                <div className="glass rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    <span
                      className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </div>
                  <p
                    className="animate-fade-in mt-1.5 text-xs text-[var(--text-muted)]"
                    key={statusTextIdx}
                  >
                    {STATUS_TEXTS[statusTextIdx]}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Deck */}
      <div className="border-t border-[var(--border)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Mode switch: Solver / Socratic / Recall / Oral */}
        <div className="mx-auto mb-2 flex max-w-3xl flex-wrap gap-1.5" data-tour="arena-mode">
          {(
            [
              { v: "solve", label: "Solver" },
              { v: "socratic", label: "Socrates" },
              { v: "recall", label: "Uji Dulu" },
              { v: "oral", label: "Ujian Lisan" },
            ] as const
          ).map((m) => (
            <button
              key={m.v}
              onClick={() => setChatMode(m.v)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-[11px] transition-all",
                chatMode === m.v
                  ? "bg-[var(--accent)]/15 text-[var(--accent)] ring-1 ring-[var(--accent)]/40"
                  : "text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--text-primary)]"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => handleSubmit(undefined, e)}
          className="glass mx-auto flex max-w-3xl items-end gap-2 rounded-2xl p-2 transition-all focus-within:border-[var(--border-strong)] focus-within:glow-cyan"
        >
          <ImageUpload
            onImageSelect={setImageBase64}
            onImageRemove={() => setImageBase64(null)}
            imagePreview={imageBase64}
          />
          <div className="relative flex-1" data-tour="arena-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Tulis soal ${subject} di sini...`}
              className="max-h-32 min-h-[44px] w-full resize-none bg-transparent px-3 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none"
              rows={1}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button
            type="submit"
            data-tour="arena-send"
            disabled={isLoading || (!input.trim() && !imageBase64)}
            size="icon"
            className="bg-gradient-jarvis h-11 w-11 shrink-0 rounded-xl text-white glow-cyan transition-all hover:brightness-110 disabled:opacity-30 disabled:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        <div className="mx-auto mt-1.5 flex max-w-3xl flex-wrap items-center justify-between gap-2 px-3">
          <span className="text-[11px] text-[var(--text-muted)]">
            {engine === "gemini" ? "Dijawab Gemini (gambar)" : "Dijawab ChatAnywhere (teks)"}
          </span>
          <span className="flex items-center gap-1">
            <MathKeyboard onInsert={(s) => setInput((v) => v + s)} />
            <DrawingCanvas onDone={(url) => setImageBase64(url)} />
            <MiniCalculator />
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            {input.length}/2000
          </span>
        </div>
      </div>
    </div>
  )
}
