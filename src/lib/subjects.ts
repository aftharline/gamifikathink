import type { LucideIcon } from "lucide-react"
import {
  Sigma,
  Languages,
  Zap,
  FlaskConical,
  Dna,
  BookOpen,
  Coins,
  Globe2,
  Landmark,
  Users,
  Scale,
  Microscope,
  Map as MapIcon,
  Cpu,
  School,
  GraduationCap,
} from "lucide-react"

export interface SubjectMeta {
  value: string
  label: string
  icon: LucideIcon
  color: string
}

export const SUBJECTS: SubjectMeta[] = [
  { value: "Matematika", label: "Matematika", icon: Sigma, color: "#38bdf8" },
  { value: "Bahasa Inggris", label: "Bahasa Inggris", icon: Languages, color: "#a78bfa" },
  { value: "Fisika", label: "Fisika", icon: Zap, color: "#facc15" },
  { value: "Kimia", label: "Kimia", icon: FlaskConical, color: "#4ade80" },
  { value: "Biologi", label: "Biologi", icon: Dna, color: "#fb7185" },
  { value: "Bahasa Indonesia", label: "Bahasa Indonesia", icon: BookOpen, color: "#f97316" },
  { value: "Ekonomi", label: "Ekonomi", icon: Coins, color: "#facc15" },
  { value: "Geografi", label: "Geografi", icon: Globe2, color: "#22d3ee" },
  { value: "Sejarah", label: "Sejarah", icon: Landmark, color: "#d6a35c" },
  { value: "Sosiologi", label: "Sosiologi", icon: Users, color: "#f472b6" },
  { value: "PPKn", label: "PPKn", icon: Scale, color: "#ef4444" },
  { value: "IPA", label: "IPA", icon: Microscope, color: "#34d399" },
  { value: "IPS", label: "IPS", icon: MapIcon, color: "#93c5fd" },
  { value: "Informatika", label: "Informatika", icon: Cpu, color: "#22d3ee" },
]

export const LEVELS: SubjectMeta[] = [
  { value: "SD", label: "SD", icon: School, color: "#4ade80" },
  { value: "SMP", label: "SMP", icon: BookOpen, color: "#38bdf8" },
  { value: "SMA", label: "SMA", icon: GraduationCap, color: "#a78bfa" },
]

const subjectMap = new Map(SUBJECTS.map((s) => [s.value, s]))

export function getSubject(value: string): SubjectMeta {
  return subjectMap.get(value) ?? SUBJECTS[0]
}

export function getLevel(value: string): SubjectMeta {
  return LEVELS.find((l) => l.value === value) ?? LEVELS[1]
}
