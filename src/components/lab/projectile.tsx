"use client"

import { useEffect, useRef, useState } from "react"
import { Crosshair, Turtle, GitCompareArrows } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { useLowFx } from "@/lib/use-fps"
import { createPool, spawn, step, draw, popup, stepPopups, drawPopups, type Particle, type Popup } from "@/lib/fx"

const GRAVS = [
  { v: 1.6, label: "Bulan" },
  { v: 9.8, label: "Bumi" },
  { v: 24.8, label: "Jupiter" },
]

interface Shot { range: number; angle: number }

// Meriam proyektil maksimal: ledakan partikel, shake, target skor, slow-mo, banding 3 sudut
export function ProjectileSim() {
  const [angle, setAngle] = useState(45)
  const [vel, setVel] = useState(15)
  const [grav, setGrav] = useState(9.8)
  const [t, setT] = useState(0)
  const [flying, setFlying] = useState(false)
  const [shots, setShots] = useState<Shot[]>([])
  const [score, setScore] = useState(0)
  const [craters, setCraters] = useState<number[]>([])
  const smokeRef = useRef(0)
  const [slow, setSlow] = useState(false)
  const [compare, setCompare] = useState(false)
  const [shake, setShake] = useState(0)
  const ref = useRef<HTMLCanvasElement>(null)
  const lowFx = useLowFx()
  const poolRef = useRef<Particle[]>(createPool())
  const popRef = useRef<Popup[]>([])
  const cloudRef = useRef(0)

  const rad = (angle * Math.PI) / 180
  const vx = vel * Math.cos(rad)
  const vy = vel * Math.sin(rad)
  const tMax = (2 * vy) / grav
  const range = vx * tMax
  const hMax = (vy * vy) / (2 * grav)

  /* eslint-disable react-hooks/set-state-in-effect -- akhir animasi sekali */
  useEffect(() => {
    if (!flying) return
    if (t >= tMax) {
      setFlying(false)
      sfx.correct()
      grantXp(5)
      markLabDone("proyektil")
      const gained = Math.round(range)
      setScore((s) => s + gained)
      setShots((s) => [...s.slice(-4), { range, angle }])
      const c = ref.current
      if (c && !lowFx) {
        const W = c.width, H = c.height
        spawn(poolRef.current, W - 40, H - 26, 46, "#fbbf24", 3, lowFx)
        spawn(poolRef.current, W - 40, H - 26, 24, "#2dd4bf", 2, lowFx)
        spawn(poolRef.current, W - 40, H - 30, 16, "rgba(148,163,184,.7)", 1.1, lowFx)
        smokeRef.current = 90 // asap mengepul 90 frame
        setCraters((cr) => [...cr.slice(-4), W - 40])
        popup(popRef.current, W - 60, H - 70, `+${gained}`)
        setShake(1)
        setTimeout(() => setShake(0), 380)
      } else if (c) {
        setCraters((cr) => [...cr.slice(-4), c.width - 40])
      }
      return
    }
    const id = setTimeout(() => setT(t + tMax / (slow ? 180 : 60)), 16)
    return () => clearTimeout(id)
  }, [t, flying, tMax, range, angle, slow, lowFx])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const W = c.width, H = c.height
    cloudRef.current += 0.3
    ctx.save()
    if (shake) ctx.translate((Math.random() - 0.5) * 7 * shake, (Math.random() - 0.5) * 5 * shake)
    // langit
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, "#0a1628"); sky.addColorStop(0.6, "#0e2742"); sky.addColorStop(1, "#0a1420")
    ctx.fillStyle = sky
    ctx.fillRect(-10, -10, W + 20, H + 20)
    // bintang
    ctx.fillStyle = "rgba(148,197,255,.55)"
    for (let i = 0; i < 26; i++) {
      const x = (i * 137) % W, y = (i * 89) % 90
      ctx.globalAlpha = 0.3 + 0.4 * Math.abs(Math.sin(i + cloudRef.current / 40))
      ctx.fillRect(x, y, 1.6, 1.6)
    }
    ctx.globalAlpha = 1
    // bulan
    ctx.fillStyle = "#e2e8f0"
    ctx.beginPath(); ctx.arc(W - 46, 34, 13, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "#0e2742"
    ctx.beginPath(); ctx.arc(W - 40, 30, 11, 0, Math.PI * 2); ctx.fill()
    // awan
    ctx.fillStyle = "rgba(148,163,184,.14)"
    for (let i = 0; i < 3; i++) {
      const cx = ((i * 150 + cloudRef.current * (0.4 + i * 0.2)) % (W + 120)) - 60
      const cy = 44 + i * 26
      ctx.beginPath()
      ctx.arc(cx, cy, 16, 0, Math.PI * 2)
      ctx.arc(cx + 18, cy + 3, 12, 0, Math.PI * 2)
      ctx.arc(cx - 18, cy + 4, 11, 0, Math.PI * 2)
      ctx.fill()
    }
    // grid
    ctx.strokeStyle = "rgba(45,212,191,.08)"
    for (let gx = 0; gx < W; gx += 34) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
    // tanah neon + kawah bekas ledakan
    ctx.fillStyle = "#0d1b2a"
    ctx.fillRect(-10, H - 22, W + 20, 30)
    ctx.fillStyle = "rgba(0,0,0,.5)"
    craters.forEach((cx) => {
      ctx.beginPath(); ctx.ellipse(cx, H - 20, 12, 4, 0, 0, Math.PI * 2); ctx.fill()
    })
    ctx.fillStyle = "rgba(45,212,191,.65)"
    ctx.fillRect(-10, H - 22, W + 20, 2)
    // penanda jarak tiap 10 m
    ctx.fillStyle = "rgba(148,163,184,.6)"
    ctx.font = "9px sans-serif"
    const maxR = Math.max(range, vel * vel / grav, 1)
    for (let m = 10; m < maxR; m += 10) {
      const x = (m / maxR) * (W - 70) + 44
      if (x > W - 8) break
      ctx.fillRect(x, H - 26, 1, 5)
      ctx.fillText(`${m}`, x - 6, H - 4)
    }
    const X = (vxx: number, vyy: number, tt: number, rMax: number) =>
      (vxx * tt / Math.max(rMax, 1)) * (W - 70) + 44
    const Y = (vyy: number, tt: number, tM: number, hM: number) =>
      H - 22 - ((vyy * tt - 0.5 * grav * tt * tt) / Math.max(hM, 1)) * (H - 70)
    const traj = (aa: number, color: string, width: number, alpha: number, rMax: number) => {
      const rr = (aa * Math.PI) / 180
      const xx = vel * Math.cos(rr), yy = vel * Math.sin(rr)
      const tm = (2 * yy) / grav
      const hm = (yy * yy) / (2 * grav)
      ctx.save()
      if (!lowFx) { ctx.shadowColor = color; ctx.shadowBlur = 8 }
      ctx.strokeStyle = color
      ctx.globalAlpha = alpha
      ctx.lineWidth = width
      ctx.beginPath()
      for (let i = 0; i <= 60; i++) {
        const tt = (i / 60) * tm
        const x = X(xx, yy, tt, rMax), y = Y(yy, tt, tm, hm)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()
      ctx.globalAlpha = 1
      ctx.lineWidth = 1
    }
    // mode banding: 30/45/60 sekaligus
    if (compare) {
      const rMax = Math.max(...[30, 45, 60].map((aa) => {
        const rr = (aa * Math.PI) / 180
        return (vel * Math.cos(rr) * 2 * vel * Math.sin(rr)) / grav
      }), range)
      traj(30, "rgba(96,165,250,.55)", 1.5, 0.8, rMax)
      traj(60, "rgba(244,114,182,.55)", 1.5, 0.8, rMax)
      traj(45, "rgba(251,191,36,.8)", 1.5, 0.9, rMax)
    }
    traj(angle, "rgba(45,212,191,.8)", 2.5, 1, range)
    // target
    const tx = X(vx, vy, tMax, range)
    ctx.save()
    if (!lowFx) { ctx.shadowColor = "#f472b6"; ctx.shadowBlur = 10 }
    ctx.strokeStyle = "#f472b6"
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(tx, H - 22, 11, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(tx, H - 22, 4.5, 0, Math.PI * 2); ctx.stroke()
    ctx.restore()
    ctx.lineWidth = 1
    // meriam
    const mx = 30, my = H - 22
    ctx.save()
    ctx.translate(mx, my); ctx.rotate(-rad)
    const barrel = ctx.createLinearGradient(0, -7, 30, 7)
    barrel.addColorStop(0, "#1e3a5f"); barrel.addColorStop(1, "#3b82f6")
    ctx.fillStyle = barrel
    ctx.fillRect(0, -7, 30, 14)
    ctx.fillStyle = "#2dd4bf"
    ctx.fillRect(25, -7, 4, 14)
    ctx.restore()
    ctx.fillStyle = "#16283f"
    ctx.beginPath(); ctx.arc(mx, my, 12, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = "#2dd4bf"; ctx.lineWidth = 2; ctx.stroke()
    ctx.fillStyle = "#0a1420"
    ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill()
    ctx.lineWidth = 1
    if (flying) {
      const tt = Math.min(t, tMax)
      const bx = X(vx, vy, tt, range), by = Y(vy, tt, tMax, hMax)
      if (!lowFx) spawn(poolRef.current, bx, by, 2, "#f59e0b", 0.9, lowFx)
      const g = ctx.createRadialGradient(bx, by, 1, bx, by, 13)
      g.addColorStop(0, "#fefce8"); g.addColorStop(0.35, "#fbbf24"); g.addColorStop(1, "rgba(251,146,60,0)")
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(bx, by, 13, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#fff7ed"
      ctx.beginPath(); ctx.arc(bx, by, 4.5, 0, Math.PI * 2); ctx.fill()
    }
    if (!lowFx) {
      if (smokeRef.current > 0) {
        smokeRef.current--
        if (Math.random() < 0.5) spawn(poolRef.current, tx + (Math.random() - 0.5) * 14, H - 30, 1, "rgba(148,163,184,.55)", 0.5, true)
      }
      step(poolRef.current)
      draw(ctx, poolRef.current)
      stepPopups(popRef.current)
      drawPopups(ctx, popRef.current)
    }
    ctx.restore()
  }, [t, vx, vy, grav, tMax, range, hMax, rad, flying, shake, compare, vel, angle, lowFx, score, shots.length, craters])

  return (
    <LabShell
      icon={<Crosshair className="h-5 w-5" />}
      title="Meriam Proyektil"
      subject="Fisika"
      theory="Gerak parabola: vx tetap, vy melambat oleh gravitasi. Jarak terjauh ideal 45 derajat di ruang hampa. Kena target = skor sebesar jarak (m)."
      scene={
        <div className={shake ? "fx-shake" : ""}>
          <canvas ref={ref} width={360} height={230} className="block w-full" />
        </div>
      }
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Sudut {angle}°</span>
            <input type="range" min={10} max={80} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-teal-400" />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Laju {vel} m/s</span>
            <input type="range" min={5} max={30} value={vel} onChange={(e) => setVel(Number(e.target.value))} className="w-full accent-teal-400" />
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
            <button onClick={() => setSlow(!slow)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${slow ? "bg-amber-400/20 text-amber-200" : "text-[var(--text-muted)] hover:text-amber-200"}`}>
              <Turtle className="h-3.5 w-3.5" /> 0.25x
            </button>
            <button onClick={() => setCompare(!compare)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${compare ? "bg-sky-400/20 text-sky-200" : "text-[var(--text-muted)] hover:text-sky-200"}`}>
              <GitCompareArrows className="h-3.5 w-3.5" /> 30/45/60
            </button>
          </div>
          {shots.length > 0 && (
            <div className="flex flex-wrap gap-1.5 font-mono">
              {shots.map((s, i) => (
                <span key={i} className="rounded-md bg-black/30 px-2 py-0.5">{s.angle}°→{s.range.toFixed(0)}m</span>
              ))}
            </div>
          )}
        </div>
      }
      stats={<>Jarak {range.toFixed(1)} m | Tinggi {hMax.toFixed(1)} m | Waktu {tMax.toFixed(2)} s | Skor {score}</>}
      actionLabel={flying ? "Meluncur..." : "Tembak (+5 XP)"}
      onAction={() => { if (!flying) { setT(0); setFlying(true); sfx.click() } }}
      shareTitle="Lab Meriam Proyektil"
      sharePayload={{ type: "lab", slug: "proyektil" }}
    />
  )
}
