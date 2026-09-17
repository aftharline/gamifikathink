"use client"

import Link from "next/link"
import { Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { sfx } from "@/lib/feedback"
import type { ArModel } from "@/lib/ar-catalog"

export function ArModelCard({ model }: { model: ArModel }) {
  return (
    <div className="glass group overflow-hidden rounded-2xl transition-all hover:border-[var(--border-strong)]">
      <Link
        href={`/ar/${model.id}`}
        onClick={() => sfx.click()}
        className="block"
        aria-label={`Buka ${model.title}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={model.poster}
          alt={model.title}
          loading="lazy"
          className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[var(--secondary)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">
            {model.subject}
          </span>
          {model.placeholderAssets && model.placeholderAssets.length > 0 && (
            <span
              title={`Aset sementara (${model.placeholderAssets.join(", ")}) — akan diganti aset pribadi`}
              className="rounded-md bg-amber-500/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-amber-300"
            >
              Aset sementara
            </span>
          )}
        </div>
        <h3 className="mt-2 font-sans text-base font-bold text-[var(--text-primary)]">
          {model.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">
          {model.description}
        </p>
        <Link href={`/ar/${model.id}`} onClick={() => sfx.click()}>
          <Button className="mt-3 w-full gap-2" size="sm">
            <Scan className="h-4 w-4" />
            Buka & Lihat di AR
          </Button>
        </Link>
      </div>
    </div>
  )
}
