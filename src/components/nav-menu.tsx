"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ChevronRight } from "lucide-react"

const LINKS = [
  { href: "/arena", num: "01", label: "Arena" },
  { href: "/lab", num: "02", label: "Lab" },
  { href: "/materi", num: "03", label: "Materi" },
  { href: "/leaderboard", num: "04", label: "Peringkat" },
]

export function NavLinks({ desktop = false }: { desktop?: boolean }) {
  if (desktop) {
    return (
      <nav className="ml-auto hidden items-center gap-0.5 text-xs sm:flex" aria-label="Navigasi utama">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-lg px-2.5 py-1.5 text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--accent)]"
          >
            <span className="mr-1 font-mono text-[10px] text-[var(--text-muted)] group-hover:text-[var(--accent)]">
              {l.num}
            </span>
            {l.label}
          </Link>
        ))}
      </nav>
    )
  }
  return null
}

export function NavMenu() {
  const [open, setOpen] = useState(false)
  return (
    <div className="ml-auto sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Tutup menu" : "Buka menu"}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)]"
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>
      {open && (
        <div className="fx-pop-in absolute inset-x-0 top-full border-b border-[var(--border)] bg-[var(--background)]/95 px-4 pb-4 pt-2 backdrop-blur-md">
          <nav className="grid gap-1" aria-label="Navigasi mobile">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-white/5"
              >
                <span className="font-mono text-[11px] text-[var(--accent)]">{l.num}</span>
                {l.label}
                <ChevronRight className="ml-auto h-4 w-4 text-[var(--text-muted)]" />
              </Link>
            ))}
            <Link
              href="/arena"
              onClick={() => setOpen(false)}
              className="bg-gradient-jarvis mt-1 flex h-11 items-center justify-center gap-1 rounded-xl text-sm font-bold text-white"
            >
              Main Sekarang, Gratis
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
