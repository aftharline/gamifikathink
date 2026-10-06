"use client"

import { useState } from "react"
import { Map as MapIcon, CloudRain, Thermometer, Trees, Check, X } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("peta-lapisan")!

type Layer = "hujan" | "suhu" | "hutan"
const LAYERS: { id: Layer; label: string; icon: typeof CloudRain }[] = [
  { id: "hujan", label: "Curah hujan", icon: CloudRain },
  { id: "suhu", label: "Suhu", icon: Thermometer },
  { id: "hutan", label: "Hutan", icon: Trees },
]

// 6 zona stilasi Indonesia: barat basah-dingin? sederhanakan pola:
// Sumatra & Kalimantan & Papua = hujan tinggi + hutan lebat; Jawa = suhu hangat + jarang hutan; Nusa = kering; Sulawesi = sedang
const ZONES = [
  { id: "sumatra", label: "Sumatra", x: 52, y: 78, w: 66, h: 52, hujan: 3, suhu: 2, hutan: 3 },
  { id: "jawa", label: "Jawa", x: 128, y: 128, w: 84, h: 26, hujan: 2, suhu: 3, hutan: 1 },
  { id: "kalimantan", label: "Kalimantan", x: 148, y: 62, w: 70, h: 56, hujan: 3, suhu: 2, hutan: 3 },
  { id: "sulawesi", label: "Sulawesi", x: 232, y: 84, w: 44, h: 60, hujan: 2, suhu: 2, hutan: 2 },
  { id: "nusa", label: "Nusa Tenggara", x: 196, y: 140, w: 90, h: 20, hujan: 1, suhu: 3, hutan: 1 },
  { id: "papua", label: "Papua", x: 292, y: 100, w: 56, h: 44, hujan: 3, suhu: 1, hutan: 3 },
]

// Peta lapisan: toggle hujan/suhu/hutan, cocokkan pola, tebak zona
export function PetaSim() {
  const [on, setOn] = useState<Record<Layer, boolean>>({ hujan: true, suhu: false, hutan: false })
  const [sel, setSel] = useState("Nyalakan lapisan, lalu klik zona untuk info polanya.")
  const quizZone = ZONES[4]
  const [quizOk, setQuizOk] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  const toggle = (l: Layer) => {
    setOn({ ...on, [l]: !on[l] })
    sfx.click()
  }

  const layerColor = (z: (typeof ZONES)[number]): string => {
    if (on.hutan && !on.hujan && !on.suhu) return ["#14532d", "#166534", "#15803d", "#16a34a"][z.hutan] ?? "#166534"
    if (on.hujan && !on.hutan && !on.suhu) return ["#0c4a6e", "#0369a1", "#0284c7", "#38bdf8"][z.hujan] ?? "#0369a1"
    if (on.suhu && !on.hujan && !on.hutan) return ["#1c1917", "#7c2d12", "#c2410c", "#fb923c"][z.suhu] ?? "#7c2d12"
    // kombinasi: hijau bila hujan+hutan tinggi
    if (z.hujan === 3 && z.hutan === 3) return "#15803d"
    if (z.hujan === 1) return "#92400e"
    return "#3f6212"
  }

  const guess = (id: string) => {
    setPicked(id)
    if (id === quizZone.id) {
      setQuizOk(true); sfx.correct(); grantXp(10); markLabDone("peta-lapisan")
    } else sfx.wrong()
  }

  return (
    <LabShell
      icon={<MapIcon className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Hujan tinggi + hutan lebat berkumpul di Sumatra, Kalimantan, Papua. Nusa Tenggara kering dan panas. Pola iklim membentuk vegetasi."
      slug="peta-lapisan"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <svg viewBox="0 0 360 180" className="block w-full">
          <rect x="0" y="0" width="360" height="180" fill="#0a1414" />
          {ZONES.map((z) => (
            <g key={z.id} className="cursor-pointer" onClick={() => { setSel(`${z.label}: hujan ${z.hujan}/3, suhu ${z.suhu}/3, hutan ${z.hutan}/3.`); sfx.click() }}>
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="10" fill={layerColor(z)} stroke={picked === z.id ? "#fbbf24" : "rgba(255,255,255,.25)"} strokeWidth={picked === z.id ? 3 : 1.5} opacity={Object.values(on).some(Boolean) ? 1 : 0.35} />
              <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 4} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#fff">
                {z.label}
              </text>
            </g>
          ))}
          {!Object.values(on).some(Boolean) && (
            <text x="180" y="90" textAnchor="middle" fontSize="12" fill="#94a3b8">Nyalakan minimal 1 lapisan</text>
          )}
        </svg>
      }
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex gap-1.5">
            {LAYERS.map((l) => (
              <button key={l.id} onClick={() => toggle(l.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 font-semibold ${on[l.id] ? "bg-emerald-400/20 text-emerald-100" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>
                <l.icon className="h-3.5 w-3.5" /> {l.label}
              </button>
            ))}
          </div>
          <p className="min-h-6 leading-relaxed text-[var(--text-secondary)]">{sel}</p>
          <div className="flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1.5">
            <span className="text-[10px] text-[var(--text-muted)]">rendah</span>
            <div className="h-2 flex-1 rounded-full bg-gradient-to-r from-slate-700 via-amber-600 to-emerald-500" />
            <span className="text-[10px] text-[var(--text-muted)]">tinggi</span>
            <span className="ml-auto text-[10px] text-[var(--text-muted)]">skala 1–3</span>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="font-semibold text-[var(--text-primary)]">
              Tebak: zona paling kering + terpanas? ({quizOk ? "benar!" : "pilih di peta"})
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ZONES.map((z) => (
                <button key={z.id} onClick={() => guess(z.id)}
                  className={`rounded-lg px-2.5 py-1 ${quizOk && z.id === quizZone.id ? "bg-teal-400/25 text-teal-100" : "border border-[var(--border)] text-[var(--text-secondary)]"}`}>
                  {z.label}
                </button>
              ))}
            </div>
            {quizOk ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-teal-300"><Check className="h-4 w-4" /> Tepat! +10 XP.</p>
            ) : picked ? (
                <p className="mt-1.5 flex items-center gap-1.5 text-red-300"><X className="h-4 w-4" /> Belum. Cari hujan 1 + suhu 3.</p>
            ) : null}
          </div>
        </div>
      }
      stats={<>Lapisan aktif: {LAYERS.filter((l) => on[l.id]).map((l) => l.label).join(", ") || "tak ada"}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("peta-lapisan") }}
      shareTitle="Lab Peta Lapisan"
      sharePayload={{ type: "lab", slug: "peta-lapisan" }}
    />
  )
}
