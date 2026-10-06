"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDownWideNarrow, Play, Pause, StepForward } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"

const meta = getLab("sorting")!

type Algo = "bubble" | "selection"
const N = 8

function shuffled(): number[] {
  const a = Array.from({ length: N }, (_, i) => 15 + i * 10)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// langkah bubble sort: snapshot array + pasangan yang dibandingkan
interface Frame { arr: number[]; hi: [number, number]; sorted: number; comps: number; swaps: number }

// Sorting visual: bubble vs selection, play/step, tebak langkah
export function SortingSim() {
  const [algo, setAlgo] = useState<Algo>("bubble")
  const [frames, setFrames] = useState<Frame[]>([])
  const [fi, setFi] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [quizOk, setQuizOk] = useState(false)
  const ref = useRef<HTMLCanvasElement>(null)

  const build = (a: Algo, arr: number[]) => {
    const fr: Frame[] = []
    const x = [...arr]
    let comps = 0
    let swaps = 0
    const push = (hi: [number, number], sorted: number) => fr.push({ arr: [...x], hi, sorted, comps, swaps })
    if (a === "bubble") {
      for (let i = 0; i < x.length; i++) {
        for (let j = 0; j < x.length - 1 - i; j++) {
          comps++
          push([j, j + 1], x.length - i)
          if (x[j] > x[j + 1]) {
            ;[x[j], x[j + 1]] = [x[j + 1], x[j]]
            swaps++
            push([j, j + 1], x.length - i)
          }
        }
      }
    } else {
      for (let i = 0; i < x.length; i++) {
        let m = i
        for (let j = i + 1; j < x.length; j++) {
          comps++
          push([m, j], i)
          if (x[j] < x[m]) m = j
        }
        ;[x[i], x[m]] = [x[m], x[i]]
        if (i !== m) swaps++
        push([i, m], i + 1)
      }
    }
    push([-1, -1], x.length)
    return fr
  }

  const fresh = (a: Algo) => {
    const fr = build(a, shuffled())
    setFrames(fr)
    setFi(0)
    setPlaying(false)
    setQuizOk(false)
  }

  /* eslint-disable react-hooks/set-state-in-effect -- init frame sekali per algo */
  useEffect(() => {
    fresh(algo)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init sekali per algo
  }, [algo])
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!playing || frames.length === 0) return
    if (fi >= frames.length - 1) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- akhir animasi sekali
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setFi(fi + 1), 420)
    return () => clearTimeout(id)
  }, [playing, fi, frames.length])

  useEffect(() => {
    const c = ref.current
    if (!c || frames.length === 0) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    const W = c.width, H = c.height
    const bg = ctx.createLinearGradient(0, 0, 0, H)
    bg.addColorStop(0, "#0a1e2e"); bg.addColorStop(1, "#0a1420")
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, W, H)
    const f = frames[Math.min(fi, frames.length - 1)]
    const bw = (W - 20) / N
    f.arr.forEach((v, i) => {
      const h = (v / 100) * (H - 60)
      const x = 10 + i * bw + 3
      const y = H - 26 - h
      const isHi = f.hi[0] === i || f.hi[1] === i
      const isSorted = i >= N - f.sorted
      const grad = ctx.createLinearGradient(0, y, 0, y + h)
      if (isHi) { grad.addColorStop(0, "#fbbf24"); grad.addColorStop(1, "#b45309") }
      else if (isSorted) { grad.addColorStop(0, "#34d399"); grad.addColorStop(1, "#065f46") }
      else { grad.addColorStop(0, "#22d3ee"); grad.addColorStop(1, "#0c4a6e") }
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x, y, bw - 6, h, 4)
      ctx.fill()
      ctx.fillStyle = "rgba(255,255,255,.85)"
      ctx.font = "9px sans-serif"
      ctx.fillText(`${v}`, x + 3, y + 12)
    })
    ctx.fillStyle = "#94a3b8"
    ctx.font = "10px sans-serif"
    ctx.fillText(`Langkah ${Math.min(fi + 1, frames.length)}/${frames.length}: ${algo === "bubble" ? "Bubble: bandingkan tetangga" : "Selection: cari minimum"}`, 10, 14)
    const last = frames[frames.length - 1]
    ctx.fillStyle = "rgba(148,163,184,.85)"
    ctx.fillText(`banding ${f.comps} · tukar ${f.swaps} (total ${last.comps}/${last.swaps})`, 10, H - 8)
  }, [frames, fi, algo])

  return (
    <LabShell
      icon={<ArrowDownWideNarrow className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Bubble sort menukar tetangga yang terbalik (gelembung naik). Selection sort mencari nilai terkecil lalu menaruhnya di depan."
      slug="sorting"
      greeting={meta.greeting}
      story={meta.story}
      scene={<canvas ref={ref} width={360} height={210} className="block w-full" />}
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex gap-2">
            {(["bubble", "selection"] as const).map((a) => (
              <button key={a} onClick={() => { setAlgo(a); sfx.click() }}
                className={`flex-1 rounded-xl py-2 font-semibold capitalize ${algo === a ? "bg-cyan-400/20 text-cyan-100" : "border border-[var(--border)] text-[var(--text-secondary)]"}`}>
                {a === "bubble" ? "Bubble sort" : "Selection sort"}
              </button>
            ))}
            <button onClick={() => fresh(algo)} className="rounded-xl border border-[var(--border)] px-3 text-[var(--text-muted)]">
              Acak
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPlaying(!playing)} disabled={fi >= frames.length - 1}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-cyan-400/15 py-2 font-semibold text-cyan-100 disabled:opacity-40">
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {playing ? "Jeda" : "Putar"}
            </button>
            <button onClick={() => setFi((v) => Math.min(frames.length - 1, v + 1))}
              className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-[var(--text-secondary)]">
              <StepForward className="h-4 w-4" /> Langkah
            </button>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${frames.length ? ((fi + 1) / frames.length) * 100 : 0}%` }} />
          </div>
          {!quizOk ? (
            <button
              onClick={() => {
                // misi: tonton sampai selesai lalu klaim
                if (fi >= frames.length - 1) { setQuizOk(true); sfx.correct(); grantXp(10); markLabDone("sorting") }
                else sfx.wrong()
              }}
              className="rounded-xl bg-cyan-400/15 py-2 font-semibold text-cyan-100">
              Klaim misi: tonton sampai akhir (+10 XP)
            </button>
          ) : (
            <p className="rounded-xl bg-teal-400/10 p-2 text-center text-teal-300">Tuntas! +10 XP. Coba algoritma satunya.</p>
          )}
        </div>
      }
      stats={<>{algo} | langkah {Math.min(fi + 1, frames.length || 1)}/{frames.length || 1}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("sorting") }}
      shareTitle="Lab Sorting Visual"
      sharePayload={{ type: "lab", slug: "sorting" }}
    />
  )
}
