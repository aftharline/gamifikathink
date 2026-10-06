import { createClient } from "@/lib/supabase/client"
import { levelUpCelebrate, sfx } from "@/lib/feedback"

export const XP_EVENT = "gamifikathink:xp"

export interface XpEventDetail {
  xp: number
  level: number
  leveledUp: boolean
}

/** add_xp RETURNS TABLE → PostgREST mengembalikan array baris; ambil baris pertama */
export function parseXpResult(data: unknown): XpEventDetail | null {
  const row = (
    Array.isArray(data) ? data[0] : data
  ) as { xp?: unknown; level?: unknown; leveled_up?: unknown } | null | undefined
  if (
    !row ||
    typeof row.xp !== "number" ||
    typeof row.level !== "number" ||
    typeof row.leveled_up !== "boolean"
  ) {
    return null
  }
  return { xp: row.xp, level: row.level, leveledUp: row.leveled_up }
}

export async function grantXp(amount: number): Promise<XpEventDetail | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // User belum login: return null secara bersih tanpa error console
      return null
    }

    const { data, error } = await supabase.rpc("add_xp", { amount })
    if (error) {
      console.warn("grantXp warning:", error.message || error.details || error)
      return null
    }
    // add_xp RETURNS TABLE → PostgREST mengembalikan array baris
    const row = Array.isArray(data) ? data[0] : data
    const detail = parseXpResult(row)
    if (!detail) {
      console.warn("grantXp warning: empty result")
      return null
    }
    window.dispatchEvent(new CustomEvent<XpEventDetail>(XP_EVENT, { detail }))
    if (detail.leveledUp) {
      levelUpCelebrate()
      sfx.levelup()
    }
    return detail
  } catch (err) {
    console.warn("grantXp failed:", err)
    return null
  }
}
