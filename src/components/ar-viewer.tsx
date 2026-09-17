"use client"

import { useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import {
  Box,
  Camera,
  Cuboid,
  Pause,
  Play,
  Rotate3d,
  Scan,
  Sparkles,
  TriangleAlert,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { sfx } from "@/lib/feedback"
import { cn } from "@/lib/utils"
import type { ArModel } from "@/lib/ar-catalog"
import type { ModelViewerElement } from "@/types/model-viewer"

const WebcamArViewer = dynamic(
  () => import("@/components/webcam-ar-viewer").then((m) => m.WebcamArViewer),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 text-sm text-[var(--text-secondary)] backdrop-blur-md">
        Menyiapkan kamera AR...
      </div>
    ),
  }
)

interface ArViewerProps {
  model: ArModel
  onArSessionStarted?: () => void
  onAllHotspotsVisited?: () => void
}

type ArStatus = "session-started" | "object-placed" | "failed" | "not-presenting"

function getInitialAutoRotate(): boolean {
  if (typeof window === "undefined") return true
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function ArViewer({
  model,
  onArSessionStarted,
  onAllHotspotsVisited,
}: ArViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null)
  const arStartedRef = useRef(false)
  const allVisitedRef = useRef(false)
  const [showWebcamAr, setShowWebcamAr] = useState(false)
  const [moduleReady, setModuleReady] = useState(false)
  const [moduleError, setModuleError] = useState(false)
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [arFailed, setArFailed] = useState(false)
  const [animations, setAnimations] = useState<string[]>(model.animations ?? [])
  const [animationName, setAnimationName] = useState<string>(
    model.animations?.[0] ?? ""
  )
  const [playing, setPlaying] = useState<boolean>(model.autoplay ?? true)
  const [autoRotate, setAutoRotate] = useState<boolean>(getInitialAutoRotate)
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [visited, setVisited] = useState<string[]>([])
  const deferLoad = model.deferLoad ?? false
  const [modelRequested, setModelRequested] = useState(!deferLoad)

  // Daftarkan web component hanya di client.
  // Catatan: import dinamis yang gagal (chunk JS tidak terunduh) dibedakan
  // dari model .glb yang gagal dimuat, agar diagnosis terlihat di UI.
  useEffect(() => {
    let cancelled = false
    import("@google/model-viewer")
      .then(() => {
        if (!cancelled) setModuleReady(true)
      })
      .catch(() => {
        if (!cancelled) setModuleError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Dengarkan event model-viewer (progress / load / ar-status / error).
  useEffect(() => {
    if (!moduleReady || !modelRequested) return
    const el = viewerRef.current
    if (!el) return

    const onProgress = (e: Event) => {
      const detail = (e as CustomEvent<{ totalProgress: number }>).detail
      if (typeof detail?.totalProgress === "number") {
        setProgress(detail.totalProgress)
      }
    }
    const onLoad = () => {
      setLoaded(true)
      setProgress(1)
      const available = el.availableAnimations ?? []
      if (available.length > 0) {
        setAnimations(available)
        setAnimationName((prev) =>
          prev && available.includes(prev) ? prev : available[0]
        )
      }
    }
    const onArStatus = (e: Event) => {
      const status = (e as CustomEvent<{ status: ArStatus }>).detail?.status
      if (status === "session-started" && !arStartedRef.current) {
        arStartedRef.current = true
        sfx.win()
        toast.success("Mode AR aktif — gerakkan HP perlahan memindai permukaan")
        onArSessionStarted?.()
      }
      if (status === "failed") {
        setArFailed(true)
        toast.error(
          "AR tidak didukung di perangkat ini — mode 3D tetap bisa dipakai"
        )
      }
    }
    const onError = () => setLoadError(true)

    el.addEventListener("progress", onProgress)
    el.addEventListener("load", onLoad)
    el.addEventListener("ar-status", onArStatus)
    el.addEventListener("error", onError)
    return () => {
      el.removeEventListener("progress", onProgress)
      el.removeEventListener("load", onLoad)
      el.removeEventListener("ar-status", onArStatus)
      el.removeEventListener("error", onError)
    }
  }, [moduleReady, modelRequested, onArSessionStarted])

  const handleHotspotClick = (id: string) => {
    sfx.click()
    setActiveHotspot(id)
    const next = visited.includes(id) ? visited : [...visited, id]
    setVisited(next)
    if (
      next.length === model.hotspots.length &&
      model.hotspots.length > 0 &&
      !allVisitedRef.current
    ) {
      allVisitedRef.current = true
      toast.success("Semua titik dijelajahi!")
      onAllHotspotsVisited?.()
    }
  }

  const togglePlay = () => {
    const el = viewerRef.current
    if (!el) return
    sfx.click()
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      el.play()
      setPlaying(true)
    }
  }

  const active = model.hotspots.find((h) => h.id === activeHotspot) ?? null

  if (moduleError || loadError) {
    return (
      <div className="glass flex flex-col items-center justify-center rounded-2xl p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={model.poster}
          alt={model.title}
          className="max-h-64 rounded-xl object-cover"
        />
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
          <TriangleAlert className="h-4 w-4 text-[var(--warning)]" />
          {moduleError
            ? "Komponen 3D gagal dimuat (kode JS). Periksa koneksi, lalu muat ulang."
            : "Model 3D gagal dimuat. Periksa koneksi, lalu muat ulang."}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="glass bg-grid relative overflow-hidden rounded-2xl">
        {/* Progress bar + status teks agar jelas sedang memuat vs macet */}
        {modelRequested && !loaded && (
          <>
            <div className="absolute inset-x-0 top-0 z-10 h-1 bg-white/5">
              <div
                className="bg-gradient-jarvis h-full transition-all duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <div className="pointer-events-none absolute inset-x-0 top-3 z-10 mx-auto w-fit rounded-lg bg-black/70 px-3 py-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
              {moduleReady
                ? `Memuat model 3D… ${Math.round(progress * 100)}%`
                : "Menyiapkan penampil 3D…"}
            </div>
          </>
        )}

        {deferLoad && !modelRequested ? (
          <button
            type="button"
            onClick={() => {
              sfx.click()
              setModelRequested(true)
            }}
            className="group relative flex h-[420px] w-full items-center justify-center overflow-hidden sm:h-[520px]"
            aria-label={`Muat model 3D ${model.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={model.poster}
              alt={model.title}
              className="h-full w-full object-contain p-4 opacity-85 transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <span className="absolute inset-x-0 top-3 z-10 mx-auto w-fit rounded-lg bg-black/70 px-3 py-1.5 font-mono text-[11px] text-[var(--text-secondary)]">
              Ketuk untuk memuat model 3D
            </span>
            <span className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-xl bg-black/70 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-lg backdrop-blur-md transition-colors group-hover:bg-black/85">
              <Sparkles className="h-4 w-4" />
              Muat Ryuri 3D
            </span>
          </button>
        ) : moduleReady ? (
          <model-viewer
            ref={viewerRef}
            src={model.glb}
            ios-src={model.usdz}
            poster={model.poster}
            ar
            ar-modes="scene-viewer quick-look webxr"
            ar-scale="auto"
            camera-controls
            autoplay={playing || undefined}
            animation-name={animationName || undefined}
            auto-rotate={autoRotate || undefined}
            loading="eager"
            reveal="auto"
            shadow-intensity="1"
            exposure="1"
            interaction-prompt="auto"
            data-name={model.id}
            className="block h-[420px] w-full sm:h-[520px]"
          >
            {model.hotspots.map((h, i) => (
              <button
                key={h.id}
                slot={`hotspot-${i}`}
                data-position={h.position}
                data-normal={h.normal}
                onClick={() => handleHotspotClick(h.id)}
                aria-label={`Titik ${h.title}`}
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-full border-2 font-mono text-sm font-bold transition-all",
                  visited.includes(h.id)
                    ? "border-emerald-300 bg-emerald-400/90 text-emerald-950"
                    : activeHotspot === h.id
                      ? "border-[var(--gold)] bg-[var(--gold)] text-black"
                      : "border-white bg-[var(--accent)] text-white glow-cyan"
                )}
              >
                {i + 1}
              </button>
            ))}

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
              <Button
                onClick={() => {
                  sfx.click()
                  setShowWebcamAr(true)
                }}
                className="bg-gradient-jarvis flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white glow-cyan transition-all hover:brightness-110 shadow-lg"
              >
                <Camera className="h-4 w-4" />
                Buka Kamera AR
              </Button>

              <button
                slot="ar-button"
                className="hidden sm:flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 px-3 py-2 text-xs font-semibold text-cyan-300 hover:bg-black/80 transition-all"
              >
                <Scan className="h-3.5 w-3.5" />
                Native AR (OS)
              </button>
            </div>
          </model-viewer>
        ) : (
          <div className="flex h-[420px] w-full items-center justify-center sm:h-[520px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={model.poster}
              alt={model.title}
              className="max-h-full object-contain opacity-80"
            />
          </div>
        )}

        {arFailed && (
          <p className="absolute inset-x-0 bottom-16 mx-auto w-fit rounded-lg bg-black/70 px-3 py-1.5 font-mono text-[11px] text-amber-200">
            Native AR tidak tersedia — gunakan tombol Kamera AR Web di atas
          </p>
        )}
      </div>

      {/* Render Fullscreen In-Browser Webcam AR Modal saat diaktifkan */}
      {showWebcamAr && (
        <WebcamArViewer
          model={model}
          onClose={() => setShowWebcamAr(false)}
          onArStarted={onArSessionStarted}
          onHotspotClick={handleHotspotClick}
        />
      )}

      {/* Kontrol interaksi */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={togglePlay}
          className="gap-2"
          aria-label={playing ? "Jeda animasi" : "Putar animasi"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {playing ? "Jeda" : "Putar"}
        </Button>
        <Button
          variant={autoRotate ? "default" : "outline"}
          size="sm"
          onClick={() => {
            sfx.click()
            setAutoRotate((v) => !v)
          }}
          className="gap-2"
          aria-pressed={autoRotate}
        >
          <Rotate3d className="h-4 w-4" />
          Rotasi {autoRotate ? "On" : "Off"}
        </Button>
        {animations.length > 1 && (
          <select
            value={animationName}
            onChange={(e) => {
              sfx.click()
              setAnimationName(e.target.value)
              setPlaying(true)
              viewerRef.current?.play()
            }}
            aria-label="Pilih animasi"
            className="glass h-9 rounded-md px-3 text-sm text-[var(--text-primary)]"
          >
            {animations.map((a) => (
              <option key={a} value={a}>
                Animasi: {a}
              </option>
            ))}
          </select>
        )}
        <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
          <Cuboid className="h-3.5 w-3.5" />
          {visited.length}/{model.hotspots.length} titik dijelajahi
        </span>
      </div>

      {/* Panel anotasi hotspot */}
      <div className="glass mt-3 min-h-20 rounded-xl p-4" aria-live="polite">
        {active ? (
          <div className="animate-fade-in">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              <Box className="h-4 w-4" />
              {active.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
              {active.body}
            </p>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            Ketuk titik bernomor pada model untuk melihat penjelasannya.
            Interaksi hotspot & kuis ada di mode 3D ini — tombol{" "}
            <strong>Lihat di AR</strong> untuk menempatkan model asli di
            mejamu.
          </p>
        )}
      </div>
    </div>
  )
}
