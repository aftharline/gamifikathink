"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { ShareButton } from "@/components/share-button"
import { TutorialTour } from "@/components/tutorial-tour"
import { getLab, LABS } from "@/lib/lab-catalog"
import { ProjectileSim } from "@/components/lab/projectile"
import { PendulumSim } from "@/components/lab/pendulum"
import { H2oSim } from "@/components/lab/h2o"
import { FunctionGraphSim } from "@/components/lab/function-graph"
import { CellSim } from "@/components/lab/cell"
import { BrainVisual } from "@/components/lab/brain-visual"
import { PecahanSim } from "@/components/lab/pecahan"
import { KatrolSim } from "@/components/lab/katrol"
import { PhMixerSim } from "@/components/lab/ph-mixer"
import { RantaiSim } from "@/components/lab/rantai-makanan"
import { WordDropSim } from "@/components/lab/word-drop"
import { ImbuhanSim } from "@/components/lab/imbuhan"
import { PasarSim } from "@/components/lab/pasar"
import { PetaSim } from "@/components/lab/peta-lapisan"
import { TimelineSim } from "@/components/lab/timeline"
import { GarudaSim } from "@/components/lab/garuda"
import { MagnetSim } from "@/components/lab/magnet"
import { SortingSim } from "@/components/lab/sorting"

export default function LabDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const lab = getLab(slug)
  const idx = LABS.findIndex((l) => l.slug === slug)
  const prev = idx > 0 ? LABS[idx - 1] : null
  const next = idx >= 0 && idx < LABS.length - 1 ? LABS[idx + 1] : null
  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mx-auto max-w-xl space-y-4">
          <Link href="/lab" className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
            <ArrowLeft className="h-4 w-4" /> Lab
          </Link>
          {!lab ? (
            <p className="text-sm text-[var(--text-secondary)]">Simulasi tidak ditemukan.</p>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <MobileMenuTrigger />
                <lab.icon className="h-5 w-5 text-teal-300" />
                <h1 className="text-lg font-bold text-[var(--text-primary)]">{lab.title}</h1>
              </div>
              <div key={slug} data-tour="lab-sim" className="fx-pop-in">
                {slug === "proyektil" && <ProjectileSim />}
                {slug === "bandul" && <PendulumSim />}
                {slug === "h2o" && <H2oSim />}
                {slug === "grafik" && <FunctionGraphSim />}
                {slug === "sel" && <CellSim />}
                {slug === "otak-visual" && <BrainVisual />}
                {slug === "pecahan" && <PecahanSim />}
                {slug === "katrol" && <KatrolSim />}
                {slug === "ph-mixer" && <PhMixerSim />}
                {slug === "rantai-makanan" && <RantaiSim />}
                {slug === "word-drop" && <WordDropSim />}
                {slug === "imbuhan" && <ImbuhanSim />}
                {slug === "pasar" && <PasarSim />}
                {slug === "peta-lapisan" && <PetaSim />}
                {slug === "timeline" && <TimelineSim />}
                {slug === "garuda" && <GarudaSim />}
                {slug === "magnet" && <MagnetSim />}
                {slug === "sorting" && <SortingSim />}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  {prev && (
                    <Link href={`/lab/${prev.slug}`} className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-teal-400/40 hover:text-teal-200">
                      <ChevronLeft className="h-3.5 w-3.5" /> {prev.title}
                    </Link>
                  )}
                  {next && (
                    <Link href={`/lab/${next.slug}`} className="flex items-center gap-1 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-secondary)] hover:border-teal-400/40 hover:text-teal-200">
                      {next.title} <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <ShareButton title={`Lab ${lab.title}`} payload={{ type: "lab", slug }} />
              </div>
            </>
          )}
        </div>
      </main>
      <TutorialTour tour="lab" />
    </div>
  )
}
