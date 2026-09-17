"use client"

export const dynamic = "force-dynamic"

import dynamicImport from "next/dynamic"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Sidebar } from "@/components/sidebar"
import { BackgroundFX } from "@/components/background-fx"
import { ArcReactor } from "@/components/arc-reactor"
import { MobileMenuTrigger } from "@/components/mobile-menu-trigger"
import { ArMissions } from "@/components/ar-missions"
import { ArQuiz } from "@/components/ar-quiz"
import { useArMissions } from "@/hooks/use-ar-missions"
import { getArModel } from "@/lib/ar-catalog"

const ArViewer = dynamicImport(
  () => import("@/components/ar-viewer").then((m) => m.ArViewer),
  {
    ssr: false,
    loading: () => (
      <div className="glass flex h-[420px] w-full items-center justify-center rounded-2xl sm:h-[520px]">
        <ArcReactor size="sm" className="animate-pulse-glow" />
      </div>
    ),
  }
)

export default function ArDetailPage() {
  const params = useParams<{ id: string }>()
  const model = getArModel(params.id)
  const { missions, notify } = useArMissions(model)

  return (
    <div className="relative flex h-screen overflow-hidden">
      <BackgroundFX />
      <Sidebar />
      <main className="relative z-10 flex flex-1 flex-col overflow-y-auto">
        <div className="flex items-center p-4 pb-0 lg:hidden">
          <MobileMenuTrigger />
        </div>
        <div className="mx-auto w-full max-w-3xl flex-1 p-4 sm:p-6">
          <Link
            href="/ar"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            AR Lab
          </Link>

          {!model ? (
            <div className="mt-10 text-center">
              <p className="text-sm text-[var(--text-secondary)]">
                Model tidak ditemukan.
              </p>
              <Link
                href="/ar"
                className="mt-3 inline-block text-sm text-[var(--accent)] underline"
              >
                Kembali ke katalog
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
                  {model.subject}
                </span>
                {model.placeholderAssets &&
                  model.placeholderAssets.length > 0 && (
                    <span className="rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300">
                      Aset sementara ({model.placeholderAssets.join(", ")})
                    </span>
                  )}
              </div>
              <h1 className="mt-2 font-sans text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
                {model.title}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {model.description}
              </p>

              <div className="mt-5">
                <ArViewer
                  key={model.id}
                  model={model}
                  onArSessionStarted={() => notify("open")}
                  onAllHotspotsVisited={() => notify("hotspots")}
                />
              </div>

              <ArMissions missions={missions} />
              <ArQuiz model={model} onPassed={() => notify("quiz")} />

              <p className="mt-4 flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Lisensi aset: {model.license.author} — {model.license.name}
                {model.license.url && (
                  <a
                    href={model.license.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                  >
                    sumber <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
