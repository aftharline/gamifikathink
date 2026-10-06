"use client"

import { useEffect, useRef, useState } from "react"
import { Cog, Play, Pause, Move } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"
import { useLowFx } from "@/lib/use-fps"
import { createPool, spawn, step, draw, type Particle } from "@/lib/fx"
import { katrolLayout, KATROL_W as W } from "@/lib/katrol-geometry"

const meta = getLab("katrol")!
const H = 236
const GROUND = H - 24

// Katrol rebuilt: layout muat penuh, tali-beban terhubung satu variabel,
// drag beban, jeda + kecepatan, vektor opsional, panah berlabel pill.
export function KatrolSim() {
  const [angle, setAngle] = useState(30)
  const [mass, setMass] = useState(5)
  const [mu, setMu] = useState(0.1)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [showVectors, setShowVectors] = useState(true)
  const ref = useRef<HTMLCanvasElement>(null)
  const lowFx = useLowFx()
  const poolRef = useRef<Particle[]>(createPool())
  const sRef = useRef(0.35) // posisi tali 0..1 (0 = bawah lereng)
  const dragRef = useRef(false)

  const g = 9.8
  const { rad, L, bx } = katrolLayout(angle)
  const force = mass * g * (Math.sin(rad) + mu * Math.cos(rad))
  const weight = mass * g

  useEffect(() => {
    let raf = 0
    const loop = () => {
      if (playing) {
        // kecepatan sebanding F/m, arah naik lereng
        const v = 0.0016 * (force / Math.max(1, mass)) * speed + 0.0009 * speed
        sRef.current += v
        if (sRef.current >= 0.95) sRef.current = 0.05
      }
      const c = ref.current
      if (c) {
        const ctx = c.getContext("2d")
        if (ctx) {
          const lay = katrolLayout(angle)
          const r = lay.rad
          const ss = Math.min(0.95, Math.max(0.05, sRef.current))
          const lx = lay.bx + 14 + ss * (lay.L - 44) * Math.cos(r)
          const ly = lay.by - 4 - ss * (lay.L - 44) * Math.sin(r)
          const hx = lay.topX + 46
          const hy = Math.min(GROUND - 12, lay.topY + 30 + (1 - ss) * 70)
          // langit + grid
          const bg = ctx.createLinearGradient(0, 0, 0, H)
          bg.addColorStop(0, "#0d1830"); bg.addColorStop(0.65, "#101f3a"); bg.addColorStop(1, "#0a1420")
          ctx.fillStyle = bg
          ctx.fillRect(0, 0, W, H)
          ctx.strokeStyle = "rgba(250,204,21,.07)"
          for (let gx = 0; gx < W; gx += 28) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
          // tanah + bayangan
          ctx.fillStyle = "#0d1b2a"
          ctx.fillRect(0, GROUND, W, H - GROUND)
          ctx.fillStyle = "rgba(250,204,21,.6)"
          ctx.fillRect(0, GROUND, W, 2)
          // badan segitiga bergradien + garis kontur
          const tri = ctx.createLinearGradient(lay.bx, lay.by, lay.topX, lay.topY)
          tri.addColorStop(0, "#1b3358"); tri.addColorStop(1, "#12233f")
          ctx.fillStyle = tri
          ctx.beginPath()
          ctx.moveTo(lay.bx - 8, lay.by)
          ctx.lineTo(lay.topX + 14, lay.topY)
          ctx.lineTo(lay.topX + 14, lay.by)
          ctx.closePath(); ctx.fill()
          ctx.strokeStyle = "rgba(250,204,21,.25)"
          for (let i = 1; i <= 3; i++) {
            const t = i / 4
            ctx.beginPath()
            ctx.moveTo(lay.bx - 8 + (lay.topX + 22 - lay.bx) * t, lay.by)
            ctx.lineTo(lay.topX + 14, lay.topY + (lay.by - lay.topY) * t)
            ctx.stroke()
          }
          // permukaan lereng highlight
          ctx.strokeStyle = "rgba(250,204,21,.55)"
          ctx.lineWidth = 2.5
          ctx.beginPath(); ctx.moveTo(lay.bx, lay.by); ctx.lineTo(lay.topX, lay.topY); ctx.stroke()
          ctx.lineWidth = 1
          // busur sudut + label
          ctx.strokeStyle = "rgba(148,163,184,.6)"
          ctx.beginPath(); ctx.arc(lay.bx, lay.by, 32, -r, 0); ctx.stroke()
          ctx.fillStyle = "#cbd5e1"; ctx.font = "bold 10px sans-serif"
          ctx.fillText(`${angle}°`, lay.bx + 36, lay.by - 8)
          // katrol beralur di puncak
          const px = lay.topX, py = lay.topY
          ctx.fillStyle = "#0a1420"
          ctx.beginPath(); ctx.arc(px, py, 15, 0, Math.PI * 2); ctx.fill()
          const pg = ctx.createLinearGradient(px - 15, py - 15, px + 15, py + 15)
          pg.addColorStop(0, "#64748b"); pg.addColorStop(0.5, "#334155"); pg.addColorStop(1, "#1e293b")
          ctx.strokeStyle = pg
          ctx.lineWidth = 7
          ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI * 2); ctx.stroke()
          ctx.lineWidth = 1
          ctx.fillStyle = "#94a3b8"
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2); ctx.fill()
          ctx.fillStyle = "#e2e8f0"
          ctx.beginPath(); ctx.arc(px - 1, py - 1, 1.2, 0, Math.PI * 2); ctx.fill()
          // tali: beban -> puncak -> busur katrol -> turun vertikal
          ctx.strokeStyle = "#e2e8f0"
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(lx, ly - 12)
          ctx.lineTo(px, py)
          ctx.arc(px, py, 11, Math.atan2(ly - 12 - py, lx - px), Math.PI / 2)
          ctx.lineTo(hx, hy - 10)
          ctx.stroke()
          ctx.lineWidth = 1
          // beban gantung + bayangan
          const cw = Math.min(34, 10 + mass * 1.6)
          ctx.fillStyle = "rgba(0,0,0,.35)"
          ctx.fillRect(hx - cw / 2 + 3, hy + 13, cw, 5)
          const cg = ctx.createLinearGradient(0, hy - 10, 0, hy + 12)
          cg.addColorStop(0, "#7dd3fc"); cg.addColorStop(1, "#0369a1")
          ctx.fillStyle = cg
          ctx.fillRect(hx - cw / 2, hy - 10, cw, 22)
          ctx.fillStyle = "#0c4a6e"
          ctx.font = "bold 9px sans-serif"
          ctx.fillText(`${mass}kg`, hx - 13, hy + 4)
          // beban bidang + bayangan + tali pengikat
          ctx.fillStyle = "rgba(0,0,0,.35)"
          ctx.beginPath(); ctx.ellipse(lx, ly + 15, 20, 5, -r, 0, Math.PI * 2); ctx.fill()
          ctx.save()
          ctx.translate(lx, ly); ctx.rotate(-r)
          const lg = ctx.createLinearGradient(0, -14, 0, 14)
          lg.addColorStop(0, "#fbbf24"); lg.addColorStop(1, "#b45309")
          ctx.fillStyle = lg
          ctx.beginPath()
          ctx.roundRect(-17, -14, 34, 28, 4)
          ctx.fill()
          ctx.strokeStyle = "#451a03"
          ctx.stroke()
          ctx.fillStyle = "#451a03"
          ctx.font = "bold 10px sans-serif"
          ctx.fillText(`${mass}kg`, -13, 4)
          ctx.fillStyle = "#78350f"
          ctx.fillRect(-3, -18, 6, 5)
          ctx.restore()
          // panah gaya utama (pill label, clamp dalam kanvas)
          const fl = Math.min(80, 24 + force * 0.55)
          const ax = lx + fl * Math.cos(r), ay = ly - 22 - fl * Math.sin(r)
          ctx.save()
          if (!lowFx) { ctx.shadowColor = "#facc15"; ctx.shadowBlur = 6 }
          ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3
          ctx.beginPath(); ctx.moveTo(lx, ly - 22); ctx.lineTo(ax, ay); ctx.stroke()
          const ha = Math.atan2(ay - (ly - 22), ax - lx)
          ctx.fillStyle = "#facc15"
          ctx.beginPath()
          ctx.moveTo(ax + Math.cos(ha) * 8, ay + Math.sin(ha) * 8)
          ctx.lineTo(ax + Math.cos(ha + 2.6) * 8, ay + Math.sin(ha + 2.6) * 8)
          ctx.lineTo(ax + Math.cos(ha - 2.6) * 8, ay + Math.sin(ha - 2.6) * 8)
          ctx.closePath(); ctx.fill()
          ctx.restore()
          ctx.lineWidth = 1
          const label = `F=${force.toFixed(0)}N`
          ctx.font = "bold 10px sans-serif"
          const tw = ctx.measureText(label).width
          const pillX = Math.min(Math.max(ax + 6, 4), W - tw - 12)
          const pillY = Math.max(ay - 10, 12)
          ctx.fillStyle = "rgba(10,20,32,.9)"
          ctx.strokeStyle = "rgba(250,204,21,.6)"
          ctx.beginPath()
          ctx.roundRect(pillX - 4, pillY - 11, tw + 8, 16, 5)
          ctx.fill(); ctx.stroke()
          ctx.fillStyle = "#fde68a"
          ctx.fillText(label, pillX, pillY + 1)
          // vektor komponen opsional
          if (showVectors) {
            ctx.save()
            ctx.setLineDash([4, 3])
            ctx.strokeStyle = "rgba(96,165,250,.8)"
            ctx.beginPath(); ctx.moveTo(lx, ly + 22); ctx.lineTo(lx, ly + 22 + weight * 0.5); ctx.stroke()
            ctx.fillStyle = "#93c5fd"; ctx.font = "9px sans-serif"
            ctx.fillText("W", lx + 3, ly + 30)
            ctx.strokeStyle = "rgba(74,222,128,.8)"
            ctx.beginPath(); ctx.moveTo(lx, ly + 22); ctx.lineTo(lx - 26 * Math.cos(r), ly + 22 + 26 * Math.sin(r)); ctx.stroke()
            ctx.fillStyle = "#86efac"
            ctx.fillText("N", lx - 34 * Math.cos(r), ly + 26 + 34 * Math.sin(r))
            ctx.restore()
          }
          // percikan hanya saat bergerak
          if (!lowFx && playing) {
            if (Math.random() < 0.25) spawn(poolRef.current, lx, ly - 24, 1, "#facc15", 0.6, true)
            step(poolRef.current, 0.03)
            draw(ctx, poolRef.current)
          }
        }
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [angle, mass, mu, rad, force, weight, playing, showVectors, lowFx, speed])

  const onCanvas = (clientX: number, w: number) => {
    const x = (clientX / w) * W
    // proyeksikan ke lereng -> s
    const t = (x - (bx + 14)) / Math.max(1, (L - 44) * Math.cos(rad))
    sRef.current = Math.min(0.95, Math.max(0.05, t))
  }

  return (
    <LabShell
      icon={<Cog className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Beban di bidang miring butuh gaya F = m·g·(sin θ + μ·cos θ). Satu tali menghubungkan beban bidang dan beban gantung. Keduanya bergerak berlawanan arah. Seret beban langsung di kanvas."
      slug="katrol"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <canvas
          ref={ref} width={W} height={H} className="block w-full cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            dragRef.current = true
            ;(e.target as HTMLCanvasElement).setPointerCapture(e.pointerId)
            const r = e.currentTarget.getBoundingClientRect()
            onCanvas(e.clientX - r.left, r.width)
          }}
          onPointerMove={(e) => {
            if (!dragRef.current) return
            const r = e.currentTarget.getBoundingClientRect()
            onCanvas(e.clientX - r.left, r.width)
          }}
          onPointerUp={() => { dragRef.current = false }}
        />
      }
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Sudut {angle}°</span>
            <input type="range" min={5} max={60} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-yellow-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Massa {mass} kg</span>
            <input type="range" min={1} max={20} value={mass} onChange={(e) => setMass(Number(e.target.value))} className="w-full accent-yellow-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Gesek μ={mu.toFixed(2)}</span>
            <input type="range" min={0} max={0.5} step={0.05} value={mu} onChange={(e) => setMu(Number(e.target.value))} className="w-full accent-yellow-400" />
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={() => { setPlaying(!playing); sfx.click() }}
              className="flex items-center gap-1.5 rounded-lg bg-yellow-400/15 px-3 py-1.5 font-semibold text-yellow-200">
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Jeda" : "Putar"}
            </button>
            <label className="flex items-center gap-1.5">
              <span className="font-mono">{speed.toFixed(2).replace(/0$/, "")}x</span>
              <input type="range" min={0.25} max={2} step={0.25} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-20 accent-yellow-400" />
            </label>
            <button onClick={() => setShowVectors(!showVectors)}
              className={`ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1.5 ${showVectors ? "bg-sky-400/20 text-sky-200" : "text-[var(--text-muted)]"}`}>
              <Move className="h-3.5 w-3.5" /> {showVectors ? "Vektor on" : "Vektor off"}
            </button>
            <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
              <Move className="h-3 w-3" /> seret beban
            </span>
          </div>
        </div>
      }
      stats={<>F = {mass}·9,8·(sin{angle}° + {mu.toFixed(2)}·cos{angle}°) = {force.toFixed(1)} N | W = {weight.toFixed(0)} N</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { sfx.click(); grantXp(5); markLabDone("katrol") }}
      shareTitle="Lab Katrol"
      sharePayload={{ type: "lab", slug: "katrol" }}
    />
  )
}
