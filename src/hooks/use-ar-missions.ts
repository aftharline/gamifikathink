"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { grantXp } from "@/lib/xp-events"
import { sfx } from "@/lib/feedback"
import type { ArModel } from "@/lib/ar-catalog"

export type ArMissionId = "open" | "hotspots" | "quiz"

export interface ArMission {
  id: ArMissionId
  title: string
  desc: string
  xp: number
  done: boolean
}

const COOLDOWN_MS = 24 * 3600 * 1000

function key(modelId: string, id: ArMissionId): string {
  return `ar-xp-${modelId}-${id}`
}

function readTs(modelId: string, id: ArMissionId): number | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(key(modelId, id))
  const ts = raw ? Number(raw) : NaN
  return Number.isFinite(ts) ? ts : null
}

function formatCooldown(ms: number): string {
  const h = Math.floor(ms / 3600000)
  const m = Math.ceil((ms % 3600000) / 60000)
  if (h <= 0) return `${m} mnt`
  return `${h} jam ${m} mnt`
}

const MISSION_META: Record<
  ArMissionId,
  { title: string; desc: string; xpKey: "open" | "hotspotsAll" | "quiz" }
> = {
  open: {
    title: "Buka di AR",
    desc: "Tekan Lihat di AR dan pindai permukaan",
    xpKey: "open",
  },
  hotspots: {
    title: "Jelajahi semua hotspot",
    desc: "Ketuk semua titik bernomor pada model",
    xpKey: "hotspotsAll",
  },
  quiz: {
    title: "Taklukkan kuis model",
    desc: "Jawab semua soal dengan benar",
    xpKey: "quiz",
  },
}

const MISSION_IDS: ArMissionId[] = ["open", "hotspots", "quiz"]

export function useArMissions(model: ArModel | undefined) {
  // Init selalu false agar render server = render klien pertama (anti hydration
  // mismatch); status klaim localStorage disinkronkan di effect di bawah.
  const [claimed, setClaimed] = useState<Record<ArMissionId, boolean>>({
    open: false,
    hotspots: false,
    quiz: false,
  })

  useEffect(() => {
    if (!model) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sinkronisasi storage-ke-state pasca-hydration
    setClaimed({
      open: readTs(model.id, "open") !== null,
      hotspots: readTs(model.id, "hotspots") !== null,
      quiz: readTs(model.id, "quiz") !== null,
    })
  }, [model])

  const notify = useCallback(
    async (id: ArMissionId) => {
      if (!model) return
      const now = Date.now()
      const last = readTs(model.id, id)
      if (last !== null && now - last < COOLDOWN_MS) {
        toast.info(
          `Misi sudah diklaim, tersedia lagi dalam ${formatCooldown(COOLDOWN_MS - (now - last))}`
        )
        return
      }
      const amount = model.xp[MISSION_META[id].xpKey]
      const detail = await grantXp(amount)
      if (!detail) {
        toast.error("Masuk dulu untuk simpan XP")
        return
      }
      window.localStorage.setItem(key(model.id, id), String(now))
      setClaimed((prev) => ({ ...prev, [id]: true }))
      sfx.correct()
      toast.success(`+${amount} XP: ${MISSION_META[id].title}!`)
    },
    [model]
  )

  const missions: ArMission[] = MISSION_IDS.map((id) => ({
    id,
    title: MISSION_META[id].title,
    desc: MISSION_META[id].desc,
    xp: model ? model.xp[MISSION_META[id].xpKey] : 0,
    done: claimed[id],
  }))

  return { missions, notify }
}
