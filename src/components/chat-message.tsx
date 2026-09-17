"use client"

import { Bot, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { EngineLED } from "@/components/engine-led"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  role: "user" | "assistant"
  content: string
  engine?: "primary" | "fallback" | null
  streaming?: boolean
}

export function ChatMessage({ role, content, engine, streaming }: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <div className={cn("animate-fade-up flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className={cn("h-8 w-8", isUser ? "bg-gradient-jarvis" : "glass")}>
        <AvatarFallback className={cn(
          "bg-transparent",
          isUser ? "text-white" : "text-[var(--accent)]"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex max-w-[85%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm leading-relaxed",
            isUser
              ? "rounded-tr-md border border-teal-400/25 bg-gradient-to-r from-teal-400/15 to-teal-200/15 text-[var(--text-primary)]"
              : "glass-strong rounded-tl-md text-[var(--text-primary)]"
          )}
        >
          <div className="prose prose-sm max-w-none [&_pre]:bg-[var(--surface-2)] [&_pre]:border [&_pre]:border-[var(--border)] [&_pre]:rounded-lg [&_pre]:p-4 [&_code]:text-[var(--accent)] [&_code]:bg-[var(--secondary)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-[var(--border)] [&_th]:p-2 [&_th]:bg-[var(--secondary)] [&_td]:border [&_td]:border-[var(--border)] [&_td]:p-2 [&_img]:rounded-lg [&_blockquote]:border-l-[var(--accent)]">
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
                  <h1 className="mb-3 mt-5 text-lg font-semibold text-[var(--text-primary)] first:mt-0">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="mb-2 mt-4 text-base font-semibold text-[var(--accent)]">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mb-2 mt-3 text-sm font-medium text-[var(--text-primary)]">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="mb-2.5 leading-relaxed text-[var(--text-secondary)] last:mb-0">
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className="mb-2.5 list-disc space-y-1 pl-5 text-[var(--text-secondary)]">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2.5 list-decimal space-y-1 pl-5 text-[var(--text-secondary)]">{children}</ol>
                ),
                li: ({ children }) => <li className="text-[var(--text-secondary)]">{children}</li>,
                hr: () => <hr className="my-3 border-[var(--border)]" />,
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noreferrer" className="text-[var(--accent)] underline underline-offset-2 hover:opacity-80">
                    {children}
                  </a>
                ),
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
              {content}
            </ReactMarkdown>
          </div>
          {streaming && (
            <span className="animate-blink-cursor mt-0.5 inline-block font-mono text-[var(--accent)]">
              ▍
            </span>
          )}
        </div>

        {!isUser && engine && (
          <div className="flex items-center gap-1.5 px-1">
            <EngineLED engine={engine} showLabel size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}
