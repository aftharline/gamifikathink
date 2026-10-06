"use client"

import { useState } from "react"
import { FlaskConical, Droplets } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("ph-mixer")!

function phColor(ph: number): string {
  if (ph < 3) return "#ef4444"
  if (ph < 5) return "#f97316"
  if (ph < 6.5) return "#facc15"
  if (ph <= 7.5) return "#4ade80"
  if (ph <= 9) return "#38bdf8"
  if (ph <= 11) return "#818cf8"
  return "#c084fc"
}

function phLabel(ph: number): string {
  if (ph < 3) return "asam kuat"
  if (ph < 6.5) return "asam"
  if (ph <= 7.5) return "netral"
  if (ph <= 11) return "basa"
  return "basa kuat"
}

// Lab pH mixer: tetes asam/basa, warna + angka live, misi netral pH 7
export function PhMixerSim() {
  const [acid, setAcid] = useState(0)
  const [base, setBase] = useState(0)
  const [won, setWon] = useState(false)
  const [history, setHistory] = useState<number[]>([])

  // netral di tengah: ph = 7 + (base - acid) * 0.6, clamp 1-14
  const ph = Math.min(14, Math.max(1, 7 + (base - acid) * 0.6))
  const color = phColor(ph)

  const drop = (kind: "acid" | "base") => {
    sfx.click()
    const na = kind === "acid" ? Math.min(10, acid + 1) : acid
    const nb = kind === "base" ? Math.min(10, base + 1) : base
    setAcid(na)
    setBase(nb)
    const next = Math.min(14, Math.max(1, 7 + (nb - na) * 0.6))
    setHistory((h) => [...h.slice(-11), next])
  }

  const check = () => {
    if (ph >= 6.8 && ph <= 7.2) {
      setWon(true); sfx.correct(); grantXp(10); markLabDone("ph-mixer")
    } else sfx.wrong()
  }

  const drops = (n: number, color: string, x: number) =>
    Array.from({ length: n }).map((_, i) => (
      <circle key={i} cx={x + ((i * 37) % 40) - 20} cy={118 - Math.floor(i / 3) * 12} r="5" fill={color} opacity="0.9" />
    ))

  return (
    <LabShell
      icon={<FlaskConical className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="pH 0-14: di bawah 7 asam, 7 netral, di atas 7 basa. Tetesan asam dan basa saling menetralkan."
      slug="ph-mixer"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <svg viewBox="0 0 360 210" className="block w-full">
          <rect x="0" y="0" width="360" height="210" fill="#0d0a18" />
          {[1, 3, 5, 7, 9, 11, 13].map((p) => {
            const x = 20 + ((p - 1) / 13) * 320
            return (
              <g key={p}>
                <rect x={x} y="8" width="24" height="10" rx="3" fill={phColor(p)} opacity={Math.abs(ph - p) < 1.2 ? 1 : 0.35} />
                <text x={x + 12} y="30" textAnchor="middle" fontSize="9" fill="#94a3b8">{p}</text>
              </g>
            )
          })}
          {/* gelas */}
          <path d="M130 60 L150 190 L210 190 L230 60 Z" fill="rgba(255,255,255,.06)" stroke="#94a3b8" strokeWidth="2" />
          <path d={`M136 80 L152 184 L208 184 L224 80 Z`} fill={color} opacity="0.75" />
          {drops(acid, "#ef4444", 150)}
          {drops(base, "#38bdf8", 210)}
          {/* pipet */}
          <rect x="118" y="20" width="14" height="34" rx="4" fill="#f97316" />
          <rect x="228" y="20" width="14" height="34" rx="4" fill="#38bdf8" />
          <text x="180" y="150" textAnchor="middle" fontSize="30" fontWeight="black" fill="#fff" style={{ textShadow: "0 0 12px #000" }}>
            {ph.toFixed(1)}
          </text>
          <text x="180" y="172" textAnchor="middle" fontSize="12" fill="#e2e8f0">{phLabel(ph)}</text>
        </svg>
      }
      controls={
        <div className="grid gap-2 text-xs text-[var(--text-secondary)]">
          <div className="flex gap-2">
            <button onClick={() => drop("acid")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-500/15 py-2 font-semibold text-red-300">
              <Droplets className="h-4 w-4" /> Asam ({acid})
            </button>
            <button onClick={() => drop("base")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sky-500/15 py-2 font-semibold text-sky-300">
              <Droplets className="h-4 w-4" /> Basa ({base})
            </button>
            <button onClick={() => { setAcid(0); setBase(0); setWon(false); setHistory([]); sfx.click() }}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-[var(--text-muted)]">
              Reset
            </button>
          </div>
          {history.length > 0 && (
            <div className="flex items-end gap-1 rounded-xl bg-black/30 p-2">
              {history.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm" title={`pH ${h.toFixed(1)}`}
                  style={{ height: `${6 + (h / 14) * 26}px`, background: phColor(h) }} />
              ))}
              <span className="ml-1 text-[10px] text-[var(--text-muted)]">riwayat pH</span>
            </div>
          )}
          {!won ? (
            <button onClick={check} className="rounded-xl bg-fuchsia-400/20 py-2 font-semibold text-fuchsia-200">
              Racik netral pH 7 (+10 XP)
            </button>
          ) : (
            <p className="rounded-xl bg-teal-400/10 p-2 text-center text-teal-300">Netral sempurna! +10 XP masuk.</p>
          )}
        </div>
      }
      stats={<>pH {ph.toFixed(1)} ({phLabel(ph)}) | asam {acid} tetes vs basa {base} tetes</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { sfx.click(); grantXp(5); markLabDone("ph-mixer") }}
      shareTitle="Lab pH Mixer"
      sharePayload={{ type: "lab", slug: "ph-mixer" }}
    />
  )
}
