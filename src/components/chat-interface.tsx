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
import { cn } from "@/lib/utils"
import { grantXp } from "@/lib/xp-events"
import { XP_REWARDS } from "@/lib/xp"
import { getRelatedModels } from "@/lib/ar-catalog"

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
}

export function ChatInterface({ subject, level }: ChatInterfaceProps) {
  const [input, setInput] = useState("")
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [engine, setEngine] = useState<"primary" | "fallback">("primary")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [ping, setPing] = useState(42)
  const [supabase] = useState(() => createClient())

  const handleFetch = useCallback(
    async (input: URL | RequestInfo, init?: RequestInit) => {
      const started = performance.now()
      const response = await fetch(input, init)
      const usedEngine = response.headers.get("x-engine-used")
      const latency = Math.round(performance.now() - started)
      setPing(latency)
      if (usedEngine === "fallback") {
        setEngine("fallback")
        toast("Beralih ke jalur cadangan", {
          description: "Menggunakan GPT-3.5",
        })
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
          },
        }),
        fetch: handleFetch,
      }),
    [subject, level, imageBase64, handleFetch]
  )

  const { messages, sendMessage, status, setMessages } = useChat({
    transport,
    onFinish: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user && messages.length >= 2) {
          await supabase.from("chat_history").insert({
            user_id: user.id,
            subject,
            level,
            question: getMessageText(messages[messages.length - 2]) || input,
            answer: getMessageText(messages[messages.length - 1]),
            engine_used: engine,
          })
          await grantXp(XP_REWARDS.chatCompleted)
        }
      } catch (err) {
        console.error("Failed to save chat history:", err)
      }
    },
    onError: () => {
      toast.error("Gagal mendapatkan respons. Coba lagi.")
    },
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSubmit = useCallback(
    (text?: string, e?: React.FormEvent) => {
      e?.preventDefault()
      const finalText = text ?? input
      if (!finalText.trim() && !imageBase64) return

      sendMessage({
        text: finalText || (imageBase64 ? "Selesaikan soal dalam gambar ini" : ""),
      })
      setInput("")
      setImageBase64(null)
    },
    [input, imageBase64, sendMessage]
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
  }

  const isLoading = status === "submitted" || status === "streaming"
  const typing = status === "submitted"
  const hasStarted = messages.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Header HUD */}
      <div className="glass z-10 flex items-center justify-between border-b border-[var(--border)] px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <MobileMenuTrigger />
          <div className="bg-gradient-jarvis flex h-9 w-9 items-center justify-center rounded-xl glow-cyan">
            <Swords className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="font-sans text-sm font-semibold text-[var(--text-primary)]">
              Arena {subject}
            </h2>
            <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {level}
              {" // "}
              {subject}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* HUD status */}
          <div className="hidden items-center gap-3 rounded-lg border border-[var(--border)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] sm:flex">
            <EngineLED engine={engine} showLabel />
            <span className="text-[var(--border-strong)]">|</span>
            <span className="text-[var(--accent)]">PING {ping}ms</span>
            <span className="text-[var(--border-strong)]">|</span>
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isLoading ? "animate-pulse-glow bg-teal-300" : "bg-emerald-400"
                )}
              />
              {isLoading ? "STREAMING" : "ONLINE"}
            </span>
          </div>

          <ThemeToggle />
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
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {!hasStarted ? (
          <div className="flex h-full flex-col items-center justify-center gap-6 text-center">
            <ArcReactor size="lg" className="animate-pulse-glow" />
            <div>
              <h3 className="font-sans text-xl font-semibold text-[var(--text-primary)]">
                Siap Bertarung, <span className="text-gradient">Warrior</span>?
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
                Ketik soal {subject}mu atau upload gambarnya. AI Game Master akan mengubahnya
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
                  className="glass rounded-full px-4 py-2 text-xs text-[var(--text-secondary)] transition-all hover:border-[var(--border-strong)] hover:text-[var(--accent)]"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Model AR terkait */}
            {getRelatedModels(subject).length > 0 && (
              <div className="flex max-w-xl flex-wrap items-center justify-center gap-2 px-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Lihat di AR:
                </span>
                {getRelatedModels(subject).map((m) => (
                  <Link
                    key={m.id}
                    href={`/ar/${m.id}`}
                    className="glass flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-[var(--accent)] transition-all hover:border-[var(--border-strong)] hover:brightness-110"
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
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Deck */}
      <div className="border-t border-[var(--border)] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <form
          onSubmit={(e) => handleSubmit(undefined, e)}
          className="glass mx-auto flex max-w-3xl items-end gap-2 rounded-2xl p-2 transition-all focus-within:border-[var(--border-strong)] focus-within:glow-cyan"
        >
          <ImageUpload
            onImageSelect={setImageBase64}
            onImageRemove={() => setImageBase64(null)}
            imagePreview={imageBase64}
          />
          <div className="relative flex-1">
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
        <div className="mx-auto mt-1.5 flex max-w-3xl items-center justify-between px-3">
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            {engine === "primary" ? "PRIMARY: GEMINI-3.5.FLASH" : "FALLBACK: GPT-3.5"}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
            {input.length}/2000
          </span>
        </div>
      </div>
    </div>
  )
}
