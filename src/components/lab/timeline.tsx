"use client"

import { useEffect, useState } from "react"
import { ScrollText, Shuffle, Check, X, Play, Pause } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("timeline")!

const EVENTS = [
  { year: "1602", title: "VOC berdiri", desc: "Kongsi dagang Belanda mulai berkuasa di Nusantara." },
  { year: "1908", title: "Budi Utomo", desc: "Kebangkitan nasional: organisasi modern pertama." },
  { year: "1928", title: "Sumpah Pemuda", desc: "Satu nusa, satu bangsa, satu bahasa Indonesia." },
  { year: "1945", title: "Proklamasi", desc: "17 Agustus: Indonesia merdeka." },
  { year: "1949", title: "KMB", desc: "Belanda mengakui kedaulatan Indonesia." },
]

// Timeline sejarah: geser abad + urutkan peristiwa acak
export function TimelineSim() {
  const [century, setCentury] = useState(3)
  const [order, setOrder] = useState<number[]>([3, 0, 4, 1, 2])
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [auto, setAuto] = useState(false)
  const shown = EVENTS.slice(0, century + 1)

  /* eslint-disable react-hooks/set-state-in-effect -- autoplay abad sekali per tick */
  useEffect(() => {
    if (!auto) return
    if (century >= 4) {
      setAuto(false)
      return
    }
    const id = setTimeout(() => setCentury(century + 1), 2200)
    return () => clearTimeout(id)
  }, [auto, century])
  /* eslint-enable react-hooks/set-state-in-effect */

  const shuffle = () => {
    sfx.click()
    setOrder([...order].sort(() => Math.random() - 0.5))
    setDone(false)
    setWrong(false)
  }

  const move = (pos: number, dir: -1 | 1) => {
    const j = pos + dir
    if (j < 0 || j >= order.length) return
    sfx.click()
    setOrder((o) => {
      const n = [...o]
      ;[n[pos], n[j]] = [n[j], n[pos]]
      return n
    })
  }

  const check = () => {
    const ok = order.every((v, i) => v === i)
    if (ok) {
      setDone(true); sfx.correct(); grantXp(10); markLabDone("timeline")
    } else {
      setWrong(true); sfx.wrong()
    }
  }

  return (
    <LabShell
      icon={<ScrollText className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Urutkan dari tertua ke termuda. Mesin waktu di bawah menunjukkan peristiwa sampai abad yang dipilih."
      slug="timeline"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <div className="p-4">
          <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="shrink-0 font-mono">Abad ke-{century + 17}</span>
            <input type="range" min={0} max={4} value={century} onChange={(e) => { setCentury(Number(e.target.value)); setAuto(false) }} className="w-full accent-amber-400" />
            <button onClick={() => { setAuto(!auto); if (!auto && century >= 4) setCentury(0); sfx.click() }} title="Putar otomatis"
              className={`rounded-lg border border-[var(--border)] p-1.5 ${auto ? "bg-amber-400/20 text-amber-200" : "text-[var(--text-muted)]"}`}>
              {auto ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
          </label>
          <div className="relative mt-3">
            <div className="absolute left-3 top-0 h-full w-0.5 bg-gradient-to-b from-amber-400/60 to-amber-400/10" />
            <div className="space-y-2">
              {shown.map((e, i) => (
                <div key={e.year} className="fx-pop-in ml-7 rounded-xl border border-amber-400/20 bg-black/30 p-2.5" style={{ animationDelay: `${i * 70}ms` }}>
                  <p className="font-mono text-[11px] font-bold text-amber-300">{e.year}</p>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{e.title}</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">{e.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-[var(--text-primary)]">Urutkan yang acak (tertua → termuda)</p>
            <button onClick={shuffle} className="ml-auto flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-[var(--text-muted)]">
              <Shuffle className="h-3.5 w-3.5" /> Acak
            </button>
          </div>
          {order.map((ev, pos) => (
            <div key={EVENTS[ev].year} className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-2 py-1.5">
              <span className="font-mono font-bold text-amber-200">{pos + 1}.</span>
              <span className="flex-1 text-[var(--text-secondary)]">{EVENTS[ev].title}</span>
              <button onClick={() => move(pos, -1)} className="rounded bg-white/10 px-1.5">↑</button>
              <button onClick={() => move(pos, 1)} className="rounded bg-white/10 px-1.5">↓</button>
            </div>
          ))}
          {!done ? (
            <button onClick={check} className="rounded-xl bg-amber-400/20 py-2 font-semibold text-amber-100">
              Cek urutan (+10 XP)
            </button>
          ) : (
            <p className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-400/10 p-2 text-teal-300">
              <Check className="h-4 w-4" /> Urutan sempurna! +10 XP.
            </p>
          )}
          {wrong && !done && (
            <p className="flex items-center justify-center gap-1.5 text-red-300">
              <X className="h-4 w-4" /> Masih ada yang tertukar.
            </p>
          )}
        </div>
      }
      stats={<>Menampilkan {shown.length}/5 peristiwa | mode urut {done ? "tuntas" : "jalan"}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("timeline") }}
      shareTitle="Lab Timeline Sejarah"
      sharePayload={{ type: "lab", slug: "timeline" }}
    />
  )
}
