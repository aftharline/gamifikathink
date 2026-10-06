"use client"

import { useState } from "react"

// ponytail: pdfjs dynamic import agar bundle awal tetap kecil
export async function extractPdfText(file: File): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfjs: any = await import("pdfjs-dist")
  if (pdfjs.GlobalWorkerOptions && !pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
  }
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const maxPages = Math.min(pdf.numPages, 10)
  const chunks: string[] = []
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const str = (content.items as Array<{ str?: string }>).map((it) => it.str ?? "").join(" ")
    chunks.push(str)
    if (chunks.join(" ").length > 50000) break
  }
  return chunks.join("\n\n").slice(0, 50000)
}

export function usePdfText() {
  const [loading, setLoading] = useState(false)
  const parse = async (file: File) => {
    setLoading(true)
    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        return await extractPdfText(file)
      }
      return await file.text()
    } finally {
      setLoading(false)
    }
  }
  return { parse, loading }
}
