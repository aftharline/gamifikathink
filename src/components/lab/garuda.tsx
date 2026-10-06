"use client"

import { useState } from "react"
import { Shield, Check, X, ScanEye } from "lucide-react"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import { markLabDone } from "@/lib/lab-progress"
import { LabShell } from "@/components/lab/lab-shell"
import { getLab } from "@/lib/lab-catalog"
import { GarudaFigure, GARUDA_COUNTS } from "@/components/lab/garuda-figure"

const meta = getLab("garuda")!

const SILA = [
  { n: 1, symbol: "Bintang", body: "Ketuhanan Yang Maha Esa", example: "Beribadah sesuai agama masing-masing." },
  { n: 2, symbol: "Rantai", body: "Kemanusiaan yang adil dan beradab", example: "Menolong korban bencana tanpa pamrih." },
  { n: 3, symbol: "Pohon beringin", body: "Persatuan Indonesia", example: "Gotong royong membersihkan lingkungan." },
  { n: 4, symbol: "Kepala banteng", body: "Kerakyatan yang dipimpin oleh hikmat kebijaksanaan", example: "Musyawarah memilih ketua kelas." },
  { n: 5, symbol: "Padi dan kapas", body: "Keadilan sosial bagi seluruh rakyat Indonesia", example: "Bantuan sembako merata ke warga." },
]

const QUIZ = [
  { q: "Gotong royong → sila?", opts: ["1", "3"], a: 1 },
  { q: "Musyawarah kelas → sila?", opts: ["4", "2"], a: 0 },
  { q: "Beribadah → sila?", opts: ["5", "1"], a: 1 },
  { q: "Menolong bencana → sila?", opts: ["2", "3"], a: 0 },
  { q: "Bantuan merata → sila?", opts: ["5", "4"], a: 0 },
]

// Garuda heraldik: figur detail + klik ruang perisai + mode bedah + kuis 5
export function GarudaSim() {
  const [active, setActive] = useState(0)
  const [bedah, setBedah] = useState(false)
  const [qi, setQi] = useState(0)
  const [done, setDone] = useState(false)
  const [wrong, setWrong] = useState(false)

  const pick = (i: number) => {
    setActive(i)
    sfx.click()
  }

  const answer = (k: number) => {
    if (done) return
    if (k === QUIZ[qi].a) {
      sfx.correct()
      if (qi + 1 >= QUIZ.length) {
        setDone(true); grantXp(10); markLabDone("garuda")
      } else setQi(qi + 1)
      setWrong(false)
    } else {
      sfx.wrong()
      setWrong(true)
    }
  }

  return (
    <LabShell
      icon={<Shield className="h-5 w-5" />}
      title={meta.title}
      subject={meta.subject}
      theory="Garuda heraldik: jambul mahkota, sayap berlapis, perisai 5 ruang sila, ekor 8 helai, cakar mencengkeram pita Bhinneka Tunggal Ika. Klik ruang perisai untuk detail tiap sila."
      slug="garuda"
      greeting={meta.greeting}
      story={meta.story}
      scene={
        <div>
          <GarudaFigure activeSila={active} onPickSila={pick} />
          {bedah && (
            <div className="fx-pop-in grid grid-cols-2 gap-1.5 border-t border-red-400/15 p-3 text-[11px]">
              {GARUDA_COUNTS.map((c) => (
                <div key={c.label} className="flex items-center justify-between rounded-lg bg-black/30 px-2.5 py-1.5">
                  <span className="text-[var(--text-secondary)]">{c.label}</span>
                  <span className="font-mono font-bold text-amber-300">{c.value}</span>
                </div>
              ))}
              <p className="col-span-2 text-center text-[var(--text-muted)]">17-8-1945: tanggal Proklamasi Kemerdekaan.</p>
            </div>
          )}
        </div>
      }
      controls={
        <div className="grid gap-2 text-xs">
          <div className="flex gap-1.5">
            {SILA.map((s, i) => (
              <button key={s.n} onClick={() => pick(i)}
                className={`flex-1 rounded-lg py-1.5 font-mono font-bold ${active === i ? "bg-red-500/25 text-red-100" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>
                {s.n}
              </button>
            ))}
            <button onClick={() => { setBedah(!bedah); sfx.click() }} title="Bedah anatomi"
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 ${bedah ? "bg-amber-400/20 text-amber-200" : "border border-[var(--border)] text-[var(--text-muted)]"}`}>
              <ScanEye className="h-3.5 w-3.5" /> Bedah
            </button>
          </div>
          <div className="fx-pop-in rounded-xl border border-red-400/25 bg-black/30 p-3" key={active}>
            <p className="font-semibold text-red-100">Sila {SILA[active].n}: {SILA[active].body}</p>
            <p className="mt-0.5 text-[var(--text-secondary)]">Simbol: {SILA[active].symbol}</p>
            <p className="mt-0.5 text-[var(--text-secondary)]">Contoh: {SILA[active].example}</p>
          </div>
          <div className="rounded-xl bg-black/30 p-3">
            <p className="font-semibold text-[var(--text-primary)]">
              Kuis {qi + 1}/{QUIZ.length}: {done ? "Selesai" : QUIZ[qi].q}
            </p>
            {!done ? (
              <div className="mt-1.5 flex gap-2">
                {QUIZ[qi].opts.map((o, k) => (
                  <button key={o} onClick={() => answer(k)}
                    className="flex-1 rounded-lg border border-[var(--border)] px-3 py-1.5 hover:border-red-400/50">
                    Sila {o}
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-1.5 flex items-center gap-1.5 text-teal-300">
                <Check className="h-4 w-4" /> 5/5 sempurna! +10 XP.
              </p>
            )}
            {wrong && !done && (
              <p className="mt-1.5 flex items-center gap-1.5 text-red-300">
                <X className="h-4 w-4" /> Kurang tepat, ingat contohnya.
              </p>
            )}
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-red-400 transition-all" style={{ width: `${((done ? QUIZ.length : qi) / QUIZ.length) * 100}%` }} />
            </div>
          </div>
        </div>
      }
      stats={<>Sila aktif: {active + 1}/5 | kuis {done ? QUIZ.length : qi}/{QUIZ.length}{bedah ? " | mode bedah" : ""}</>}
      actionLabel="Tandai dipelajari (+5 XP)"
      onAction={() => { grantXp(5); markLabDone("garuda") }}
      shareTitle="Lab Garuda Pancasila"
      sharePayload={{ type: "lab", slug: "garuda" }}
    />
  )
}
