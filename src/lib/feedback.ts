import confetti from "canvas-confetti"

const JARVIS_COLORS = ["#2dd4bf", "#14b8a6", "#f6c453", "#ffffff"]

export function celebrate() {
  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.7 },
    colors: JARVIS_COLORS,
    zIndex: 9999,
  })
}

export function levelUpCelebrate() {
  confetti({
    particleCount: 180,
    spread: 100,
    origin: { y: 0.6 },
    colors: JARVIS_COLORS,
    zIndex: 9999,
  })
  setTimeout(() => {
    confetti({
      particleCount: 100,
      angle: 60,
      spread: 70,
      origin: { x: 0, y: 0.8 },
      colors: ["#2dd4bf", "#ffffff"],
      zIndex: 9999,
    })
    confetti({
      particleCount: 100,
      angle: 120,
      spread: 70,
      origin: { x: 1, y: 0.8 },
      colors: ["#f6c453", "#14b8a6"],
      zIndex: 9999,
    })
  }, 250)
}

type AudioContextWithWebkit = typeof AudioContext & {
  webkitAudioContext?: typeof AudioContext
}

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as AudioContextWithWebkit).webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

function tone(
  freq: number,
  startDelay: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.04
) {
  const ctx = getCtx()
  if (!ctx) return
  const start = ctx.currentTime + startDelay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

export const sfx = {
  correct() {
    tone(880, 0, 0.12)
    tone(1318, 0.09, 0.18)
  },
  wrong() {
    tone(220, 0, 0.25, "sawtooth")
    tone(174, 0.12, 0.32, "sawtooth")
  },
  levelup() {
    tone(523, 0, 0.12)
    tone(659, 0.1, 0.12)
    tone(784, 0.2, 0.12)
    tone(1046, 0.3, 0.35)
  },
  win() {
    ;[523, 659, 784, 1046, 784, 1046].forEach((f, i) =>
      tone(f, i * 0.12, 0.16, "triangle")
    )
  },
  click() {
    tone(600, 0, 0.05, "square", 0.02)
  },
  timer() {
    tone(440, 0, 0.08, "sine", 0.03)
  },
}
