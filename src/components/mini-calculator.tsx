"use client"

import { useState } from "react"
import { Calculator as CalcIcon } from "lucide-react"

export function MiniCalculator() {
  const [open, setOpen] = useState(false)
  const [expr, setExpr] = useState("")
  const [out, setOut] = useState("")
  const calc = () => {
    try {
      // ponytail: hanya digit + operator dasar, tanpa eval bebas
      if (!/^[0-9+\-*/().\s%^]+$/.test(expr)) { setOut("input tidak valid"); return }
      const safe = expr.replace(/\^/g, "**").replace(/%/g, "/100")
      const val = Function(`"use strict"; return (${safe})`)() as number
      setOut(String(Math.round(val * 1e8) / 1e8))
    } catch { setOut("error") }
  }
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} title="Kalkulator"
        className="rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--accent)]">
        <CalcIcon className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-10 right-0 z-30 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-xl">
          <input value={expr} onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") calc() }}
            placeholder="2*(3+4)" className="w-full rounded-lg bg-[var(--surface-2)] px-2 py-1.5 font-mono text-sm text-[var(--text-primary)] outline-none" />
          <button onClick={calc} className="mt-2 w-full rounded-lg bg-[var(--accent)]/15 py-1 text-xs text-[var(--accent)]">= Hitung</button>
          {out && <p className="mt-1 font-mono text-sm text-[var(--text-primary)]">{out}</p>}
        </div>
      )}
    </div>
  )
}
