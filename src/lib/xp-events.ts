import { createClient } from "@/lib/supabase/client"
import { levelUpCelebrate, sfx } from "@/lib/feedback"

export const XP_EVENT = "gamifikathink:xp"

export interface XpEventDetail {
  xp: number
  level: number
  leveledUp: boolean
}

export async function grantXp(amount: number): Promise<XpEventDetail | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // User belum login — return null secara bersih tanpa error console
      return null
    }

    const { data, error } = await supabase.rpc("add_xp", { amount })
    if (error) {
      console.warn("grantXp warning:", error.message || error.details || error)
      return null
    }
    const detail: XpEventDetail = {
      xp: data.xp,
      level: data.level,
      leveledUp: data.leveled_up,
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
