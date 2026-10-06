"use client"

import { useState } from "react"

// Smart Text: seleksi teks → tombol Tanya AI (prefill arena via clipboard + event)
export function SmartText({ text }: { text: string }) {
  const [sel, setSel] = useState("")
  return (
    <span
      onMouseUp={() => {
        const s = window.getSelection()?.toString().trim() ?? ""
        if (s.length > 2 && s.length < 300) setSel(s)
      }}
    >
      {text}
      {sel && (
        <button
          onClick={() => {
            sessionStorage.setItem("arena-prefill", `Jelaskan: "${sel}"`)
            location.href = "/arena"
          }}
          className="ml-2 rounded-md bg-[var(--accent)]/15 px-2 py-0.5 text-[11px] text-[var(--accent)]"
        >
          Tanya AI: “{sel.slice(0, 30)}…”
        </button>
      )}
    </span>
  )
}
