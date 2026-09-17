"use client"

import { useState } from "react"
import { Check, Download, Share, Smartphone } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePwaInstall } from "@/hooks/use-pwa-install"
import { cn } from "@/lib/utils"

interface PwaInstallButtonProps {
  variant?: "primary" | "sidebar" | "icon"
  className?: string
}

export function PwaInstallButton({
  variant = "primary",
  className,
}: PwaInstallButtonProps) {
  const { canInstall, isInstalled, isIOS, promptInstall } = usePwaInstall()
  const [helpOpen, setHelpOpen] = useState(false)

  if (isInstalled) {
    if (variant === "icon") {
      return (
        <span
          title="Aplikasi sudah terinstall"
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl text-emerald-400",
            className
          )}
        >
          <Check className="h-4 w-4" />
        </span>
      )
    }
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-[var(--text-muted)]",
          className
        )}
      >
        <Check className="h-4 w-4 text-emerald-400" />
        Aplikasi terinstall
      </div>
    )
  }

  const handleClick = async () => {
    if (canInstall) {
      const outcome = await promptInstall()
      if (outcome === "accepted") {
        toast.success("Aplikasi sedang diinstall ke perangkat")
      } else if (outcome === "dismissed") {
        setHelpOpen(true)
      } else {
        setHelpOpen(true)
      }
    } else {
      setHelpOpen(true)
    }
  }

  const button =
    variant === "icon" ? (
      <button
        onClick={handleClick}
        title="Download / Install aplikasi"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-all hover:bg-white/5 hover:text-[var(--accent)]",
          className
        )}
      >
        <Download className="h-4 w-4" />
      </button>
    ) : variant === "sidebar" ? (
      <Button
        variant="ghost"
        onClick={handleClick}
        className={cn(
          "w-full justify-start gap-3 text-[var(--text-secondary)] hover:text-[var(--accent)]",
          className
        )}
      >
        <Download className="h-4 w-4" />
        Download Aplikasi
      </Button>
    ) : (
      <Button
        onClick={handleClick}
        variant="outline"
        className={cn(
          "glass h-10 rounded-xl px-6 text-sm font-medium sm:h-11",
          className
        )}
      >
        <Download className="h-4 w-4" />
        Download Aplikasi
      </Button>
    )

  return (
    <>
      {button}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="glass-strong max-w-md border-[var(--border)] bg-[var(--surface-2)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <Smartphone className="h-5 w-5 text-[var(--accent)]" />
              Install GAMIFIKATHINK
            </DialogTitle>
            <DialogDescription className="text-left text-[var(--text-secondary)]">
              Pasang aplikasi ke perangkat agar bisa dibuka cepat seperti
              aplikasi native, termasuk akses offline dasar.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-sm text-[var(--text-secondary)]">
            {isIOS ? (
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  Buka situs ini di <strong>Safari</strong>.
                </li>
                <li>
                  Ketuk tombol{" "}
                  <Share className="inline h-4 w-4" />{" "}
                  <strong>Share</strong> di toolbar bawah.
                </li>
                <li>
                  Pilih <strong>Add to Home Screen</strong> lalu{" "}
                  <strong>Add</strong>.
                </li>
              </ol>
            ) : (
              <ol className="list-decimal space-y-2 pl-5">
                <li>
                  <strong>Android / Chrome:</strong> ketuk menu{" "}
                  <strong>⋮ → Add to Home screen / Install app</strong>.
                </li>
                <li>
                  <strong>Desktop Chrome / Edge:</strong> klik ikon install di
                  address bar, atau menu{" "}
                  <strong>⋮ → Save and share → Install</strong>.
                </li>
                <li>
                  Jika tombol install belum muncul, pastikan kamu membuka situs
                  lewat <strong>HTTPS</strong> dan coba lagi.
                </li>
              </ol>
            )}
            <p className="rounded-lg bg-white/5 p-3 font-mono text-[11px] leading-relaxed text-[var(--text-muted)]">
              SYS.TIP // Setelah terinstall, aplikasi berjalan fullscreen
              standalone & halaman utama tetap bisa dibuka saat offline.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
