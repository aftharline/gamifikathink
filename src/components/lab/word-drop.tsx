"use client"

import { useEffect, useRef, useState } from "react"
import { CloudRainWind, Flame, Play } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { celebrate, sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"
import { useLowFx } from "@/lib/use-fps"

const meta = getLab("word-drop")!

const WORDS: { en: string; id: string; cat: "Animal" | "Food" | "Place" }[] = [
  { en: "Cat", id: "kucing", cat: "Animal" },
  { en: "Apple", id: "apel", cat: "Food" },
  { en: "School", id: "sekolah", cat: "Place" },
  { en: "Dog", id: "anjing", cat: "Animal" },
  { en: "Rice", id: "nasi", cat: "Food" },
  { en: "Beach", id: "pantai", cat: "Place" },
  { en: "Bird", id: "burung", cat: "Animal" },
  { en: "Bread", id: "roti", cat: "Food" },
  { en: "Market", id: "pasar", cat: "Place" },
  { en: "Fish", id: "ikan", cat: "Animal" },
  { en: "Milk", id: "susu", cat: "Food" },
  { en: "Garden", id: "kebun", cat: "Place" },
]

interface Drop { w: (typeof WORDS)[number]; x: number; y: number; speed: number }

// Word Drop: tangkap kata jatuh sesuai kategori target
export function WordDropSim() {
  const [playing, setPlaying] = useState(false)
  const [target, setTarget] = useState<"Animal" | "Food" | "Place">("Animal")
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [caught, setCaught] = useState(0)
  const [lives, setLives] = useState(3)
  const [over, setOver] = useState(false)
  const ref = useRef<HTMLCanvasElement>(null)
  const dropsRef = useRef<Drop[]>([])
  const lowFx = useLowFx()
  const stateRef = useRef({ playing, target, score, combo, caught, lives })
  useEffect(() => {
    stateRef.current = { playing, target, score, combo, caught, lives }
  }, [playing, target, score, combo, caught, lives])

  useEffect(() => {
    let raf = 0
    const loop = () => {
      const c = ref.current
      if (c) {
        const ctx = c.getContext("2d")
        if (ctx) {
          const W = c.width, H = c.height
          const st = stateRef.current
          const bg = ctx.createLinearGradient(0, 0, 0, H)
          bg.addColorStop(0, "#1a1430"); bg.addColorStop(1, "#0d0a1a")
          ctx.fillStyle = bg
          ctx.fillRect(0, 0, W, H)
          // awan hujan kata
          ctx.fillStyle = "rgba(167,139,250,.15)"
          for (let i = 0; i < 4; i++) {
            const cx = ((i * 110 + Date.now() / 60) % (W + 80)) - 40
            ctx.beginPath(); ctx.arc(cx, 26, 18, 0, Math.PI * 2); ctx.fill()
          }
          if (st.playing && dropsRef.current.length < 4 && Math.random() < 0.04) {
            const w = WORDS[Math.floor(Math.random() * WORDS.length)]
            dropsRef.current.push({ w, x: 30 + Math.random() * (W - 90), y: -20, speed: 0.9 + Math.random() * 0.9 + st.caught * 0.05 })
          }
          // garis tangkap
          ctx.strokeStyle = "rgba(167,139,250,.6)"
          ctx.setLineDash([6, 5])
          ctx.beginPath(); ctx.moveTo(0, H - 30); ctx.lineTo(W, H - 30); ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = "#a78bfa"; ctx.font = "10px sans-serif"
          ctx.fillText(`Tangkap: ${st.target} (ketuk katanya)`, 10, H - 12)
          const drops = dropsRef.current
          for (let i = drops.length - 1; i >= 0; i--) {
            const d = drops[i]
            if (st.playing) d.y += d.speed
            const ok = d.w.cat === st.target
            ctx.fillStyle = ok ? "rgba(167,139,250,.25)" : "rgba(255,255,255,.07)"
            const tw = ctx.measureText(d.w.en).width + 20
            ctx.beginPath()
            ctx.roundRect(d.x, d.y, tw, 26, 8)
            ctx.fill()
            ctx.strokeStyle = ok ? "#a78bfa" : "rgba(148,163,184,.4)"
            ctx.stroke()
            ctx.fillStyle = ok ? "#ddd6fe" : "#94a3b8"
            ctx.font = "bold 12px sans-serif"
            ctx.fillText(d.w.en, d.x + 10, d.y + 17)
            if (d.y > H - 30) {
              drops.splice(i, 1)
              if (ok) {
                // kata target lolos = nyawa berkurang
                const nl = st.lives - 1
                setLives(nl)
                setCombo(0)
                sfx.wrong()
                if (nl <= 0) {
                  setOver(true); setPlaying(false)
                }
              }
            }
          }
          void lowFx
        }
      }
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [lowFx])

  const tap = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!playing || over) return
    const c = ref.current
    if (!c) return
    const r = c.getBoundingClientRect()
    const mx = ((e.clientX - r.left) / r.width) * c.width
    const my = ((e.clientY - r.top) / r.height) * c.height
    const ctx = c.getContext("2d")
    const drops = dropsRef.current
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]
      const tw = (ctx?.measureText(d.w.en).width ?? 40) + 20
      if (mx >= d.x && mx <= d.x + tw && my >= d.y && my <= d.y + 26) {
        drops.splice(i, 1)
        if (d.w.cat === target) {
          const nc = combo + 1
          setCombo(nc)
          setScore(score + (nc >= 3 ? 2 : 1))
          setCaught(caught + 1)
          sfx.correct()
          if (caught + 1 >= 10) {
            setOver(true); setPlaying(false)
            grantXp(10); markLabDone("word-drop"); celebrate()
          }
        } else {
          setCombo(0)
          sfx.wrong()
        }
        return
      }
    }
  }

  const start = (cat: "Animal" | "Food" | "Place") => {
    setTarget(cat); setScore(0); setCombo(0); setCaught(0); setLives(3); setOver(false)
    dropsRef.current = []
    setPlaying(true)
    sfx.click()
  }

  return (
    <LabShell
      icon={<CloudRainWind className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Perbanyak kosakata lewat kategori: Animal (hewan), Food (makanan), Place (tempat). Tangkap 10 kata benar untuk menang."
      slug="word-drop"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <div className="relative">
          <canvas ref={ref} width={360} height={230} onClick={tap} className="block w-full cursor-pointer" />
          <div className="absolute left-2 top-2 flex gap-2 font-mono text-xs">
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-violet-200">Skor {score}</span>
            {combo >= 2 && (
              <span className="flex items-center gap-0.5 rounded-md bg-amber-400/20 px-2 py-0.5 font-bold text-amber-300">
                <Flame className="h-3 w-3" />x{combo}
              </span>
            )}
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-[var(--text-muted)]">{caught}/10</span>
            <span className="rounded-md bg-black/50 px-2 py-0.5 text-red-300">{"♥".repeat(Math.max(0, lives))}{"♡".repeat(Math.max(0, 3 - lives))}</span>
          </div>
        </div>
      }
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex gap-2">
            {(["Animal", "Food", "Place"] as const).map((cat) => (
              <button key={cat} onClick={() => start(cat)}
                className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 font-semibold ${playing && target === cat ? "bg-violet-400/25 text-violet-100" : "border border-[var(--border)] text-[var(--text-secondary)] hover:border-violet-400/40"}`}>
                <Play className="h-3.5 w-3.5" /> {cat}
              </button>
            ))}
          </div>
          {over && <p className="rounded-xl bg-teal-400/10 p-2 text-center text-teal-300">10 kata tertangkap! +10 XP. Coba kategori lain.</p>}
          {!playing && !over && <p className="text-center text-[var(--text-muted)]">Pilih kategori untuk mulai. Kata makin cepat tiap tangkapan.</p>}
        </div>
      }
      stats={<>Kategori {target} | {caught}/10 kata | kombo x{combo}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("word-drop") }}
      shareTitle="Lab Word Drop"
      sharePayload={{ type: "lab", slug: "word-drop" }}
    />
  )
}
