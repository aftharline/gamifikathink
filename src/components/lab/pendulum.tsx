"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Clock3, Pause, Play, Snowflake, GitCompareArrows } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { useLowFx } from "@/lib/use-fps"
import { createPool, spawn, step, draw, type Particle } from "@/lib/fx"

const GRAVS = [
  { v: 1.6, label: "Bulan" },
  { v: 9.8, label: "Bumi" },
  { v: 24.8, label: "Jupiter" },
]

// Bandul maksimal: jejak fosfor, busur live, bekukan puncak, banding Bumi-Bulan
export function PendulumSim() {
  const [len, setLen] = useState(1)
  const [grav, setGrav] = useState(9.8)
  const [theta0, setTheta0] = useState(30)
  const [paused, setPaused] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [compare, setCompare] = useState(false)
  const [slow, setSlow] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stripRef = useRef<HTMLCanvasElement>(null)
  const cmpRef = useRef<HTMLCanvasElement>(null)
  const tRef = useRef(0)
  const histRef = useRef<number[]>([])
  const lowFx = useLowFx()
  const poolRef = useRef<Particle[]>(createPool())

  const T = 2 * Math.PI * Math.sqrt(len / grav)

  const thetaAt = useCallback(
    (tt: number) => ((theta0 * Math.PI) / 180) * Math.cos((2 * Math.PI * tt) / T),
    [theta0, T]
  )

  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (!paused && !frozen) {
        tRef.current += (1 / 60) * (slow ? 0.25 : 1)
        const th = thetaAt(tRef.current)
        histRef.current.push(th)
        if (histRef.current.length > 180) histRef.current.shift()
        // kilau di titik balik
        if (Math.abs(Math.abs(th) - (theta0 * Math.PI) / 180) < 0.02 && !lowFx) {
          const c = canvasRef.current
          if (c) {
            const L = len * 62
            const bx = c.width / 2 + Math.sin(th) * L
            const by = 34 + Math.cos(th) * L
            spawn(poolRef.current, bx, by, 3, "#fbbf24", 0.8, lowFx)
          }
        }
      }
      const c = canvasRef.current
      if (c) {
        const ctx = c.getContext("2d")
        if (ctx) {
          const W = c.width, H = c.height
          // jejak fosfor: tutup semi-transparan, bukan clear
          if (lowFx) {
            const bg = ctx.createLinearGradient(0, 0, 0, H)
            bg.addColorStop(0, "#0c1a2e"); bg.addColorStop(1, "#0a1420")
            ctx.fillStyle = bg
            ctx.fillRect(0, 0, W, H)
          } else {
            ctx.fillStyle = "rgba(10,20,32,.28)"
            ctx.fillRect(0, 0, W, H)
          }
          const px = W / 2, py = 34
          const th = thetaAt(tRef.current)
          // busur derajat penuh
          ctx.strokeStyle = "rgba(148,163,184,.35)"
          for (let d = -60; d <= 60; d += 15) {
            const r = (d * Math.PI) / 180
            ctx.beginPath()
            ctx.moveTo(px + Math.sin(r) * 44, py + Math.cos(r) * 44)
            ctx.lineTo(px + Math.sin(r) * 54, py + Math.cos(r) * 54)
            ctx.stroke()
            if (d % 30 === 0) {
              ctx.fillStyle = "rgba(148,163,184,.7)"
              ctx.font = "9px sans-serif"
              ctx.fillText(`${d}°`, px + Math.sin(r) * 62 - 8, py + Math.cos(r) * 62 + 3)
            }
          }
          const L = len * 62
          const bx = px + Math.sin(th) * L, by = py + Math.cos(th) * L
          // garis sudut live
          ctx.save()
          ctx.strokeStyle = "rgba(251,191,36,.5)"
          ctx.setLineDash([4, 4])
          ctx.beginPath()
          ctx.moveTo(px, py)
          ctx.lineTo(px + Math.sin(th) * 60, py + Math.cos(th) * 60)
          ctx.stroke()
          ctx.restore()
          // penyangga metalik
          const sg = ctx.createLinearGradient(px - 40, 0, px + 40, 0)
          sg.addColorStop(0, "#1e3a5f"); sg.addColorStop(0.5, "#475569"); sg.addColorStop(1, "#1e3a5f")
          ctx.fillStyle = sg
          ctx.fillRect(px - 42, py - 13, 84, 11)
          ctx.fillStyle = "#2dd4bf"
          ctx.fillRect(px - 42, py - 4, 84, 2)
          // tali metalik
          const tg = ctx.createLinearGradient(px, py, bx, by)
          tg.addColorStop(0, "#94a3b8"); tg.addColorStop(1, "#475569")
          ctx.strokeStyle = tg
          ctx.lineWidth = 3
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke()
          ctx.lineWidth = 1
          // bayangan lantai mengikuti beban (memudar saat tinggi)
          const hFrac = Math.min(1, (by - 40) / 160)
          ctx.fillStyle = `rgba(0,0,0,${0.4 - hFrac * 0.22})`
          ctx.beginPath(); ctx.ellipse(bx, H - 8, 22 - hFrac * 8, 5, 0, 0, Math.PI * 2); ctx.fill()
          // beban glow + highlight
          const g = ctx.createRadialGradient(bx, by, 2, bx, by, lowFx ? 12 : 20)
          g.addColorStop(0, "#fef3c7"); g.addColorStop(0.4, "#f59e0b"); g.addColorStop(1, "rgba(245,158,11,0)")
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(bx, by, lowFx ? 12 : 20, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = "#fbbf24"
          ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = "rgba(255,255,255,.75)"
          ctx.beginPath(); ctx.arc(bx - 3, by - 3, 2.5, 0, Math.PI * 2); ctx.fill()
          if (!lowFx) {
            step(poolRef.current, 0.02)
            draw(ctx, poolRef.current)
          }
          // penanda puncak
          ctx.fillStyle = "rgba(251,191,36,.9)"
          ctx.font = "10px sans-serif"
          ctx.fillText(`θ=${((th * 180) / Math.PI).toFixed(1)}°`, 8, 14)
        }
      }
      const s = stripRef.current
      if (s) {
        const ctx = s.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, s.width, s.height)
          ctx.fillStyle = "rgba(10,20,32,.9)"
          ctx.fillRect(0, 0, s.width, s.height)
          ctx.strokeStyle = "rgba(148,163,184,.3)"
          ctx.beginPath(); ctx.moveTo(0, s.height / 2); ctx.lineTo(s.width, s.height / 2); ctx.stroke()
          // pita periode
          const periodPx = (T / 6) * s.width
          ctx.fillStyle = "rgba(45,212,191,.12)"
          ctx.fillRect(0, 0, periodPx, s.height)
          ctx.save()
          if (!lowFx) { ctx.shadowColor = "#2dd4bf"; ctx.shadowBlur = 5 }
          ctx.strokeStyle = "#2dd4bf"
          ctx.lineWidth = 1.8
          ctx.beginPath()
          histRef.current.forEach((v, i) => {
            const x = (i / 180) * s.width
            const y = s.height / 2 - (v / ((theta0 * Math.PI) / 180 || 1)) * (s.height / 2 - 4)
            if (i === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          })
          ctx.stroke()
          ctx.restore()
          ctx.lineWidth = 1
          ctx.fillStyle = "rgba(45,212,191,.8)"
          ctx.font = "9px sans-serif"
          ctx.fillText("1 periode →", 4, 10)
        }
      }
      // panel banding Bumi vs Bulan
      const mc = cmpRef.current
      if (mc && compare) {
        const ctx = mc.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, mc.width, mc.height)
          const cfgs = [
            { g: 9.8, label: "Bumi", color: "#2dd4bf", x0: 60 },
            { g: 1.6, label: "Bulan", color: "#a78bfa", x0: 200 },
          ]
          cfgs.forEach(({ g, label, color, x0 }) => {
            const TT = 2 * Math.PI * Math.sqrt(len / g)
            const th = ((theta0 * Math.PI) / 180) * Math.cos((2 * Math.PI * tRef.current) / TT)
            const L = 52
            const bx = x0 + Math.sin(th) * L, by = 26 + Math.cos(th) * L
            ctx.strokeStyle = "#475569"
            ctx.beginPath(); ctx.moveTo(x0, 26); ctx.lineTo(bx, by); ctx.stroke()
            ctx.fillStyle = color
            ctx.beginPath(); ctx.arc(bx, by, 7, 0, Math.PI * 2); ctx.fill()
            ctx.fillStyle = "#94a3b8"
            ctx.font = "9px sans-serif"
            ctx.fillText(`${label} T=${TT.toFixed(2)}s`, x0 - 34, 96)
          })
        }
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [len, grav, theta0, T, paused, frozen, compare, lowFx, thetaAt, slow])

  return (
    <LabShell
      icon={<Clock3 className="h-5 w-5" />}
      title="Bandul Harmonik"
      subject="Fisika"
      theory="Periode bandul hanya bergantung pada panjang tali dan gravitasi: T = 2 phi akar(l/g). Massa beban tidak berpengaruh. Buktikan dengan membandingkan Bumi vs Bulan."
      scene={
        <div>
          <canvas ref={canvasRef} width={360} height={215} className="block w-full" />
          <canvas ref={stripRef} width={360} height={44} className="block w-full border-t border-teal-400/10" />
          {compare && <canvas ref={cmpRef} width={360} height={104} className="block w-full border-t border-teal-400/10" />}
        </div>
      }
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Tali {len.toFixed(1)} m</span>
            <input type="range" min={0.2} max={2} step={0.1} value={len} onChange={(e) => setLen(Number(e.target.value))} className="w-full accent-teal-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Sudut {theta0}°</span>
            <input type="range" min={5} max={60} value={theta0} onChange={(e) => setTheta0(Number(e.target.value))} className="w-full accent-teal-400" />
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex gap-1.5">
              {GRAVS.map((g) => (
                <button key={g.v} onClick={() => setGrav(g.v)}
                  className={`rounded-lg px-2.5 py-1 ${grav === g.v ? "bg-teal-400/20 text-teal-200" : "text-[var(--text-muted)] hover:text-teal-200"}`}>
                  {g.label}
                </button>
              ))}
            </div>
            <button onClick={() => setPaused(!paused)} title={paused ? "Putar" : "Jeda"}
              className="rounded-lg border border-[var(--border)] p-1.5 text-teal-200">
              {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button onClick={() => setSlow(!slow)} title="Gerak lambat 0.25x"
              className={`rounded-lg px-2.5 py-1 font-mono ${slow ? "bg-amber-400/20 text-amber-200" : "text-[var(--text-muted)]"}`}>
              0.25x
            </button>
            <button onClick={() => setFrozen(!frozen)} title="Bekukan di puncak"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${frozen ? "bg-sky-400/20 text-sky-200" : "text-[var(--text-muted)] hover:text-sky-200"}`}>
              <Snowflake className="h-3.5 w-3.5" /> Puncak
            </button>
            <button onClick={() => setCompare(!compare)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${compare ? "bg-violet-400/20 text-violet-200" : "text-[var(--text-muted)] hover:text-violet-200"}`}>
              <GitCompareArrows className="h-3.5 w-3.5" /> Bumi-Bulan
            </button>
          </div>
        </div>
      }
      stats={<>T = 2phi akar({len.toFixed(1)}/{grav}) = <span className="fx-tick-glow rounded px-1">{T.toFixed(2)} s</span> | f = {(1 / T).toFixed(2)} Hz</>}
      actionLabel="Ayun ulang (+5 XP)"
      onAction={() => { tRef.current = 0; histRef.current = []; sfx.click(); grantXp(5); markLabDone("bandul") }}
      shareTitle="Lab Bandul"
      sharePayload={{ type: "lab", slug: "bandul" }}
    />
  )
}
