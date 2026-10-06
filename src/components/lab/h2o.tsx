"use client"

import { useEffect, useRef, useState } from "react"
import { Atom, RotateCw, Pause, Play, Zap } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { useLowFx } from "@/lib/use-fps"

const INFO: Record<string, string> = {
  O: "Oksigen: elektronegativitas tinggi, menarik elektron ikatan sehingga molekul polar.",
  H: "Hidrogen: dua atom terikat kovalen pada O. Sudut 104,5 derajat akibat tolakan pasangan elektron bebas.",
}

// Molekul H2O maksimal: orbital elektron, panah polaritas, pasangan bebas, banding CO2
export function H2oSim() {
  const [angle, setAngle] = useState(104.5)
  const [sel, setSel] = useState("Pilih atom O atau H untuk melihat penjelasannya.")
  const [spin, setSpin] = useState(true)
  const [lonePairs, setLonePairs] = useState(true)
  const [compare, setCompare] = useState(false)
  const mountRef = useRef<HTMLDivElement>(null)
  const rotRef = useRef(0)
  const lowFx = useLowFx()

  useEffect(() => {
    let renderer: { dispose: () => void } | null = null
    let raf = 0
    let cancelled = false
    const mount = mountRef.current
    if (!mount) return
    ;(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const THREE: any = await import("three")
        if (cancelled || !mountRef.current) return
        const scene = new THREE.Scene()
        const cam = new THREE.PerspectiveCamera(45, 3 / 1.5, 0.1, 100)
        cam.position.set(0, 0.2, 4.6)
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        r.setSize(360, 190)
        mount.appendChild(r.domElement)
        renderer = r
        const oMat = new THREE.MeshBasicMaterial({ color: 0xfb7185 })
        const hMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe })
        const bondMat = new THREE.LineBasicMaterial({ color: 0x2dd4bf })
        const lpMat = new THREE.MeshBasicMaterial({ color: 0xc084fc })
        const loop = () => {
          if (spin && !lowFx) rotRef.current += 0.012
          const rad = (angle * Math.PI) / 180
          const h1 = new THREE.Vector3(Math.sin(rad / 2) * 1.25, Math.cos(rad / 2) * 1.25 - 0.2, 0)
          const h2 = new THREE.Vector3(-Math.sin(rad / 2) * 1.25, Math.cos(rad / 2) * 1.25 - 0.2, 0)
          const o = new THREE.Vector3(0, -0.35, 0)
          const g = new THREE.Group()
          const mkBall = (p: unknown, rad2: number, mat: unknown) => {
            const m = new THREE.Mesh(new THREE.SphereGeometry(rad2, 28, 28), mat)
            m.position.copy(p)
            return m
          }
          g.add(mkBall(o, 0.42, oMat), mkBall(h1, 0.26, hMat), mkBall(h2, 0.26, hMat))
          g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o, h1]), bondMat))
          g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([o, h2]), bondMat))
          if (lonePairs) {
            const lp1 = new THREE.Vector3(0.32, -1.05, 0)
            const lp2 = new THREE.Vector3(-0.32, -1.05, 0)
            g.add(mkBall(lp1, 0.11, lpMat), mkBall(lp2, 0.11, lpMat))
          }
          g.rotation.y = rotRef.current
          g.rotation.x = 0.15
          scene.clear()
          scene.add(g)
          r.render(scene, cam)
          raf = requestAnimationFrame(loop)
        }
        loop()
      } catch {
        // SVG interaktif di bawah tetap menjadi visual utama
      }
    })()
    return () => { cancelled = true; cancelAnimationFrame(raf); renderer?.dispose(); if (mount) mount.innerHTML = "" }
  }, [angle, spin, lonePairs, lowFx])

  const rad = (angle * Math.PI) / 180
  const hx = Math.sin(rad / 2) * 100
  const hy = Math.cos(rad / 2) * 100

  return (
    <LabShell
      icon={<Atom className="h-5 w-5" />}
      title="Molekul H2O"
      subject="Kimia"
      theory="Air polar: oksigen menarik elektron ikatan, dua pasangan elektron bebas menekan sudut H-O-H menjadi 104,5 derajat. Panah menunjukkan tarikan elektron ke O."
      scene={
        <div className="relative">
          <div ref={mountRef} className="[&_canvas]:mx-auto" />
          <svg viewBox="0 0 360 200" className="mx-auto block w-full" style={{ maxWidth: 360 }}>
            <defs>
              <radialGradient id="h2obg" cx="50%" cy="30%" r="90%">
                <stop offset="0%" stopColor="#12303a" />
                <stop offset="100%" stopColor="#0a1420" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="360" height="200" fill="url(#h2obg)" />
            {compare && (
              <g opacity="0.35">
                <circle cx="60" cy="150" r="16" fill="#64748b" />
                <circle cx="30" cy="150" r="10" fill="#94a3b8" />
                <circle cx="90" cy="150" r="10" fill="#94a3b8" />
                <line x1="44" y1="150" x2="76" y2="150" stroke="#64748b" strokeWidth="2" />
                <text x="60" y="182" textAnchor="middle" fontSize="10" fill="#94a3b8">CO2 180°</text>
              </g>
            )}
            {/* orbital elektron O (animasi SMIL, tanpa JS per frame) */}
            <ellipse cx="180" cy="128" rx="44" ry="44" fill="none" stroke="rgba(251,113,133,.35)" strokeWidth="1.5" strokeDasharray="5 5" />
            <g>
              <animateTransform attributeName="transform" type="rotate" from="0 180 128" to="360 180 128" dur="6s" repeatCount="indefinite" />
              {[0, 1, 2, 3, 4, 5].map((i) => {
                const a = (i * Math.PI) / 3
                return <circle key={i} cx={180 + Math.cos(a) * 44} cy={128 + Math.sin(a) * 44} r="3" fill="#fda4af" />
              })}
            </g>
            {/* pasangan elektron bebas */}
            {lonePairs && (
              <g>
                <ellipse cx="166" cy="162" rx="10" ry="7" fill="#c084fc" opacity="0.9" />
                <ellipse cx="194" cy="162" rx="10" ry="7" fill="#c084fc" opacity="0.9" />
                <text x="180" y="182" textAnchor="middle" fontSize="9" fill="#d8b4fe">pasangan bebas</text>
              </g>
            )}
            <line x1="180" y1="128" x2={180 + hx} y2={128 - hy} stroke="#2dd4bf" strokeWidth="3" />
            <line x1="180" y1="128" x2={180 - hx} y2={128 - hy} stroke="#2dd4bf" strokeWidth="3" />
            {/* panah polaritas */}
            <line x1={180 + hx * 0.55} y1={128 - hy * 0.55} x2="180" y2="128" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arr)" />
            <line x1={180 - hx * 0.55} y1={128 - hy * 0.55} x2="180" y2="128" stroke="#fbbf24" strokeWidth="2" />
            <defs>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
              </marker>
            </defs>
            <circle cx="180" cy="128" r="30" fill="#fb7185" stroke="#fecdd3" strokeWidth="2.5" className="cursor-pointer" onClick={() => setSel(INFO.O)} />
            <text x="180" y="135" textAnchor="middle" fontSize="17" fontWeight="bold" fill="#4c0519">O</text>
            <circle cx={180 + hx} cy={128 - hy} r="18" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" className="cursor-pointer" onClick={() => setSel(INFO.H)} />
            <text x={180 + hx} y={128 - hy + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0c4a6e">H</text>
            <circle cx={180 - hx} cy={128 - hy} r="18" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" className="cursor-pointer" onClick={() => setSel(INFO.H)} />
            <text x={180 - hx} y={128 - hy + 5} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0c4a6e">H</text>
            <text x={180 + hx + 12} y={128 - hy - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7dd3fc">δ+</text>
            <text x={180 - hx - 12} y={128 - hy - 8} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#7dd3fc">δ+</text>
            <text x="180" y="112" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#fda4af">δ−</text>
            <text x="180" y="196" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#fbbf24">{angle.toFixed(1)}°</text>
          </svg>
        </div>
      }
      controls={
        <div className="grid gap-2.5 text-xs text-[var(--text-secondary)]">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSel(INFO.O)} className="flex items-center gap-1.5 rounded-lg bg-rose-400/15 px-3 py-1 text-rose-200">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /> Oksigen
            </button>
            <button onClick={() => setSel(INFO.H)} className="flex items-center gap-1.5 rounded-lg bg-sky-400/15 px-3 py-1 text-sky-200">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-200" /> Hidrogen
            </button>
            <button onClick={() => setSpin(!spin)} title={spin ? "Jeda putar" : "Putar"}
              className="rounded-lg border border-[var(--border)] p-1.5 text-teal-200">
              {spin ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button onClick={() => setLonePairs(!lonePairs)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 ${lonePairs ? "bg-violet-400/20 text-violet-200" : "text-[var(--text-muted)]"}`}>
              <Zap className="h-3.5 w-3.5" /> Bebas
            </button>
            <button onClick={() => setCompare(!compare)}
              className={`rounded-lg px-2.5 py-1 ${compare ? "bg-white/15 text-white" : "text-[var(--text-muted)]"}`}>
              vs CO2
            </button>
          </div>
          <p className="min-h-8 leading-relaxed">{sel}</p>
          <div className="flex items-center gap-2 rounded-lg bg-black/30 px-2.5 py-1.5">
            <span className="font-mono text-[10px] text-sky-200">H 2.2</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gradient-to-r from-sky-400 via-teal-300 to-rose-400" />
            <span className="font-mono text-[10px] text-rose-200">O 3.4</span>
            <span className="text-[10px] text-[var(--text-muted)]">elektronegativitas</span>
          </div>
          <label className="flex items-center gap-2">
            <span className="w-28 shrink-0 font-mono">Sudut {angle.toFixed(1)}°</span>
            <input type="range" min={90} max={120} step={0.5} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-full accent-amber-400" />
            <button onClick={() => setAngle(104.5)} title="Reset 104,5°" className="rounded-lg border border-[var(--border)] p-1.5 text-[var(--text-muted)]">
              <RotateCw className="h-3.5 w-3.5" />
            </button>
          </label>
        </div>
      }
      stats={<>Sudut H-O-H {angle.toFixed(1)}° {Math.abs(angle - 104.5) < 0.3 ? "| ideal" : angle < 104.5 ? "| tertekan" : "| melebar"}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { sfx.click(); grantXp(5); markLabDone("h2o") }}
      shareTitle="Lab Molekul H2O"
      sharePayload={{ type: "lab", slug: "h2o" }}
    />
  )
}
