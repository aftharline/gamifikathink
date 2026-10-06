"use client"

import { useEffect, useRef, useState } from "react"
import { Store, TrendingUp, TrendingDown } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("pasar")!

// Pasar mini: kurva supply-demand, ekuilibrium bergerak, skenario kejut
export function PasarSim() {
  const [supply, setSupply] = useState(50)
  const [demand, setDemand] = useState(50)
  const [shock, setShock] = useState<null | { label: string; ds: number; dd: number }>(null)
  const [guesses, setGuesses] = useState(0)
  const [wins, setWins] = useState(0)
  const [priceHist, setPriceHist] = useState<number[]>([50])
  const ref = useRef<HTMLCanvasElement>(null)

  // harga ekuilibrium 0-100: naik saat demand tinggi / supply rendah
  const price = Math.min(100, Math.max(0, 50 + (demand - supply) * 0.9))
  const qty = Math.min(100, Math.max(0, 100 - Math.abs(demand - supply) * 0.7 - (100 - (supply + demand) / 2) * 0.2))

  /* eslint-disable react-hooks/set-state-in-effect -- rekam riwayat harga tiap berubah */
  useEffect(() => {
    setPriceHist((h) => {
      if (h[h.length - 1] === Math.round(price)) return h
      return [...h.slice(-23), Math.round(price)]
    })
  }, [price])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const W = c.width, H = c.height
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#1c1a0a"); bg.addColorStop(1, "#12100a")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    const X = (q: number) => 30 + (q / 100) * (W - 50)
    const Y = (p: number) => H - 26 - (p / 100) * (H - 52)
    // grid
    ctx.strokeStyle = "rgba(250,204,21,.1)"
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath(); ctx.moveTo(X(i * 10), Y(0)); ctx.lineTo(X(i * 10), Y(100)); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(X(0), Y(i * 10)); ctx.lineTo(X(100), Y(i * 10)); ctx.stroke()
    }
    ctx.fillStyle = "#94a3b8"; ctx.font = "9px sans-serif"
    ctx.fillText("Q", W - 12, Y(0) + 3)
    ctx.fillText("P", X(0) - 14, 14)
    // kurva demand (turun): P = 100 - Q + (demand-50)
    const dem = (q: number) => 100 - q + (demand - 50)
    const sup = (q: number) => q - 50 + 50 - (supply - 50) + 0 // P = Q + (50 - supply)
    const supY = (q: number) => q + (50 - supply)
    ctx.lineWidth = 2.5
    ctx.save()
    ctx.shadowColor = "#60a5fa"; ctx.shadowBlur = 7
    ctx.strokeStyle = "#60a5fa"
    ctx.beginPath()
    for (let q = 0; q <= 100; q += 2) {
      const x = X(q), y = Y(Math.max(0, Math.min(100, dem(q))))
      if (q === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.restore()
    ctx.save()
    ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 7
    ctx.strokeStyle = "#4ade80"
    ctx.beginPath()
    for (let q = 0; q <= 100; q += 2) {
      const x = X(q), y = Y(Math.max(0, Math.min(100, supY(q))))
      if (q === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.restore()
    ctx.lineWidth = 1
    void sup
    // titik ekuilibrium
    const eq = { x: X(qty), y: Y(price) }
    ctx.save()
    ctx.shadowColor = "#facc15"; ctx.shadowBlur = 12
    ctx.fillStyle = "#facc15"
    ctx.beginPath(); ctx.arc(eq.x, eq.y, 6, 0, Math.PI * 2); ctx.fill()
    ctx.restore()
    // garis bantu
    ctx.save()
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "rgba(250,204,21,.5)"
    ctx.beginPath(); ctx.moveTo(eq.x, eq.y); ctx.lineTo(eq.x, Y(0)); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(eq.x, eq.y); ctx.lineTo(X(0), eq.y); ctx.stroke()
    ctx.restore()
    ctx.fillStyle = "#fde68a"; ctx.font = "bold 10px sans-serif"
    ctx.fillText(`E(Q=${qty.toFixed(0)}, P=${price.toFixed(0)})`, Math.min(eq.x + 8, W - 110), eq.y - 8)
    ctx.fillStyle = "#93c5fd"
    ctx.fillText("Demand", W - 52, 16)
    ctx.fillStyle = "#86efac"
    ctx.fillText("Supply", W - 52, 28)
  }, [supply, demand, price, qty])

  const scenario = () => {
    const opts = [
      { label: "Panen raya: supply +20", ds: 20, dd: 0 },
      { label: "Viral di medsos: demand +25", ds: 0, dd: 25 },
      { label: "Kemarau: supply -20", ds: -20, dd: 0 },
    ]
    const s = opts[Math.floor(Math.random() * opts.length)]
    setShock(s)
    setSupply((v) => Math.min(100, Math.max(0, v + s.ds)))
    setDemand((v) => Math.min(100, Math.max(0, v + s.dd)))
    sfx.click()
  }

  const guessDir = (dir: "up" | "down") => {
    // ramalkan arah harga setelah kejut terakhir: bandingkan dengan 50
    const up = price > 50
    const ok = (dir === "up") === up
    setGuesses(guesses + 1)
    if (ok) {
      setWins(wins + 1); sfx.correct(); grantXp(3)
      if (wins + 1 >= 3) markLabDone("pasar")
    } else sfx.wrong()
  }

  return (
    <LabShell
      icon={<Store className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Harga naik saat demand tinggi atau supply rendah. Titik temu kurva = ekuilibrium (E). Kejut pasar menggeser kurva."
      slug="pasar"
      greeting={meta.greeting}
      story={meta.story}
      scene={<canvas ref={ref} width={360} height={220} className="block w-full" />}
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-green-300">Supply {supply}</span>
            <input type="range" min={0} max={100} value={supply} onChange={(e) => setSupply(Number(e.target.value))} className="w-full accent-green-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-24 shrink-0 font-mono text-sky-300">Demand {demand}</span>
            <input type="range" min={0} max={100} value={demand} onChange={(e) => setDemand(Number(e.target.value))} className="w-full accent-sky-400" />
          </label>
          <div className="flex gap-2">
            <button onClick={scenario} className="flex-1 rounded-xl bg-amber-400/15 py-2 font-semibold text-amber-200">
              Acak kejut pasar
            </button>
          </div>
          {priceHist.length > 1 && (
            <svg viewBox="0 0 240 40" className="block w-full rounded-lg bg-black/30">
              <polyline
                points={priceHist.map((p, i) => `${(i / Math.max(1, priceHist.length - 1)) * 232 + 4},${36 - (p / 100) * 30}`).join(" ")}
                fill="none" stroke="#facc15" strokeWidth="2"
              />
              <text x="4" y="12" fontSize="9" fill="#94a3b8">riwayat harga</text>
            </svg>
          )}
          {shock && <p className="rounded-lg bg-black/30 p-2 text-center text-amber-200">{shock.label}: harga sekarang {price > 50 ? "NAIK" : price < 50 ? "TURUN" : "tetap"}?</p>}
          <div className="flex gap-2">
            <button onClick={() => guessDir("up")} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--border)] py-1.5 hover:border-green-400/50">
              <TrendingUp className="h-3.5 w-3.5 text-green-300" /> Naik
            </button>
            <button onClick={() => guessDir("down")} className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-[var(--border)] py-1.5 hover:border-red-400/50">
              <TrendingDown className="h-3.5 w-3.5 text-red-300" /> Turun
            </button>
            <span className="rounded-lg bg-black/30 px-2 py-1.5 font-mono">tebakan {wins}/3</span>
          </div>
        </div>
      }
      stats={<>Ekuilibrium Q={qty.toFixed(0)} P={price.toFixed(0)} | {price > 55 ? "mahal" : price < 45 ? "murah" : "seimbang"}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("pasar") }}
      shareTitle="Lab Pasar Mini"
      sharePayload={{ type: "lab", slug: "pasar" }}
    />
  )
}
