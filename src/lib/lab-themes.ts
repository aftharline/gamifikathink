// Tema visual per lab: latar + aksen (neon gelap, varian hutan/pasar/angkasa)

export interface LabTheme {
  /** gradient scene */
  sky: [string, string]
  accent: string
  soft: string
}

const DEFAULT: LabTheme = { sky: ["#0c1a2e", "#0a1420"], accent: "#2dd4bf", soft: "rgba(45,212,191,.12)" }

const THEMES: Record<string, LabTheme> = {
  proyektil: { sky: ["#0a1628", "#0a1420"], accent: "#2dd4bf", soft: "rgba(45,212,191,.12)" },
  bandul: { sky: ["#101a30", "#0a1420"], accent: "#2dd4bf", soft: "rgba(45,212,191,.12)" },
  h2o: { sky: ["#0b2233", "#0a1420"], accent: "#38bdf8", soft: "rgba(56,189,248,.12)" },
  grafik: { sky: ["#0c1a2e", "#0a1420"], accent: "#2dd4bf", soft: "rgba(45,212,191,.12)" },
  sel: { sky: ["#0a2420", "#0a1420"], accent: "#4ade80", soft: "rgba(74,222,128,.12)" },
  "otak-visual": { sky: ["#1a1430", "#0a1420"], accent: "#a78bfa", soft: "rgba(167,139,250,.14)" },
  pecahan: { sky: ["#2a1608", "#140b06"], accent: "#fb923c", soft: "rgba(251,146,60,.14)" },
  katrol: { sky: ["#101a30", "#0a1420"], accent: "#facc15", soft: "rgba(250,204,21,.12)" },
  "ph-mixer": { sky: ["#1c1030", "#0d0a18"], accent: "#e879f9", soft: "rgba(232,121,249,.14)" },
  "rantai-makanan": { sky: ["#0a2420", "#081410"], accent: "#4ade80", soft: "rgba(74,222,128,.14)" },
  "word-drop": { sky: ["#1a1430", "#0d0a1a"], accent: "#a78bfa", soft: "rgba(167,139,250,.14)" },
  imbuhan: { sky: ["#2a1408", "#140b06"], accent: "#fb923c", soft: "rgba(251,146,60,.14)" },
  pasar: { sky: ["#1c1a0a", "#12100a"], accent: "#facc15", soft: "rgba(250,204,21,.14)" },
  "peta-lapisan": { sky: ["#0a2426", "#0a1414"], accent: "#34d399", soft: "rgba(52,211,153,.14)" },
  timeline: { sky: ["#241a0c", "#14100a"], accent: "#d6a35c", soft: "rgba(214,163,92,.16)" },
  garuda: { sky: ["#260f0f", "#140a0a"], accent: "#ef4444", soft: "rgba(239,68,68,.14)" },
  magnet: { sky: ["#101a30", "#0c0f1e"], accent: "#60a5fa", soft: "rgba(96,165,250,.14)" },
  sorting: { sky: ["#0a1e2e", "#0a1420"], accent: "#22d3ee", soft: "rgba(34,211,238,.14)" },
}

export function getTheme(slug: string): LabTheme {
  return THEMES[slug] ?? DEFAULT
}
