"use client"

export type MascotMood = "happy" | "think" | "wow" | "sad" | "champ"

// Maskot robo-tutor SVG dengan 5 ekspresi (tanpa emoji, tanpa aset)
export function Mascot({ mood = "happy", size = 44 }: { mood?: MascotMood; size?: number }) {
  const mouth =
    mood === "happy" ? <path d="M17 26 q7 6 14 0" stroke="#042f2e" strokeWidth="2.4" fill="none" strokeLinecap="round" /> :
    mood === "think" ? <path d="M18 27 h12" stroke="#042f2e" strokeWidth="2.4" strokeLinecap="round" /> :
    mood === "wow" ? <ellipse cx="24" cy="27" rx="4" ry="5" fill="#042f2e" /> :
    mood === "sad" ? <path d="M17 29 q7 -6 14 0" stroke="#042f2e" strokeWidth="2.4" fill="none" strokeLinecap="round" /> :
    <path d="M15 25 q9 9 18 0 q-9 3 -18 0" fill="#042f2e" />
  const eyes =
    mood === "think" ? (
      <>
        <circle cx="18" cy="18" r="3" fill="#042f2e" />
        <circle cx="30" cy="18" r="3" fill="#042f2e" />
        <rect x="31" y="8" width="10" height="7" rx="2" fill="#fbbf24" />
      </>
    ) : mood === "sad" ? (
      <>
        <path d="M14 17 l8 -2" stroke="#042f2e" strokeWidth="2" strokeLinecap="round" />
        <path d="M34 17 l-8 -2" stroke="#042f2e" strokeWidth="2" strokeLinecap="round" />
        <circle cx="18" cy="20" r="2.4" fill="#042f2e" />
        <circle cx="30" cy="20" r="2.4" fill="#042f2e" />
      </>
    ) : (
      <>
        <circle cx="18" cy="18" r={mood === "wow" ? 4 : 3} fill="#042f2e" />
        <circle cx="30" cy="18" r={mood === "wow" ? 4 : 3} fill="#042f2e" />
        <circle cx="19" cy="17" r="1" fill="#fff" />
        <circle cx="31" cy="17" r="1" fill="#fff" />
      </>
    )
  const extra =
    mood === "champ" ? <path d="M12 6 l2.5 5 5.5 0.8 -4 4 1 5.6 -5 -2.8 -5 2.8 1 -5.6 -4 -4 5.5 -0.8 z" fill="#fbbf24" transform="translate(12,-4) scale(.8)" /> :
    mood === "think" ? <g fill="#2dd4bf"><circle cx="40" cy="12" r="2" /><circle cx="44" cy="18" r="1.5" /></g> :
    null
  return (
    <svg width={size} height={size} viewBox="0 0 48 40" className="fx-float shrink-0" role="img" aria-label={`maskot ${mood}`}>
      <rect x="6" y="4" width="8" height="5" rx="2.5" fill="#2dd4bf" />
      <rect x="34" y="4" width="8" height="5" rx="2.5" fill="#2dd4bf" />
      <rect x="10" y="8" width="28" height="26" rx="10" fill="#5eead4" stroke="#0f766e" strokeWidth="2" />
      <rect x="10" y="8" width="28" height="26" rx="10" fill="url(#mg)" opacity="0.35" />
      <defs>
        <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {eyes}
      {mouth}
      {mood === "wow" && <path d="M8 30 q-4 4 -2 8 M40 30 q4 4 2 8" stroke="#2dd4bf" strokeWidth="2" fill="none" strokeLinecap="round" />}
      {extra}
    </svg>
  )
}
