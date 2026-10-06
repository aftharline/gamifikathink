"use client"

import { useRef, useState } from "react"
import { Pencil, Trash2, Check } from "lucide-react"

export function DrawingCanvas({ onDone }: { onDone: (dataUrl: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)

  const pos = (e: React.PointerEvent) => {
    const c = ref.current!
    const r = c.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} title="Coret-coret rumus"
        className="rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--accent)]">
        <Pencil className="h-4 w-4" />
      </button>
    )
  }
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-2">
      <canvas
        ref={ref} width={280} height={140}
        className="w-full cursor-crosshair rounded-lg bg-white touch-none"
        onPointerDown={(e) => { drawing.current = true; const c = ref.current!.getContext("2d")!; const p = pos(e); c.beginPath(); c.moveTo(p.x, p.y) }}
        onPointerMove={(e) => {
          if (!drawing.current) return
          const c = ref.current!.getContext("2d")!
          const p = pos(e); c.lineWidth = 2; c.strokeStyle = "#111"; c.lineTo(p.x, p.y); c.stroke()
        }}
        onPointerUp={() => { drawing.current = false }}
      />
      <div className="mt-1 flex gap-1">
        <button
          onClick={() => { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height) }}
          className="rounded-md px-2 py-1 text-xs text-[var(--text-muted)] hover:text-red-400">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => { onDone(ref.current!.toDataURL("image/png")); setOpen(false) }}
          className="rounded-md px-2 py-1 text-xs text-teal-300">
          <Check className="h-3.5 w-3.5" /> Kirim ke AI
        </button>
        <button onClick={() => setOpen(false)} className="rounded-md px-2 py-1 text-xs text-[var(--text-muted)]">Tutup</button>
      </div>
    </div>
  )
}
