"use client"

import { useEffect, useRef, useState } from "react"
import { Microscope, Check, X, ScanEye, Tags } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { useLowFx } from "@/lib/use-fps"
import { createPool, spawn, step, draw, type Particle } from "@/lib/fx"

interface Organel {
  id: string
  color: string
  label: string
  body: string
  fact: string
}

const ORGANELLES: Organel[] = [
  { id: "dinding", color: "#4ade80", label: "Dinding Sel", body: "Pelindung kaku dari selulosa yang memberi bentuk tetap pada sel tumbuhan.", fact: "Hanya tumbuhan, jamur, dan bakteri yang punya dinding sel." },
  { id: "kloroplas", color: "#22c55e", label: "Kloroplas", body: "Tempat fotosintesis: CO2 + air menjadi glukosa + oksigen, berklorofil hijau.", fact: "Satu sel daun bisa berisi 40-50 kloroplas." },
  { id: "mitokondria", color: "#f59e0b", label: "Mitokondria", body: "Pembangkit energi ATP melalui respirasi seluler.", fact: "Punya DNA sendiri. Bukti dulu bakteri bebas." },
  { id: "nukleus", color: "#a78bfa", label: "Nukleus", body: "Pusat kendali berisi DNA yang mengatur seluruh aktivitas sel.", fact: "Diameter sekitar 10 persen dari sel." },
  { id: "vakuola", color: "#38bdf8", label: "Vakuola", body: "Kantong air besar penjaga turgiditas sel tumbuhan.", fact: "Bisa mengambil 90 persen volume sel dewasa." },
]

const QUIZ = [
  { q: "Tempat fotosintesis?", opts: ["Mitokondria", "Kloroplas"], a: 1 },
  { q: "Pembangkit ATP?", opts: ["Mitokondria", "Vakuola"], a: 0 },
  { q: "Berisi DNA pengatur sel?", opts: ["Nukleus", "Dinding Sel"], a: 0 },
]

// Sel maksimal: sitoplasma berpartikel, zoom panel, mode tebak label, fakta
export function CellSim() {
  const [activeId, setActiveId] = useState("kloroplas")
  const [labelQuiz, setLabelQuiz] = useState(false)
  const [guess, setGuess] = useState<string | null>(null)
  const [qi, setQi] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lowFx = useLowFx()
  const poolRef = useRef<Particle[]>(createPool())

  const active = ORGANELLES.find((o) => o.id === activeId) ?? ORGANELLES[1]

  // latar sitoplasma hidup
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const c = canvasRef.current
      if (c && !lowFx) {
        const ctx = c.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, c.width, c.height)
          if (Math.random() < 0.25) {
            spawn(poolRef.current, Math.random() * c.width, c.height + 4, 1, "rgba(45,212,191,.5)", 0.5, true)
          }
          poolRef.current.forEach((p) => { p.vy = -Math.abs(p.vy) * 0.6 - 0.15 })
          step(poolRef.current, -0.004)
          draw(ctx, poolRef.current)
        }
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [lowFx])

  const pick = (id: string) => {
    const o = ORGANELLES.find((x) => x.id === id)
    if (!o) return
    sfx.click()
    if (labelQuiz) {
      if (id === activeId) {
        setGuess("Benar! Itu " + o.label + ".")
        sfx.correct()
        grantXp(3)
        const idx = ORGANELLES.findIndex((x) => x.id === activeId)
        setActiveId(ORGANELLES[(idx + 1) % ORGANELLES.length].id)
      } else {
        setGuess("Bukan itu. Coba organel lain.")
        sfx.wrong()
      }
      return
    }
    setActiveId(id)
    if (!lowFx) {
      // ledakan kecil di tengah kanvas latar
      const c = canvasRef.current
      if (c) spawn(poolRef.current, c.width / 2, c.height / 2, 8, o.color, 1.2, lowFx)
    }
  }

  const answer = (k: number) => {
    if (done) return
    if (k === QUIZ[qi].a) {
      sfx.correct()
      if (qi + 1 >= QUIZ.length) {
        setDone(true); grantXp(10); markLabDone("sel")
      } else setQi(qi + 1)
      setWrong(false)
    } else {
      sfx.wrong()
      setWrong(true)
    }
  }

  const shape = (id: string) => {
    const common = "cursor-pointer transition-all hover:brightness-125"
    switch (id) {
      case "dinding":
        return (
          <g className={common} onClick={() => pick(id)} opacity={activeId === id ? 1 : 0.85}>
            <rect x="22" y="14" width="316" height="202" rx="46" fill="none" stroke="#4ade80" strokeWidth={activeId === id ? 6 : 5} />
            <rect x="30" y="22" width="300" height="186" rx="40" fill="none" stroke="#f472b6" strokeWidth="2" strokeDasharray="6 5" opacity="0.7" />
          </g>
        )
      case "kloroplas":
        return (
          <g className={common} onClick={() => pick(id)} opacity={activeId === id ? 1 : 0.85}>
            <ellipse cx="252" cy="70" rx="38" ry="24" fill="#14532d" stroke="#22c55e" strokeWidth={activeId === id ? 3.5 : 2.5} />
            <ellipse cx="252" cy="70" rx="20" ry="10" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            <ellipse cx="252" cy="70" rx="10" ry="5" fill="none" stroke="#4ade80" strokeWidth="1" />
            {!labelQuiz && <text x="252" y="74" textAnchor="middle" fontSize="9" fill="#bbf7d0">kloroplas</text>}
          </g>
        )
      case "mitokondria":
        return (
          <g className={common} onClick={() => pick(id)} opacity={activeId === id ? 1 : 0.9}>
            <ellipse cx="108" cy="152" rx="32" ry="17" fill="#451a03" stroke="#f59e0b" strokeWidth={activeId === id ? 3.5 : 2.5} />
            <path d="M84 152 q12 -8 24 0 q12 8 24 0" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            {!labelQuiz && <text x="108" y="156" textAnchor="middle" fontSize="9" fill="#fde68a">mitokondria</text>}
          </g>
        )
      case "nukleus":
        return (
          <g className={common} onClick={() => pick(id)} opacity={activeId === id ? 1 : 0.9}>
            <circle cx="168" cy="98" r="30" fill="#2e1065" stroke="#a78bfa" strokeWidth={activeId === id ? 3.5 : 2.5} />
            <circle cx="168" cy="98" r="11" fill="#7c3aed" />
            {!labelQuiz && <text x="168" y="140" textAnchor="middle" fontSize="9" fill="#ddd6fe">nukleus</text>}
          </g>
        )
      default:
        return (
          <g className={common} onClick={() => pick(id)} opacity={activeId === id ? 1 : 0.85}>
            <ellipse cx="232" cy="160" rx="44" ry="27" fill="#0c4a6e" stroke="#38bdf8" strokeWidth={activeId === id ? 3.5 : 2.5} />
            {!labelQuiz && <text x="232" y="164" textAnchor="middle" fontSize="9" fill="#bae6fd">vakuola</text>}
          </g>
        )
    }
  }

  return (
    <LabShell
      icon={<Microscope className="h-5 w-5" />}
      title="Sel Tumbuhan"
      subject="Biologi"
      theory="Sel tumbuhan punya dinding sel kaku, kloroplas untuk fotosintesis, dan vakuola besar. Aktifkan mode tebak untuk menguji hafalanmu."
      scene={
        <div className="relative">
          <canvas ref={canvasRef} width={360} height={230} className="pointer-events-none absolute inset-0 block h-full w-full" />
          <svg viewBox="0 0 360 230" className="relative block w-full">
            <defs>
              <radialGradient id="cellbg" cx="50%" cy="40%" r="85%">
                <stop offset="0%" stopColor="#0f2f2a" />
                <stop offset="100%" stopColor="#0a1420" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="360" height="230" fill="url(#cellbg)" />
            {/* arus sitoplasma melayang */}
            <g fill="#2dd4bf" opacity="0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <circle key={i} cx={60 + i * 60} cy="200" r="2">
                  <animate attributeName="cy" values="205;30;205" dur={`${9 + i * 2}s`} repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0;.6;0" dur={`${9 + i * 2}s`} repeatCount="indefinite" />
                </circle>
              ))}
            </g>
            {shape("dinding")}
            {shape("kloroplas")}
            {shape("mitokondria")}
            {shape("nukleus")}
            {shape("vakuola")}
            {labelQuiz && (
              <text x="180" y="20" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#fbbf24">
                Mode tebak: klik {ORGANELLES.find((o) => o.id === activeId)?.label}!
              </text>
            )}
          </svg>
        </div>
      }
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            {ORGANELLES.map((o) => (
              <button key={o.id}
                onClick={() => pick(o.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${activeId === o.id && !labelQuiz ? "bg-teal-400/20 text-teal-100" : "text-[var(--text-muted)] hover:text-teal-200"}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: o.color }} />
                {labelQuiz ? "?" : o.label}
              </button>
            ))}
            <button onClick={() => { setLabelQuiz(!labelQuiz); setGuess(null); sfx.click() }}
              className={`ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 ${labelQuiz ? "bg-amber-400/20 text-amber-200" : "text-[var(--text-muted)] hover:text-amber-200"}`}>
              <Tags className="h-3.5 w-3.5" /> Tebak
            </button>
            <button onClick={() => setZoom(zoom === 1 ? 1.6 : 1)} title="Perbesar"
              className="rounded-lg border border-[var(--border)] p-1.5 text-teal-200">
              <ScanEye className="h-4 w-4" />
            </button>
          </div>
          <div className={`rounded-xl border border-teal-400/20 bg-black/30 p-3 ${zoom > 1 ? "scale-[1.02]" : ""}`} style={{ transformOrigin: "top center" }}>
            <p className="flex items-center gap-1.5 font-semibold text-teal-100">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: active.color }} />
              {labelQuiz ? "Petunjuk:" : active.label}
            </p>
            <p className="mt-1 leading-relaxed text-[var(--text-secondary)]">{labelQuiz ? active.body.replace(active.label, "organel ini") : active.body}</p>
            <p className="mt-1 text-[11px] text-amber-200/90">Fakta: {active.fact}</p>
            {guess && <p className="mt-1 text-teal-300">{guess}</p>}
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="font-semibold text-[var(--text-primary)]">
              Kuis {qi + 1}/{QUIZ.length}: {done ? "Selesai" : QUIZ[qi].q}
            </p>
            {!done ? (
              <div className="mt-1.5 flex gap-2">
                {QUIZ[qi].opts.map((o, k) => (
                  <button key={o} onClick={() => answer(k)}
                    className="flex-1 rounded-lg border border-[var(--border)] px-3 py-1.5 hover:border-teal-400/50">
                    {o}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1.5 flex items-center gap-1.5 text-teal-300">
                <Check className="h-4 w-4" /> Semua benar, +10 XP. Misi sel selesai.
              </p>
            )}
            {wrong && !done && (
              <p className="mt-1.5 flex items-center gap-1.5 text-red-300">
                <X className="h-4 w-4" /> Kurang tepat, coba lagi.
              </p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal-400 transition-all" style={{ width: `${((done ? QUIZ.length : qi) / QUIZ.length) * 100}%` }} />
            </div>
          </div>
        </div>
      }
      stats={<>Fokus: {labelQuiz ? "mode tebak" : active.label} | Kuis {done ? QUIZ.length : qi}/{QUIZ.length}</>}
      actionLabel={done ? "Selesai (+10 XP didapat)" : "Lewati kuis (+2 XP)"}
      onAction={() => { if (!done) { grantXp(2); markLabDone("sel") } }}
      shareTitle="Lab Sel Tumbuhan"
      sharePayload={{ type: "lab", slug: "sel" }}
    />
  )
}
