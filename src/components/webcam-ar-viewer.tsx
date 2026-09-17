/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"
import {
  Camera,
  CameraOff,
  Download,
  Minimize,
  RefreshCw,
  RotateCcw,
  Sparkles,
  SwitchCamera,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { sfx } from "@/lib/feedback"
import type { ArHotspot, ArModel } from "@/lib/ar-catalog"

interface WebcamArViewerProps {
  model: ArModel
  onClose: () => void
  onArStarted?: () => void
  onHotspotClick?: (id: string) => void
}

export function WebcamArViewer({
  model,
  onClose,
  onArStarted,
  onHotspotClick,
}: WebcamArViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Camera State
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  )
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  // 3D & Manipulation State
  const [scale, setScale] = useState<number>(1.0)
  const [rotationY, setRotationY] = useState<number>(0)
  const [positionOffset, setPositionOffset] = useState<{ x: number; y: number }>(
    { x: 0, y: 0 }
  )
  const [activeHotspot, setActiveHotspot] = useState<ArHotspot | null>(null)
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null)

  // Three.js References
  const sceneRef = useRef<any>(null)
  const rendererRef = useRef<any>(null)
  const modelGroupRef = useRef<any>(null)
  const cameraThreeRef = useRef<any>(null)
  const mixerRef = useRef<any>(null)
  const reqAnimFrameRef = useRef<number | null>(null)
  const onArStartedRef = useRef(onArStarted)

  // Touch Gesture Handling
  const isDraggingRef = useRef(false)
  const previousTouchRef = useRef<{ x: number; y: number } | null>(null)
  const initialPinchDistanceRef = useRef<number | null>(null)
  const initialPinchScaleRef = useRef<number>(1.0)

  useEffect(() => {
    onArStartedRef.current = onArStarted
  }, [onArStarted])

  // 1. Inisialisasi Kamera Real-time
  useEffect(() => {
    let active = true
    const videoEl = videoRef.current
    let currentStream: MediaStream | null = null

    async function initCamera() {
      try {
        if (videoEl?.srcObject) {
          const oldStream = videoEl.srcObject as MediaStream
          oldStream.getTracks().forEach((track) => track.stop())
        }

        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter((d) => d.kind === "videoinput")
        if (active) setHasMultipleCameras(videoDevices.length > 1)

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        currentStream = stream
        if (!active) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }

        if (videoEl && active) {
          videoEl.srcObject = stream
          await videoEl.play()
          setCameraActive(true)
          onArStartedRef.current?.()
        }
      } catch (err) {
        console.error("Camera access error:", err)
        if (active) {
          const errorName = err instanceof DOMException ? err.name : ""
          setCameraError(
            errorName === "NotReadableError"
              ? "Kamera sedang dipakai aplikasi/tab lain. Tutup kamera lain lalu coba lagi."
              : "Gagal mengakses kamera. Pastikan izin kamera telah diberikan di browser."
          )
        }
      }
    }

    initCamera()

    return () => {
      active = false
      currentStream?.getTracks().forEach((track) => track.stop())
      if (videoEl?.srcObject) {
        const stream = videoEl.srcObject as MediaStream
        stream.getTracks().forEach((track) => track.stop())
        videoEl.srcObject = null
      }
    }
  }, [facingMode, retryKey])

  const retryCamera = useCallback(() => {
    setCameraError(null)
    setCameraActive(false)
    setRetryKey((k) => k + 1)
  }, [])

  // 2. Inisialisasi Scene Three.js Transparan di Atas Video
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const width = container.clientWidth
    const height = container.clientHeight

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera 3D
    const cameraThree = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      1000
    )
    cameraThree.position.set(0, 0, 5)
    cameraThreeRef.current = cameraThree

    // Lighting (Realistic Ambient & Directional light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0)
    dirLight1.position.set(5, 10, 7)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0)
    dirLight2.position.set(-5, -5, -5)
    scene.add(dirLight2)

    // Renderer (Alpha true untuk background transparan!)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    rendererRef.current = renderer

    // Group Penampung Model
    const modelGroup = new THREE.Group()
    scene.add(modelGroup)
    modelGroupRef.current = modelGroup

    // Load Model GLB
    const loader = new GLTFLoader()
    loader.setMeshoptDecoder(MeshoptDecoder)
    loader.load(
      model.glb,
      (gltf: any) => {
        const loadedObject = gltf.scene

        // Hitung Bounding Box untuk Sentralisasi & Skala Otomatis
        const box = new THREE.Box3().setFromObject(loadedObject)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const desiredScale = maxDim > 0 ? 2.0 / maxDim : 1.0

        loadedObject.position.sub(center) // Pindahkan center ke pivot (0,0,0)
        loadedObject.scale.setScalar(desiredScale)

        modelGroup.add(loadedObject)

        // Setup Animasi jika ada
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(loadedObject)
          const action = mixer.clipAction(gltf.animations[0])
          action.play()
          mixerRef.current = mixer
        }
      },
      undefined,
      (err: any) => {
        console.error("Gagal memuat GLB di Kamera AR:", err)
        toast.error("Model 3D gagal dimuat di kamera AR.")
      }
    )

    let lastTime = performance.now()

    // Animation Loop
    const animate = (now: number) => {
      reqAnimFrameRef.current = requestAnimationFrame(animate)

      const delta = (now - lastTime) / 1000
      lastTime = now

      if (mixerRef.current && Number.isFinite(delta) && delta > 0) {
        mixerRef.current.update(delta)
      }

      if (rendererRef.current && sceneRef.current && cameraThreeRef.current) {
        rendererRef.current.render(
          sceneRef.current,
          cameraThreeRef.current
        )
      }
    }
    animate(performance.now())

    // Resize Handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraThreeRef.current) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight

      cameraThreeRef.current.aspect = newWidth / newHeight
      cameraThreeRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(newWidth, newHeight)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (reqAnimFrameRef.current) {
        cancelAnimationFrame(reqAnimFrameRef.current)
      }
      renderer.dispose()
    }
  }, [model.glb])

  // Sync Skala, Rotasi, dan Posisi Objek di Three.js Scene
  useEffect(() => {
    if (!modelGroupRef.current) return
    modelGroupRef.current.scale.setScalar(scale)
    modelGroupRef.current.rotation.y = rotationY
    modelGroupRef.current.position.x = positionOffset.x
    modelGroupRef.current.position.y = positionOffset.y
  }, [scale, rotationY, positionOffset])

  // 3. Touch Gesture Handlers (Drag to Move & Rotate / Pinch to Zoom)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true
    previousTouchRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !previousTouchRef.current) return

    const deltaX = e.clientX - previousTouchRef.current.x
    const deltaY = e.clientY - previousTouchRef.current.y

    // Shift + drag atau tombol alternatif untuk rotasi vs geser
    if (e.shiftKey) {
      setRotationY((prev) => prev + deltaX * 0.01)
    } else {
      setPositionOffset((prev) => ({
        x: prev.x + deltaX * 0.005,
        y: prev.y - deltaY * 0.005,
      }))
    }

    previousTouchRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
    previousTouchRef.current = null
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      initialPinchDistanceRef.current = dist
      initialPinchScaleRef.current = scale
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (
      e.touches.length === 2 &&
      initialPinchDistanceRef.current !== null
    ) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)

      const factor = dist / initialPinchDistanceRef.current
      const newScale = Math.min(
        Math.max(initialPinchScaleRef.current * factor, 0.3),
        4.0
      )
      setScale(newScale)
    }
  }

  const handleTouchEnd = () => {
    initialPinchDistanceRef.current = null
  }

  // 4. Fitur Ambil Foto AR (Snapshot Capture)
  const takeSnapshot = () => {
    sfx.click()
    const video = videoRef.current
    const canvas3d = canvasRef.current
    if (!video || !canvas3d) return

    // Buat canvas gabungan ukuran video
    const mergeCanvas = document.createElement("canvas")
    const width = video.videoWidth || canvas3d.width
    const height = video.videoHeight || canvas3d.height
    mergeCanvas.width = width
    mergeCanvas.height = height

    const ctx = mergeCanvas.getContext("2d")
    if (!ctx) return

    // 1. Gambar frame video kamera di background
    ctx.drawImage(video, 0, 0, width, height)

    // 2. Gambar hasil render 3D canvas di atasnya
    ctx.drawImage(canvas3d, 0, 0, width, height)

    // 3. Tambahkan watermark GamifikaThink AR yang elegan
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)"
    ctx.fillRect(20, height - 70, 320, 50)
    ctx.fillStyle = "#38bdf8"
    ctx.font = "bold 18px sans-serif"
    ctx.fillText("GamifikaThink AR Lab", 35, height - 42)
    ctx.fillStyle = "#e2e8f0"
    ctx.font = "12px sans-serif"
    ctx.fillText(model.title, 35, height - 26)

    const dataUrl = mergeCanvas.toDataURL("image/png")
    setSnapshotUrl(dataUrl)
    sfx.win()
    toast.success("Foto AR berhasil diambil!")
  }

  const downloadSnapshot = () => {
    if (!snapshotUrl) return
    const a = document.createElement("a")
    a.href = snapshotUrl
    a.download = `ar-${model.id}-${Date.now()}.png`
    a.click()
    toast.success("Foto diunduh ke galeri.")
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top Bar Navigation */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-5 w-5 text-[var(--accent)] animate-pulse" />
          <div>
            <h2 className="text-sm font-bold leading-none">{model.title}</h2>
            <p className="text-[10px] text-cyan-300 font-mono">
              Kamera AR Web (In-Browser Live View)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasMultipleCameras && (
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 bg-black/50 border-white/20 text-white hover:bg-white/20"
              onClick={() => {
                sfx.click()
                setFacingMode((prev) =>
                  prev === "environment" ? "user" : "environment"
                )
              }}
              title="Ganti Kamera Front/Back"
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9 bg-black/50 border-white/20 text-white hover:bg-white/20"
            onClick={() => {
              sfx.click()
              onClose()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Container Viewport */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Stream Video Kamera */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            cameraActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* WebGL Canvas 3D Overlay Transparan */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Loading Indicator Kamera */}
        {!cameraActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
            <RefreshCw className="h-8 w-8 text-[var(--accent)] animate-spin mb-3" />
            <p className="text-sm font-semibold">Mengakses Kamera Browser...</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs">
              Izinkan akses kamera pada peramban web Anda untuk memulai AR.
            </p>
          </div>
        )}

        {/* State Error Akses Kamera */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/95 text-white p-6 text-center z-20">
            <CameraOff className="h-10 w-10 text-rose-500 mb-3" />
            <p className="text-sm font-semibold text-rose-300">{cameraError}</p>
            <Button
              onClick={retryCamera}
              variant="outline"
              className="mt-4 gap-2 border-cyan-500/50 text-cyan-300"
            >
              <RefreshCw className="h-4 w-4" /> Coba Lagi
            </Button>
          </div>
        )}

        {/* Floating Hotspots Overlay */}
        {model.hotspots.length > 0 && (
          <div className="absolute top-16 left-4 z-20 flex flex-wrap gap-2 max-w-xs pointer-events-auto">
            {model.hotspots.map((h, i) => (
              <button
                key={h.id}
                onClick={() => {
                  sfx.click()
                  setActiveHotspot(h)
                  onHotspotClick?.(h.id)
                }}
                className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md transition-all border ${
                  activeHotspot?.id === h.id
                    ? "bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/30"
                    : "bg-black/60 text-cyan-300 border-cyan-500/40 hover:bg-black/80"
                }`}
              >
                📍 {i + 1}. {h.title}
              </button>
            ))}
          </div>
        )}

        {/* Hotspot Card Detail Modal */}
        {activeHotspot && (
          <div className="absolute bottom-28 inset-x-4 z-30 max-w-md mx-auto p-4 rounded-xl glass bg-black/80 border border-cyan-500/50 text-white animate-fade-in pointer-events-auto">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-1.5">
                📍 {activeHotspot.title}
              </h4>
              <button
                onClick={() => setActiveHotspot(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {activeHotspot.body}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls Toolbar */}
      <div className="relative z-30 p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center gap-3">
        {/* Instruction hint */}
        <p className="text-[11px] text-zinc-400 text-center font-mono">
          💡 Geser layar untuk memindahkan • Cubit/slider untuk memperbesar
        </p>

        {/* Interactive Controls Bar */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md p-2 rounded-2xl border border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10"
            onClick={() => setScale((s) => Math.max(0.3, s - 0.2))}
            title="Kecilkan Skala"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>

          {/* Scale Slider */}
          <input
            type="range"
            min="0.3"
            max="3.0"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-24 accent-[var(--accent)]"
          />

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10"
            onClick={() => setScale((s) => Math.min(3.0, s + 0.2))}
            title="Besarkan Skala"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>

          <div className="h-4 w-px bg-white/20 mx-1" />

          {/* Rotate Control */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10"
            onClick={() => setRotationY((r) => r + Math.PI / 4)}
            title="Putar Objek"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          {/* Reset Position */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-white hover:bg-white/10"
            onClick={() => {
              sfx.click()
              setScale(1.0)
              setRotationY(0)
              setPositionOffset({ x: 0, y: 0 })
            }}
            title="Reset Posisi & Skala"
          >
            <Minimize className="h-4 w-4" />
          </Button>
        </div>

        {/* Primary Action Button: Snapshot Photo */}
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={takeSnapshot}
            disabled={!cameraActive}
            className="bg-gradient-jarvis px-6 py-5 rounded-2xl font-bold text-white shadow-lg shadow-cyan-500/20 glow-cyan gap-2 hover:brightness-110 active:scale-95 transition-all"
          >
            <Camera className="h-5 w-5" /> Ambil Foto AR
          </Button>
        </div>
      </div>

      {/* Snapshot Preview Modal Dialog */}
      {snapshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-lg w-full bg-zinc-900 border border-cyan-500/40 rounded-2xl overflow-hidden p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                <Camera className="h-4 w-4 text-[var(--accent)]" /> Hasil Foto AR
              </h3>
              <button
                onClick={() => setSnapshotUrl(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={snapshotUrl}
              alt="Hasil Foto AR"
              className="w-full rounded-xl border border-white/10 object-contain max-h-[60vh]"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSnapshotUrl(null)}
                className="border-white/20 text-white"
              >
                Tutup
              </Button>
              <Button
                onClick={downloadSnapshot}
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold gap-2"
              >
                <Download className="h-4 w-4" /> Unduh Foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
