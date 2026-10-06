"use client"

import { useEffect, useRef, useState } from "react"
import { Magnet } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"
import { useLowFx } from "@/lib/use-fps"
import { createPool, spawn, step, draw, type Particle } from "@/lib/fx"

const meta = getLab("magnet")!

// Magnet lab: seret magnet, kutub tolak/tarik, serbuk besi + kompas bereaksi
export function MagnetSim() {
  const [mx, setMx] = useState(90)
  const [flip, setFlip] = useState(false)
  const [quizOk, setQuizOk] = useState(false)
  const ref = useRef<HTMLCanvasElement>(null)
  const lowFx = useLowFx()
  const poolRef = useRef<Particle[]>(createPool())
  const dragRef = useRef(false)

  // magnet tetap di kanan (kutub S menghadap kiri), magnet geser (kutub kanan = N/S sesuai flip)
  const fixedX = 280
  const facingNorth = !flip // kutub kanan magnet geser = Utara → tarik S tetap
  const attract = facingNorth

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const W = c.width, H = c.height
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#101a30"); bg.addColorStop(1, "#0c0f1e")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    // grid
    ctx.strokeStyle = "rgba(96,165,250,.08)"
    for (let gx = 0; gx < W; gx += 24) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
    const drawMagnet = (x: number, flipped: boolean, label: string) => {
      // kiri merah N / kanan biru S, atau dibalik
      const left = flipped ? "#3b82f6" : "#ef4444"
      const right = flipped ? "#ef4444" : "#3b82f6"
      ctx.fillStyle = left
      ctx.fillRect(x - 44, 66, 44, 30)
      ctx.fillStyle = right
      ctx.fillRect(x, 66, 44, 30)
      ctx.strokeStyle = "#e2e8f0"
      ctx.strokeRect(x - 44, 66, 88, 30)
      ctx.fillStyle = "#fff"
      ctx.font = "bold 12px sans-serif"
      ctx.fillText(flipped ? "S" : "N", x - 26, 86)
      ctx.fillText(flipped ? "N" : "S", x + 18, 86)
      ctx.fillStyle = "#94a3b8"
      ctx.font = "10px sans-serif"
      ctx.fillText(label, x - 22, 112)
    }
    // garis gaya di sekitar magnet geser
    const cx = mx
    ctx.save()
    ctx.strokeStyle = attract ? "rgba(96,165,250,.5)" : "rgba(239,68,68,.5)"
    for (let i = 0; i < 5; i++) {
      const y = 40 + i * 18
      ctx.beginPath()
      if (attract) {
        ctx.moveTo(cx - 44, y + 20); ctx.quadraticCurveTo(cx - 80, 90, cx - 44, 120)
      } else {
        ctx.moveTo(cx - 44, y + 20); ctx.quadraticCurveTo(cx - 90, 90, cx - 110, 60 + i * 14)
      }
      ctx.stroke()
    }
    ctx.restore()
    // peta panas medan: makin dekat magnet makin terang
    const heat = (x: number, y: number) => {
      const d1 = Math.hypot(x - cx, y - 81)
      const d2 = Math.hypot(x - fixedX, y - 81)
      const d = Math.min(d1, d2)
      return Math.max(0, 1 - d / 170)
    }
    for (let gy = 0; gy < 5; gy++) {
      for (let gx = 0; gx < 12; gx++) {
        const x = 14 + gx * 29, y = 122 + gy * 15
        const h = heat(x, y)
        if (h <= 0.04) continue
        ctx.fillStyle = attract ? `rgba(96,165,250,${(h * 0.2).toFixed(2)})` : `rgba(239,68,68,${(h * 0.2).toFixed(2)})`
        ctx.fillRect(x - 13, y - 6, 27, 13)
      }
    }
    // serbuk besi: menunjuk ke magnet terdekat
    ctx.fillStyle = "#94a3b8"
    for (let i = 0; i < 26; i++) {
      const px = 20 + ((i * 53) % 200)
      const py = 130 + ((i * 37) % 60)
      const dx = cx - px
      const ang = Math.atan2(90 - py, dx)
      const near = Math.abs(dx) < 120
      ctx.save()
      ctx.translate(px, py)
      ctx.rotate(near ? ang : 0)
      ctx.fillStyle = near ? "#e2e8f0" : "rgba(148,163,184,.5)"
      ctx.fillRect(-7, -1.2, 14, 2.4)
      ctx.restore()
    }
    // kompas
    const compX = 180, compY = 168
    ctx.fillStyle = "#0f172a"
    ctx.beginPath(); ctx.arc(compX, compY, 20, 0, Math.PI * 2); ctx.fill()
    ctx.strokeStyle = "#e2e8f0"; ctx.stroke()
    const toM = Math.atan2(81 - compY, cx - compX)
    ctx.save()
    ctx.translate(compX, compY)
    ctx.rotate(attract ? toM : toM + Math.PI)
    ctx.fillStyle = "#ef4444"
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, -3.5); ctx.lineTo(12, 3.5); ctx.closePath(); ctx.fill()
    ctx.fillStyle = "#e2e8f0"
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-12, -3.5); ctx.lineTo(-12, 3.5); ctx.closePath(); ctx.fill()
    ctx.restore()
    ctx.fillStyle = "#94a3b8"; ctx.font = "9px sans-serif"
    ctx.fillText("kompas", compX - 16, compY + 32)
    drawMagnet(fixedX, false, "tetap (S kiri)")
    drawMagnet(cx, flip, "geser, seret!")
    // efek tolak: percikan di antara
    if (!lowFx && !attract && Math.abs(cx + 44 - (fixedX - 44)) < 90) {
      spawn(poolRef.current, (cx + 44 + fixedX - 44) / 2, 81, 2, "#ef4444", 1, lowFx)
    }
    if (!lowFx) {
      step(poolRef.current, 0.02)
      draw(ctx, poolRef.current)
    }
    const dist = Math.abs(cx + 44 - (fixedX - 44))
    ctx.fillStyle = attract ? "#93c5fd" : "#fca5a5"
    ctx.font = "bold 11px sans-serif"
    ctx.fillText(attract ? `TARIK-MENARIK (jarak ${dist.toFixed(0)}px)` : `TOLAK-MENOLAK (jarak ${dist.toFixed(0)}px)`, 14, 18)
    // penggaris gauss bawah
    ctx.fillStyle = "rgba(148,163,184,.7)"
    ctx.font = "8px sans-serif"
    for (let gx = 20; gx <= 340; gx += 40) {
      ctx.fillRect(gx, H - 8, 1, 5)
      ctx.fillText(`${gx}`, gx - 6, H - 11)
    }
  }, [mx, flip, attract, fixedX, lowFx])

  return (
    <LabShell
      icon={<Magnet className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Kutub senama tolak-menolak, beda tarik-menarik. Makin dekat makin kuat. Kompas selalu menunjuk ke kutub magnet."
      slug="magnet"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <canvas
          ref={ref} width={360} height={205} className="block w-full cursor-ew-resize"
          onPointerDown={() => { dragRef.current = true }}
          onPointerUp={() => { dragRef.current = false }}
          onPointerLeave={() => { dragRef.current = false }}
          onPointerMove={(e) => {
            if (!dragRef.current) return
            const r = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - r.left) / r.width) * 360
            setMx(Math.min(200, Math.max(50, x)))
          }}
          onClick={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - r.left) / r.width) * 360
            setMx(Math.min(200, Math.max(50, x)))
          }}
        />
      }
      controls={
        <div className="grid gap-2 text-xs text-[var(--text-secondary)]">
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Posisi {mx.toFixed(0)}</span>
            <input type="range" min={50} max={200} value={mx} onChange={(e) => setMx(Number(e.target.value))} className="w-full accent-blue-400" />
          </label>
          <div className="flex gap-2">
            <button onClick={() => { setFlip(!flip); sfx.click() }}
              className="flex-1 rounded-xl border border-[var(--border)] py-2 hover:border-blue-400/50">
              Balik kutub (sekarang {attract ? "tarik" : "tolak"})
            </button>
          </div>
          {!quizOk ? (
            <button
              onClick={() => {
                // misi: buat kondisi tolak-menolak dengan jarak < 60
                const dist = Math.abs(mx + 44 - (fixedX - 44))
                if (!attract && dist < 60) { setQuizOk(true); sfx.correct(); grantXp(10); markLabDone("magnet") }
                else sfx.wrong()
              }}
              className="rounded-xl bg-blue-400/20 py-2 font-semibold text-blue-100">
              Misi: tolak-menolak jarak dekat (+10 XP)
            </button>
          ) : (
            <p className="rounded-xl bg-teal-400/10 p-2 text-center text-teal-300">Misi selesai! +10 XP.</p>
          )}
        </div>
      }
      stats={<>{attract ? "Mode tarik-menarik (U-S)" : "Mode tolak-menolak (S-S)"} | seret magnet kiri-kanan</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("magnet") }}
      shareTitle="Lab Magnet"
      sharePayload={{ type: "lab", slug: "magnet" }}
    />
  )
}
