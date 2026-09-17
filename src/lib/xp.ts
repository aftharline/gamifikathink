export const XP_REWARDS = {
  chatCompleted: 10,
  quizCorrect: 15,
  bossDefeated: 25,
} as const

export function xpNeededForLevel(level: number): number {
  return level * 100
}

export function levelFromXp(totalXp: number): {
  level: number
  xpIntoLevel: number
} {
  let level = 1
  let remaining = totalXp
  while (remaining >= xpNeededForLevel(level)) {
    remaining -= xpNeededForLevel(level)
    level += 1
  }
  return { level, xpIntoLevel: remaining }
}
