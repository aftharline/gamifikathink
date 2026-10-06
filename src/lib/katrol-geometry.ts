// Geometri katrol murni (tanpa JSX) agar bisa di-test.

export const KATROL_W = 360
export const KATROL_MARGIN = 16

// Segitiga selalu muat kanvas 360px: clamp panjang dan posisi puncak.
export function katrolLayout(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  const availW = KATROL_W - KATROL_MARGIN * 2 - 70 // ruang beban gantung kanan
  const availH = 148
  const L = Math.min(availW / Math.cos(rad), availH / Math.sin(rad))
  const bx = KATROL_MARGIN + 8
  const by = 212 // GROUND = 236 - 24
  const topX = Math.min(bx + L * Math.cos(rad), KATROL_W - 86)
  const topY = by - L * Math.sin(rad)
  return { rad, L, bx, by, topX, topY }
}
