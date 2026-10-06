"use client"

import { useRef, useState } from "react"
import { Upload, FileText, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { extractPdfText } from "@/lib/pdf"

interface Props {
  onText: (text: string, title: string) => void
}

export function MaterialUpload({ onText }: Props) {
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handle = async (f: File | undefined) => {
    if (!f) return
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Maks 10MB")
      return
    }
    setBusy(true)
    try {
      let text = ""
      if (f.type === "application/pdf" || f.name.endsWith(".pdf")) {
        text = await extractPdfText(f)
      } else if (f.type.startsWith("text/") || /\.(txt|md|csv)$/i.test(f.name)) {
        text = (await f.text()).slice(0, 50000)
      } else {
        toast.error("Format: PDF / TXT / MD")
        return
      }
      if (text.trim().length < 100) {
        toast.error("Teks hasil parse terlalu pendek / PDF scan tanpa teks.")
        return
      }
      onText(text, f.name.replace(/\.[^.]+$/, ""))
    } catch {
      toast.error("Gagal parse file.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={(e) => void handle(e.target.files?.[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="glass flex w-full items-center justify-center gap-2 rounded-2xl border-dashed p-6 text-sm text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {busy ? "Memparse PDF…" : "Upload PDF / TXT / MD (maks 10MB, 10 hal pertama)"}
      </button>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
        <FileText className="h-3 w-3" /> Atau paste teks langsung di kolom bawah.
      </p>
    </div>
  )
}
