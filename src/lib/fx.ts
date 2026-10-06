// ponytail: pool partikel tetap (tanpa alokasi per frame) + popup skor

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
}

const MAX = 220

export function createPool(): Particle[] {
  return []
}

export function spawn(
  pool: Particle[],
  x: number,
  y: number,
  n: number,
  color: string,
  speed = 2.4,
  lowFx = false
): void {
  const count = lowFx ? Math.ceil(n / 4) : n
  for (let i = 0; i < count; i++) {
    if (pool.length >= MAX) pool.shift()
    const a = Math.random() * Math.PI * 2
    const s = speed * (0.4 + Math.random() * 0.9)
    pool.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 0.6,
      life: 0,
      maxLife: 34 + Math.random() * 26,
      size: 1.5 + Math.random() * 2.5,
      color,
    })
  }
}

export function step(pool: Particle[], gravity = 0.06): void {
  for (let i = pool.length - 1; i >= 0; i--) {
    const p = pool[i]
    p.life++
    p.x += p.vx
    p.y += p.vy
    p.vy += gravity
    if (p.life >= p.maxLife) pool.splice(i, 1)
  }
}

export function draw(ctx: CanvasRenderingContext2D, pool: Particle[]): void {
  for (const p of pool) {
    const a = 1 - p.life / p.maxLife
    ctx.globalAlpha = Math.max(0, a)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * a + 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

export interface Popup {
  x: number
  y: number
  text: string
  life: number
}

export function popup(pool: Popup[], x: number, y: number, text: string): void {
  if (pool.length > 12) pool.shift()
  pool.push({ x, y, text, life: 0 })
}

export function stepPopups(pool: Popup[]): void {
  for (let i = pool.length - 1; i >= 0; i--) {
    pool[i].life++
    pool[i].y -= 0.7
    if (pool[i].life > 60) pool.splice(i, 1)
  }
}

export function drawPopups(ctx: CanvasRenderingContext2D, pool: Popup[]): void {
  ctx.save()
  ctx.font = "bold 13px system-ui, sans-serif"
  ctx.textAlign = "center"
  for (const p of pool) {
    ctx.globalAlpha = Math.max(0, 1 - p.life / 60)
    ctx.fillStyle = "#fde68a"
    ctx.fillText(p.text, p.x, p.y)
  }
  ctx.restore()
  ctx.globalAlpha = 1
}
