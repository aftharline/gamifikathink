"use client"

import { useEffect, useRef, useState } from "react"
import { Leaf, Play, Pause, RotateCcw } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"
import { useLowFx } from "@/lib/use-fps"

const meta = getLab("rantai-makanan")!
const ORDER = ["Produsen", "Herbivora", "Karnivora", "Pengurai"]

// Rantai makanan: susun urutan, simulasi populasi 20 musim
export function RantaiSim() {
  const [chain, setChain] = useState<string[]>(["Karnivora", "Produsen", "Pengurai", "Herbivora"])
  const [running, setRunning] = useState(false)
  const [season, setSeason] = useState(0)
  const [pops, setPops] = useState<number[]>([100, 80, 50, 60])
  const [result, setResult] = useState<string | null>(null)
  const lowFx = useLowFx()
  const ref = useRef<HTMLCanvasElement>(null)

  const correct = ORDER.every((v, i) => chain[i] === v)

  useEffect(() => {
    if (!running) return
    if (season >= 20) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- akhir simulasi sekali
      setRunning(false)
      const alive = pops.every((p) => p > 5)
      setResult(alive ? "Ekosistem selamat 20 musim! +10 XP." : "Populasi punah. Coba susunan seimbang.")
      if (alive) { sfx.correct(); grantXp(10); markLabDone("rantai-makanan") }
      else sfx.wrong()
      return
    }
    const id = setTimeout(() => {
      setSeason(season + 1)
      setPops((pp) => {
        if (!correct) {
          // rantai salah: karnivora kelaparan, produsen meledak lalu busuk
          return [Math.min(160, pp[0] + 8), Math.max(0, pp[1] - 6), Math.max(0, pp[2] - 9), pp[3]]
        }
        const wob = Math.sin(season / 2.4) * 8
        return [
          Math.max(20, 100 + wob),
          Math.max(15, 80 + wob * 0.8),
          Math.max(10, 50 + wob * 0.5),
          Math.max(15, 60 - wob * 0.4),
        ]
      })
    }, 320)
    return () => clearTimeout(id)
  }, [running, season, pops, correct])

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const W = c.width, H = c.height
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#0a2420"); bg.addColorStop(1, "#081410")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    const colors = ["#4ade80", "#facc15", "#fb923c", "#a78bfa"]
    const names = ["Prod", "Herb", "Karn", "Urai"]
    pops.forEach((p, i) => {
      const h = Math.max(4, (p / 160) * (H - 50))
      const x = 30 + i * 82
      ctx.fillStyle = colors[i]
      ctx.globalAlpha = correct ? 1 : 0.45
      ctx.fillRect(x, H - 24 - h, 56, h)
      ctx.globalAlpha = 1
      ctx.fillStyle = "#e2e8f0"
      ctx.font = "10px sans-serif"
      ctx.fillText(names[i], x + 12, H - 10)
      ctx.fillText(`${Math.round(p)}`, x + 14, H - 30 - h)
    })
    ctx.fillStyle = "#94a3b8"
    ctx.font = "11px sans-serif"
      ctx.fillText(`Musim ${season}/20 ${correct ? "(rantai benar)" : "(rantai SALAH, perbaiki!)"}`, 12, 16)
    if (!lowFx && running && correct) {
      ctx.fillStyle = "rgba(74,222,128,.5)"
      for (let i = 0; i < 8; i++) {
        const x = (season * 37 + i * 97) % W
        const y = (season * 23 + i * 61) % (H - 40) + 20
        ctx.fillRect(x, y, 2, 2)
      }
    }
  }, [pops, season, correct, running, lowFx])

  const swap = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= chain.length) return
    sfx.click()
    setChain((c) => {
      const n = [...c]
      ;[n[i], n[j]] = [n[j], n[i]]
      return n
    })
  }

  return (
    <LabShell
      icon={<Leaf className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Energi mengalir: produsen → herbivora → karnivora → pengurai. Urutan salah membuat populasi runtuh dalam simulasi."
      slug="rantai-makanan"
      greeting={meta.greeting}
      story={meta.story}
      scene={<canvas ref={ref} width={360} height={190} className="block w-full" />}
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            {chain.map((c, i) => (
              <div key={c} className="flex flex-1 items-center gap-1">
                <button
                  className={`flex-1 rounded-lg border px-1 py-2 text-center font-semibold ${correct ? "border-green-400/40 bg-green-400/10 text-green-200" : "border-[var(--border)] text-[var(--text-secondary)]"}`}>
                  {c}
                </button>
                <span className="flex flex-col gap-0.5">
                  <button onClick={() => swap(i, -1)} className="rounded bg-white/10 px-1 text-[10px]">‹</button>
                  <button onClick={() => swap(i, 1)} className="rounded bg-white/10 px-1 text-[10px]">›</button>
                </span>
                {i < chain.length - 1 && <span className="text-[var(--text-muted)]">→</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setSeason(0); setPops([100, 80, 50, 60]); setResult(null); setRunning(true); sfx.click() }}
              disabled={running}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-400/15 py-2 font-semibold text-green-200 disabled:opacity-40">
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? `Simulasi musim ${season}` : "Jalankan 20 musim"}
            </button>
            <button onClick={() => { setRunning(false); setSeason(0); setPops([100, 80, 50, 60]); setResult(null) }}
              className="rounded-xl border border-[var(--border)] px-3 py-2 text-[var(--text-muted)]">
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          {result && <p className="rounded-xl bg-black/30 p-2 text-center text-teal-300">{result}</p>}
        </div>
      }
      stats={<>Urutan: {chain.join(" → ")} {correct ? "| BENAR" : "| belum tepat"} | legenda: hijau produsen · kuning herbivora · oranye karnivora · ungu pengurai</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("rantai-makanan") }}
      shareTitle="Lab Rantai Makanan"
      sharePayload={{ type: "lab", slug: "rantai-makanan" }}
    />
  )
}
