"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TrendingUp, Triangle, MousePointer2, Magnet, Download } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { useLowFx } from "@/lib/use-fps"

// Grafik fungsi maksimal: crosshair hover, jejak morph, tabel, pythagoras luas
export function FunctionGraphSim() {
  const [a, setA] = useState(1)
  const [b, setB] = useState(0)
  const [c, setC] = useState(0)
  const [pyth, setPyth] = useState(false)
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null)
  const [snap, setSnap] = useState(false)
  const [trail, setTrail] = useState<{ a: number; b: number; c: number }[]>([])
  const ref = useRef<HTMLCanvasElement>(null)
  const lowFx = useLowFx()

  const D = b * b - 4 * a * c
  const xv = a !== 0 ? -b / (2 * a) : 0
  const yv = a * xv * xv + b * xv + c
  const roots: number[] = useMemo(
    () => (D >= 0 && a !== 0 ? [(-b - Math.sqrt(D)) / (2 * a), (-b + Math.sqrt(D)) / (2 * a)] : []),
    [D, a, b]
  )

  const snapVal = (v: number) => (snap ? Math.round(v * 2) / 2 : v)

  const exportPNG = () => {
    const canvas = ref.current
    if (!canvas) return
    const aEl = document.createElement("a")
    aEl.download = "grafik-fungsi.png"
    aEl.href = canvas.toDataURL("image/png")
    aEl.click()
    sfx.click()
  }

  /* eslint-disable react-hooks/set-state-in-effect -- rekam jejak morph tiap slider berubah */
  useEffect(() => {
    setTrail((t) => [...t.slice(-2), { a, b, c }])
  }, [a, b, c])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#0a1628"); bg.addColorStop(1, "#0a1420")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = "rgba(45,212,191,.09)"
    for (let gx = 0; gx < W; gx += 20) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke() }
    for (let gy = 0; gy < H; gy += 20) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke() }
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1.2
    ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
    ctx.lineWidth = 1
    ctx.fillStyle = "#64748b"; ctx.font = "10px sans-serif"
    for (let n = -10; n <= 10; n += 5) {
      if (n === 0) continue
      ctx.fillText(`${n}`, W / 2 + n * 17 - 4, H / 2 + 12)
      ctx.fillText(`${-n}`, W / 2 + 4, H / 2 + n * 17)
    }
    ctx.fillText("x", W - 12, H / 2 - 4)
    ctx.fillText("y", W / 2 + 4, 12)
    if (pyth) {
      const ox = 40, oy = H - 26
      const cells: { x: number; y: number; w: number; h: number; color: string; label: string; lx: number; ly: number }[] = [
        { x: ox, y: oy - 80, w: 80, h: 80, color: "rgba(59,130,246,.28)", label: "a²=64", lx: ox + 14, ly: oy - 86 },
        { x: ox + 80, y: oy - 60, w: 60, h: 60, color: "rgba(45,212,191,.28)", label: "b²=36", lx: ox + 88, ly: oy - 66 },
      ]
      cells.forEach(({ x, y, w, h, color, label, lx, ly }) => {
        ctx.fillStyle = color
        ctx.fillRect(x, y, w, h)
        ctx.strokeStyle = "#e2e8f0"
        ctx.strokeRect(x, y, w, h)
        ctx.fillStyle = "#e2e8f0"
        ctx.font = "bold 10px sans-serif"
        ctx.fillText(label, lx, ly)
      })
      // hipotenusa miring + persegi di atasnya
      ctx.save()
      ctx.translate(ox, oy - 80)
      ctx.rotate(Math.atan2(60, -80))
      ctx.fillStyle = "rgba(251,191,36,.22)"
      ctx.fillRect(0, -100, 100, 100)
      ctx.strokeStyle = "#fcd34d"
      ctx.strokeRect(0, -100, 100, 100)
      ctx.fillStyle = "#fcd34d"
      ctx.font = "bold 10px sans-serif"
      ctx.fillText("c²=100", 30, -48)
      ctx.restore()
      ctx.strokeStyle = "#f8fafc"; ctx.lineWidth = 2.5
      ctx.beginPath(); ctx.moveTo(ox, oy - 80); ctx.lineTo(ox + 140, oy); ctx.lineTo(ox, oy); ctx.closePath(); ctx.stroke()
      ctx.lineWidth = 1
      // sudut siku
      ctx.strokeStyle = "#f8fafc"
      ctx.strokeRect(ox, oy - 10, 8, 8)
      return
    }
    const X = (x: number) => W / 2 + x * 17
    const Y = (y: number) => H / 2 - y * 17
    const curve = (aa: number, bb: number, cc: number) => {
      ctx.beginPath()
      for (let px = 0; px <= W; px += 2) {
        const x = (px - W / 2) / 17
        const y = aa * x * x + bb * x + cc
        const py = Math.max(-H, Math.min(H * 2, Y(y)))
        if (px === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
    }
    // jejak morph (bayangan posisi sebelumnya)
    if (!lowFx) {
      trail.forEach((tr, i) => {
        ctx.save()
        ctx.globalAlpha = 0.12 + i * 0.08
        ctx.strokeStyle = "#64748b"
        ctx.lineWidth = 1.5
        curve(tr.a, tr.b, tr.c)
        ctx.stroke()
        ctx.restore()
      })
    }
    // fill area
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, "rgba(45,212,191,.35)"); grad.addColorStop(1, "rgba(45,212,191,.02)")
    ctx.save()
    if (!lowFx) { ctx.shadowColor = "#2dd4bf"; ctx.shadowBlur = 10 }
    curve(a, b, c)
    ctx.strokeStyle = "#2dd4bf"; ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.restore()
    ctx.lineWidth = 1
    ctx.lineTo(W, H / 2); ctx.lineTo(0, H / 2); ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()
    // puncak glow
    const pg = ctx.createRadialGradient(X(xv), Y(yv), 1, X(xv), Y(yv), 14)
    pg.addColorStop(0, "rgba(251,191,36,.9)"); pg.addColorStop(1, "rgba(251,191,36,0)")
    ctx.fillStyle = pg
    ctx.beginPath(); ctx.arc(X(xv), Y(yv), 14, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "#fbbf24"
    ctx.beginPath(); ctx.arc(X(xv), Y(yv), 5.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "#fde68a"; ctx.font = "bold 10px sans-serif"
    ctx.fillText(`P(${xv.toFixed(1)}, ${yv.toFixed(1)})`, X(xv) + 9, Y(yv) - 7)
    // akar
    ctx.fillStyle = "#f472b6"
    roots.forEach((r) => {
      ctx.beginPath(); ctx.arc(X(r), Y(0), 5, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#f9a8d4"
      ctx.font = "10px sans-serif"
      ctx.fillText(r.toFixed(2), X(r) - 10, Y(0) + 16)
      ctx.fillStyle = "#f472b6"
    })
    // crosshair hover
    if (hover && !pyth) {
      const hx = (hover.x / canvas.clientWidth) * W
      const x = (hx - W / 2) / 17
      const y = a * x * x + b * x + c
      const px = X(x), py = Y(y)
      ctx.save()
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = "rgba(226,232,240,.5)"
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
      ctx.restore()
      ctx.fillStyle = "#fff"
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = "#0a1420"
      const label = `(${x.toFixed(2)}, ${y.toFixed(2)})`
      const tw = ctx.measureText(label).width
      const lx = Math.min(Math.max(px + 8, 4), W - tw - 8)
      ctx.fillStyle = "rgba(226,232,240,.95)"
      ctx.fillRect(lx - 3, py - 24, tw + 6, 15)
      ctx.fillStyle = "#0a1420"
      ctx.font = "10px sans-serif"
      ctx.fillText(label, lx, py - 13)
    }
  }, [a, b, c, xv, yv, pyth, D, roots, hover, trail, lowFx])

  const tableX = [-2, -1, 0, 1, 2]

  return (
    <LabShell
      icon={pyth ? <Triangle className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
      title={pyth ? "Teorema Pythagoras" : "Grafik Fungsi Kuadrat"}
      subject="Matematika"
      theory={pyth
        ? "Luas persegi pada hipotenusa (100) sama dengan jumlah luas persegi kedua sisi tegak (64 + 36). Seret? Tidak perlu, amati saja buktinya."
        : "Arahkan kursor ke kurva untuk membaca koordinat live. Geser slider dan perhatikan jejak morph parabola sebelumnya."}
      scene={
        <canvas
          ref={ref} width={360} height={230} className="block w-full cursor-crosshair"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect()
            setHover({ x: e.clientX - r.left, y: e.clientY - r.top })
          }}
          onMouseLeave={() => setHover(null)}
        />
      }
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <div className="flex gap-2">
            <button onClick={() => setPyth(false)} className={`rounded-lg px-3 py-1 ${!pyth ? "bg-teal-400/20 text-teal-200" : "text-[var(--text-muted)]"}`}>Parabola</button>
            <button onClick={() => setPyth(true)} className={`rounded-lg px-3 py-1 ${pyth ? "bg-teal-400/20 text-teal-200" : "text-[var(--text-muted)]"}`}>Pythagoras 3-4-5</button>
            {!pyth && (
              <>
                <button onClick={() => setSnap(!snap)} title="Kunci ke kelipatan 0.5"
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${snap ? "bg-violet-400/20 text-violet-200" : "text-[var(--text-muted)]"}`}>
                  <Magnet className="h-3.5 w-3.5" /> Snap
                </button>
                <button onClick={exportPNG} title="Unduh grafik PNG"
                  className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--text-muted)] hover:text-teal-200">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            {!pyth && (
              <span className="ml-auto flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                <MousePointer2 className="h-3 w-3" /> arahkan ke kurva
              </span>
            )}
          </div>
          {!pyth && (
            <>
              {([["a", a, setA, -2, 2, 0.1], ["b", b, setB, -5, 5, 0.5], ["c", c, setC, -5, 5, 0.5]] as const).map(([k, v, set, mn, mx, st]) => (
                <label key={k} className="flex items-center gap-2">
                  <span className="w-20 shrink-0 font-mono">{k} = {v.toFixed(1)}</span>
                  <input type="range" min={mn} max={mx} step={st} value={v} onChange={(e) => set(snapVal(Number(e.target.value)))} className="w-full accent-teal-400" />
                </label>
              ))}
              <div className="flex gap-1.5 font-mono">
                {tableX.map((x) => (
                  <span key={x} className="flex-1 rounded-md bg-black/30 px-1 py-1 text-center">
                    {x}:{Number((a * x * x + b * x + c).toFixed(1))}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      }
      stats={<>{pyth ? "3² + 4² = 5² menjadi 9 + 16 = 25" : `D = ${D.toFixed(1)} (${D > 0 ? "2 akar" : D === 0 ? "1 akar kembar" : "akar imajiner"}) | puncak (${xv.toFixed(2)}, ${yv.toFixed(2)})${roots.length ? ` | x = ${roots.map((r) => r.toFixed(2)).join(", ")}` : ""}`}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { sfx.click(); grantXp(5); markLabDone("grafik") }}
      shareTitle="Lab Grafik Fungsi"
      sharePayload={{ type: "lab", slug: "grafik" }}
    />
  )
}
