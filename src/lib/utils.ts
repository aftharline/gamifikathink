import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ponytail: remark-math hanya paham $...$, normalisasi delimiter LaTeX klasik
export function normalizeMathDelimiters(content: string): string {
  return content
    .replace(/\\\(([\s\S]+?)\\\)/g, (_, m: string) => `$${m}$`)
    .replace(/\\\[([\s\S]+?)\\\]/g, (_, m: string) => `$$\n${m}\n$$`)
}
