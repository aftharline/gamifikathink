"use client"

// Figur Garuda Pancasila heraldik (SVG murni, simetri cermin sempurna).
// Semua elemen kanan dirender via <g transform="translate(360,0) scale(-1,1)"> dari sisi kiri.

const GOLD = "#d4a017"
const GOLD_LT = "#f6c453"
const RED = "#b91c1c"
const DARK = "#3b2f1a"
const CREAM = "#f8ead0"

// Bulu sayap satu sisi (kiri): 3 tingkat, tiap tingkat deretan bulu meruncing ke luar.
function WingLeft({ active }: { active: boolean }) {
  const tiers = [
    { y: 96, n: 7, len: 118, w: 13, o: 0.95 },
    { y: 122, n: 6, len: 96, w: 14, o: 0.9 },
    { y: 146, n: 5, len: 72, w: 15, o: 0.85 },
  ]
  return (
    <g>
      {tiers.map((t, ti) => (
        <g key={ti}>
          {Array.from({ length: t.n }).map((_, i) => {
            const spread = (i / Math.max(1, t.n - 1) - 0.5) * 56
            const x0 = 128
            const y0 = t.y + spread * 0.35
            const x1 = x0 - t.len * (0.82 + i * 0.03)
            const y1 = y0 - 26 + i * 9
            return (
              <path
                key={i}
                d={`M ${x0} ${y0} Q ${x0 - t.len * 0.5} ${y0 - 16} ${x1} ${y1} Q ${x0 - t.len * 0.45} ${y0 + 4} ${x0} ${y0 + t.w / 2} Z`}
                fill={active ? GOLD_LT : GOLD}
                fillOpacity={t.o}
                stroke={DARK}
                strokeWidth="1.4"
              />
            )
          })}
          {/* pangkal tingkat */}
          <path
            d={`M 128 ${t.y - 20} Q 70 ${t.y - 14} 30 ${t.y - 6} L 30 ${t.y + 12} Q 80 ${t.y + 10} 128 ${t.y + 16} Z`}
            fill={RED}
            fillOpacity="0.85"
            stroke={DARK}
            strokeWidth="1.4"
          />
        </g>
      ))}
    </g>
  )
}

// Ekor: 8 helai kipas.
function Tail() {
  return (
    <g>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 7 - 0.5) * 64
        const x = 180 + Math.sin((a * Math.PI) / 180) * 34
        return (
          <path
            key={i}
            d={`M 180 196 L ${x - 7} ${196 + 34} L ${x + 7} ${196 + 34} Z`}
            fill={i % 2 ? GOLD : GOLD_LT}
            stroke={DARK}
            strokeWidth="1.2"
          />
        )
      })}
    </g>
  )
}

// Perisai dada dengan 5 ruang sila (klik per ruang).
function Shield({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  // 5 ruang: bintang atas, rantai kiri-atas, beringin kanan-atas, banteng kiri-bawah, padi kanan-bawah
  const cells = [
    { i: 0, d: "M 180 96 L 196 118 L 164 118 Z" }, // segitiga atas (bintang)
    { i: 1, d: "M 164 118 L 180 118 L 180 148 L 152 148 L 152 128 Z" },
    { i: 2, d: "M 196 118 L 208 118 L 208 148 L 180 148 L 180 118 Z" },
    { i: 3, d: "M 152 148 L 180 148 L 180 172 L 158 172 Z" },
    { i: 4, d: "M 180 148 L 208 148 L 202 172 L 180 172 Z" },
  ]
  return (
    <g>
      <path
        d="M 148 92 L 212 92 L 212 150 L 180 180 L 148 150 Z"
        fill="#0f172a"
        stroke={GOLD_LT}
        strokeWidth="3"
      />
      {cells.map((c) => (
        <path
          key={c.i}
          d={c.d}
          fill={active === c.i ? "rgba(246,196,83,.45)" : "rgba(246,196,83,.10)"}
          stroke={GOLD}
          strokeWidth="1"
          className="cursor-pointer"
          onClick={() => onPick(c.i)}
        />
      ))}
      {/* bintang sila 1 */}
      <path
        d="M180 100 l2.2 4.6 5 0.6 -3.7 3.4 1 4.9 -4.5 -2.5 -4.5 2.5 1 -4.9 -3.7 -3.4 5 -0.6 z"
        fill={GOLD_LT}
      />
      {/* rantai sila 2: mata rantai */}
      <g stroke={CREAM} strokeWidth="1.6" fill="none">
        <circle cx="162" cy="130" r="3.4" />
        <circle cx="170" cy="136" r="3.4" />
        <circle cx="162" cy="142" r="3.4" />
      </g>
      {/* beringin sila 3 */}
      <g fill="#4ade80">
        <path d="M194 122 L200 132 L188 132 Z" />
        <rect x="193" y="132" width="3" height="7" />
      </g>
      {/* banteng sila 4 */}
      <g fill={CREAM}>
        <ellipse cx="166" cy="160" rx="7" ry="6" />
        <path d="M160 156 Q154 150 156 144 Q160 148 162 152 Z" />
        <path d="M172 156 Q178 150 176 144 Q172 148 170 152 Z" />
      </g>
      {/* padi kapas sila 5 */}
      <g stroke={GOLD_LT} strokeWidth="1.4">
        <line x1="190" y1="166" x2="190" y2="152" />
        <line x1="186" y1="158" x2="190" y2="156" />
        <line x1="194" y1="158" x2="190" y2="156" />
        <circle cx="197" cy="160" r="2.4" fill={CREAM} stroke="none" />
      </g>
    </g>
  )
}

export function GarudaFigure({ activeSila, onPickSila }: { activeSila: number; onPickSila: (i: number) => void }) {
  const glow = activeSila >= 0
  return (
    <svg viewBox="0 0 360 236" className="block w-full" role="img" aria-label="Garuda Pancasila">
      <defs>
        <radialGradient id="garbg" cx="50%" cy="34%" r="80%">
          <stop offset="0%" stopColor="#2a1414" />
          <stop offset="100%" stopColor="#140a0a" />
        </radialGradient>
        <linearGradient id="goldg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LT} />
          <stop offset="100%" stopColor={GOLD} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="360" height="236" fill="url(#garbg)" />
      <ellipse cx="180" cy="120" rx="150" ry="100" fill="none" stroke="rgba(212,160,23,.25)" strokeWidth="1.5" strokeDasharray="8 6" />
      {/* sayap kiri + cermin kanan */}
      <WingLeft active={glow} />
      <g transform="translate(360,0) scale(-1,1)">
        <WingLeft active={glow} />
      </g>
      <Tail />
      {/* kaki + cakar mencengkeram pita */}
      {[0, 1].map((s) => {
        const x = s === 0 ? 152 : 208
        return (
          <g key={s}>
            <rect x={x - 6} y={186} width={12} height={16} rx={4} fill={GOLD} stroke={DARK} strokeWidth="1.4" />
            {[0, 1, 2].map((t) => (
              <path key={t} d={`M ${x - 6 + t * 6} 202 q -2 7 -7 9 q 7 2 10 -3 z`} fill={CREAM} stroke={DARK} strokeWidth="1" />
            ))}
          </g>
        )
      })}
      {/* badan */}
      <ellipse cx="180" cy="158" rx="34" ry="42" fill="url(#goldg)" stroke={DARK} strokeWidth="2" />
      <ellipse cx="180" cy="158" rx="22" ry="30" fill="none" stroke={DARK} strokeWidth="1" opacity="0.5" />
      {/* leher berlapis */}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M ${166 + i * 2} ${118 + i * 9} Q 180 ${112 + i * 9} ${194 - i * 2} ${118 + i * 9}`} fill="none" stroke={DARK} strokeWidth="1.4" opacity="0.6" />
      ))}
      {/* kepala */}
      <ellipse cx="180" cy="96" rx="24" ry="26" fill="url(#goldg)" stroke={DARK} strokeWidth="2" />
      {/* jambul mahkota 3 tingkat */}
      <path d="M 162 74 L 168 52 L 174 72 Z" fill={RED} stroke={DARK} strokeWidth="1.4" />
      <path d="M 172 71 L 180 44 L 188 71 Z" fill={RED} stroke={DARK} strokeWidth="1.4" />
      <path d="M 186 72 L 192 52 L 198 74 Z" fill={RED} stroke={DARK} strokeWidth="1.4" />
      <circle cx="180" cy="42" r="4" fill={GOLD_LT} stroke={DARK} strokeWidth="1.2" />
      {/* mata */}
      <ellipse cx="170" cy="94" rx="5" ry="6" fill="#fff" stroke={DARK} strokeWidth="1.2" />
      <ellipse cx="190" cy="94" rx="5" ry="6" fill="#fff" stroke={DARK} strokeWidth="1.2" />
      <circle cx="170" cy="95" r="2.2" fill="#111" />
      <circle cx="190" cy="95" r="2.2" fill="#111" />
      {/* paruh bengkok */}
      <path d="M 168 104 Q 180 112 196 104 L 190 116 Q 180 121 170 116 Z" fill="#f97316" stroke={DARK} strokeWidth="1.6" />
      <path d="M 190 106 Q 196 112 192 118" fill="none" stroke={DARK} strokeWidth="1.4" />
      <Shield active={activeSila} onPick={onPickSila} />
      {/* pita semboyan */}
      <path d="M 96 214 Q 180 200 264 214 L 264 226 Q 180 212 96 226 Z" fill={CREAM} stroke={DARK} strokeWidth="1.4" />
      <path d="M 96 214 L 84 210 L 88 220 L 84 230 L 96 226 Z" fill={RED} stroke={DARK} strokeWidth="1.2" />
      <path d="M 264 214 L 276 210 L 272 220 L 276 230 L 264 226 Z" fill={RED} stroke={DARK} strokeWidth="1.2" />
      <text x="180" y="222" textAnchor="middle" fontSize="9.5" fontWeight="black" letterSpacing="1" fill="#451a03">
        BHINNEKA TUNGGAL IKA
      </text>
    </svg>
  )
}

// Hitungan bulu bermakna 17-8-1945: 17 sayap, 8 ekor, 19 pangkal ekor, 45 leher.
export const GARUDA_COUNTS = [
  { label: "17 helai bulu tiap sayap", value: 17 },
  { label: "8 helai bulu ekor", value: 8 },
  { label: "19 helai pangkal ekor", value: 19 },
  { label: "45 helai bulu leher", value: 45 },
]
