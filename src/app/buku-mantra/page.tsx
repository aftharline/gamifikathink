"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ScrollText, Clock, BookOpen, Trash2, Scan } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BackgroundFX } from "@/components/background-fx"
import { ArcReactor } from "@/components/arc-reactor"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { toast } from "sonner"
import { getRelatedModels } from "@/lib/ar-catalog"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"

interface ChatHistory {
  id: string
  subject: string
  level: string
  question: string
  answer: string
  created_at: string
}

export default function BukuMantraPage() {
  const [history, setHistory] = useState<ChatHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    let cancelled = false
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        if (!cancelled) setLoading(false)
        return
      }
      return supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (cancelled) return
          if (error) {
            toast.error("Gagal memuat riwayat")
          } else {
            setHistory(data || [])
          }
          setLoading(false)
        })
    })
    return () => {
      cancelled = true
    }
  }, [supabase])

  const deleteHistory = async (id: string) => {
    const { error } = await supabase.from("chat_history").delete().eq("id", id)
    if (error) {
      toast.error("Gagal menghapus")
    } else {
      setHistory(history.filter((h) => h.id !== id))
      setConfirmDelete(null)
      toast.success("Mantra dihapus")
    }
  }

  const selectedItem = history.find((h) => h.id === selected)

  return (
    <div className="relative flex h-screen overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex flex-1 overflow-hidden">
        {/* List */}
        <div className="glass w-full overflow-y-auto border-r border-[var(--border)] p-4 sm:w-80 lg:w-96">
          <div className="mb-6 flex items-center gap-2">
            <MobileMenuTrigger />
            <h1 className="flex items-center gap-2 font-sans text-lg font-bold text-[var(--text-primary)]">
              <ScrollText className="h-5 w-5 text-[var(--accent)]" />
              Buku Mantra
            </h1>
          </div>

          {loading ? (
            <div className="mt-10 flex justify-center">
              <ArcReactor size="sm" className="animate-pulse-glow" />
            </div>
          ) : history.length === 0 ? (
            <div className="mt-10 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
              <p className="mt-3 text-sm text-[var(--text-secondary)]">
                Belum ada riwayat. Mulai belajar di Arena!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelected(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setSelected(item.id)
                    }
                  }}
                  className={`glass w-full cursor-pointer rounded-xl p-3 text-left transition-all focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                    selected === item.id
                      ? "border-l-2 border-l-[var(--accent)] glow-cyan"
                      : "hover:border-[var(--border-strong)]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                      {item.subject} • {item.level}
                    </span>
                    {confirmDelete === item.id ? (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-6 px-2 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteHistory(item.id)
                          }}
                        >
                          Hapus
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-[10px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDelete(null)
                          }}
                        >
                          Batal
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDelete(item.id)
                        }}
                        className="text-[var(--text-muted)] transition-colors hover:text-[var(--danger)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--text-primary)]">
                    {item.question}
                  </p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    <Clock className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {selectedItem ? (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  {selectedItem.subject} • {selectedItem.level}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                  {new Date(selectedItem.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>
              <div className="mb-6">
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Soal
                </h3>
                <div className="glass rounded-2xl p-5 text-sm text-[var(--text-primary)]">
                  {selectedItem.question}
                </div>
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  Pembahasan
                </h3>
                <div className="glass rounded-2xl p-5">
                  <div className="prose prose-sm max-w-none [&_pre]:bg-[var(--surface-2)] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:rounded-lg [&_pre]:p-4 [&_code]:text-[var(--accent)] [&_code]:bg-[var(--secondary)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[var(--border)] [&_th]:p-2 [&_th]:bg-[var(--secondary)] [&_td]:border [&_td]:border-[var(--border)] [&_td]:p-2">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        strong: ({ children }) => (
                          <span className="font-semibold text-[var(--text-primary)]">{children}</span>
                        ),
                        em: ({ children }) => (
                          <span className="italic text-[var(--text-secondary)]">{children}</span>
                        ),
                        h1: ({ children }) => (
                          <h1 className="mb-3 mt-5 text-lg font-semibold text-[var(--text-primary)] first:mt-0">{children}</h1>
                        ),
                        h2: ({ children }) => (
                          <h2 className="mb-2 mt-4 text-base font-semibold text-[var(--accent)]">{children}</h2>
                        ),
                        h3: ({ children }) => (
                          <h3 className="mb-2 mt-3 text-sm font-medium text-[var(--text-primary)]">{children}</h3>
                        ),
                        p: ({ children }) => (
                          <p className="mb-2.5 leading-relaxed text-[var(--text-secondary)] last:mb-0">{children}</p>
                        ),
                        ul: ({ children }) => (
                          <ul className="mb-2.5 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">{children}</ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="mb-2.5 list-decimal space-y-1 pl-5 text-[var(--text-secondary)]">{children}</ol>
                        ),
                        li: ({ children }) => <li className="text-[var(--text-secondary)]">{children}</li>,
                        hr: () => <hr className="my-3 border-[var(--border)]" />,
                        code: ({ children, className, ...props }) => {
                          const isInline = !className
                          if (isInline) {
                            return (
                              <code className="rounded bg-[var(--secondary)] px-1.5 py-0.5 font-mono text-xs text-[var(--accent)]">
                                {children}
                              </code>
                            )
                          }
                          return (
                            <pre className="my-3 overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4">
                              <code className="font-mono text-sm text-[var(--text-primary)]" {...props}>
                                {children}
                              </code>
                            </pre>
                          )
                        },
                      }}
                    >
                      {selectedItem.answer}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
              {getRelatedModels(selectedItem.subject).length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                    Lihat Versi 3D
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getRelatedModels(selectedItem.subject).map((m) => (
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
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ArcReactor size="sm" className="opacity-60" />
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Pilih item dari daftar untuk melihat detail
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
