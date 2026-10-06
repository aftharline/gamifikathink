"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

// Sekali pakai: tambah .in saat masuk viewport. Hormat reduced-motion (langsung tampil).
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      el.classList.add("in")
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in")
            io.disconnect()
          }
        }
      },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return ref
}

// Pembungkus reveal-on-scroll untuk dipakai di Server Component.
export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useReveal<HTMLDivElement>()
  return (
    <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </div>
  )
}

// Spotlight hover: posisi cahaya mengikuti mouse (desktop saja via CSS hover).
export function Spot({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={ref}
      className={`spotlight ${className}`}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        el.style.setProperty("--mx", `${e.clientX - r.left}px`)
        el.style.setProperty("--my", `${e.clientY - r.top}px`)
      }}
    >
      {children}
    </div>
  )
}

// Bar CTA lengket khusus mobile (desktop disembunyikan via CSS).
export function StickyCta() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = document.getElementById("cta-akhir")
    if (!el || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0.2 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  if (!visible) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] sm:hidden">
      <a
        href="/arena"
        className="bg-gradient-jarvis flex h-12 items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white shadow-[0_8px_28px_rgba(45,212,191,.4)]"
      >
        Main Sekarang, Gratis
      </a>
    </div>
  )
}

// Angka menghitung naik saat terlihat (rAF, diam jika reduced-motion).
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  /* eslint-disable react-hooks/set-state-in-effect -- inisialisasi/animasi angka sekali saat terlihat */
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to)
      return
    }
    let raf = 0
    let started = false
    const run = () => {
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / 900)
        setV(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    if (!("IntersectionObserver" in window)) {
      run()
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true
          run()
          io.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    io.observe(el)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [to])
  /* eslint-enable react-hooks/set-state-in-effect */
  return (
    <span ref={ref}>
      {v}
      {suffix}
    </span>
  )
}
