"use client"

import { useState } from "react"
import { Pizza, Scale } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("pecahan")!

// Pizza pecahan: geser pembilang/penyebut, potong visual, banding dua pecahan
export function PecahanSim() {
  const [n1, setN1] = useState(1)
  const [d1, setD1] = useState(4)
  const [n2, setN2] = useState(2)
  const [d2, setD2] = useState(4)
  const [quizOk, setQuizOk] = useState(false)

  const v1 = n1 / d1
  const v2 = n2 / d2
  const cmp = Math.abs(v1 - v2) < 1e-9 ? "=" : v1 > v2 ? ">" : "<"

  const wheel = (n: number, d: number, cx: number, color: string, key: string) => {
    const R = 62
    const slices = Array.from({ length: d }, (_, i) => {
      const a0 = (i / d) * Math.PI * 2 - Math.PI / 2
      const a1 = ((i + 1) / d) * Math.PI * 2 - Math.PI / 2
      const filled = i < n
      return (
        <path
          key={`${key}-${i}`}
          d={`M ${cx} 78 L ${cx + Math.cos(a0) * R} ${78 + Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${cx + Math.cos(a1) * R} ${78 + Math.sin(a1) * R} Z`}
          fill={filled ? color : "rgba(255,255,255,.06)"}
          stroke="#0a1420"
          strokeWidth="2"
        />
      )
    })
    return (
      <g>
        {slices}
        <circle cx={cx} cy="78" r={R} fill="none" stroke={color} strokeWidth="2.5" opacity="0.7" />
      </g>
    )
  }

  return (
    <LabShell
      icon={<Pizza className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Pecahan a/b artinya a potong dari b potongan sama besar. Penyebut sama → bandingkan pembilang. Beda penyebut → samakan dulu."
      slug="pecahan"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <svg viewBox="0 0 360 170" className="block w-full">
          <rect x="0" y="0" width="360" height="170" fill="#140b06" />
          <circle cx="90" cy="150" r="46" fill="#7c2d12" opacity="0.35" />
          <circle cx="270" cy="150" r="46" fill="#7c2d12" opacity="0.35" />
          {wheel(n1, d1, 90, "#fb923c", "a")}
          {wheel(n2, d2, 270, "#facc15", "b")}
          <text x="90" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fdba74">{n1}/{d1} = {v1.toFixed(2)}</text>
          <text x="180" y="86" textAnchor="middle" fontSize="26" fontWeight="black" fill="#fff7ed">{cmp}</text>
          <text x="270" y="160" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fde68a">{n2}/{d2} = {v2.toFixed(2)}</text>
        </svg>
      }
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-orange-300">Kiri {n1}/{d1}</span>
            <input type="range" min={0} max={d1} value={n1} onChange={(e) => setN1(Number(e.target.value))} className="w-full accent-orange-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-orange-300">Potong {d1}</span>
            <input type="range" min={1} max={8} value={d1} onChange={(e) => { setD1(Number(e.target.value)); setN1((n) => Math.min(n, Number(e.target.value))) }} className="w-full accent-orange-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-amber-200">Kanan {n2}/{d2}</span>
            <input type="range" min={0} max={d2} value={n2} onChange={(e) => setN2(Number(e.target.value))} className="w-full accent-amber-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-amber-200">Potong {d2}</span>
            <input type="range" min={1} max={8} value={d2} onChange={(e) => { setD2(Number(e.target.value)); setN2((n) => Math.min(n, Number(e.target.value))) }} className="w-full accent-amber-400" />
          </label>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)]">
              <Scale className="h-3.5 w-3.5" /> Tantangan: buat keduanya senilai (tanda =)
            </p>
            <div className="mt-1.5 flex gap-2">
              <button
                onClick={() => {
                  if (cmp === "=" && d1 !== d2) { setQuizOk(true); sfx.correct(); grantXp(10); markLabDone("pecahan") }
                  else if (cmp === "=") { sfx.correct(); grantXp(5); markLabDone("pecahan"); setQuizOk(true) }
                  else sfx.wrong()
                }}
                className="flex-1 rounded-lg bg-orange-400/20 px-3 py-1.5 text-orange-200">
                Cek senilai
              </button>
              <button
                onClick={() => { setD2(d1); setN2(Math.round(v1 * d1)); sfx.click() }}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-[var(--text-muted)]">
                Samakan penyebut
              </button>
            </div>
            {quizOk && <p className="mt-1.5 text-teal-300">Hebat! Pecahan senilai dikuasai. +XP masuk.</p>}
          </div>
        </div>
      }
      stats={<>{n1}/{d1} {cmp} {n2}/{d2} | desimal {v1.toFixed(3)} vs {v2.toFixed(3)}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { sfx.click(); grantXp(5); markLabDone("pecahan") }}
      shareTitle="Lab Pizza Pecahan"
      sharePayload={{ type: "lab", slug: "pecahan" }}
    />
  )
}
