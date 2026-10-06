"use client"

import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onImageSelect: (base64: string) => void
  onImageRemove: () => void
  imagePreview: string | null
}

const MAX_IMAGE_MB = 4

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = () => reject(new Error("read-failed"))
    reader.readAsDataURL(file)
  })
}

export function ImageUpload({ onImageSelect, onImageRemove, imagePreview }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [dragging, setDragging] = useState(false)

  const handleFiles = async (files?: FileList | File[] | null) => {
    const file = files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar.")
      return
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Ukuran gambar maksimal ${MAX_IMAGE_MB}MB.`)
      return
    }

    setLoading(true)
    try {
      onImageSelect(await readAsDataURL(file))
    } catch {
      toast.error("Gagal membaca gambar.")
    } finally {
      setLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void handleFiles(e.target.files)
  }

  return (
    <div
      className="flex items-center gap-2"
      data-tour="arena-image"
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        void handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imagePreview}
            alt="Preview soal"
            className="glass h-16 w-16 rounded-xl border-[var(--border-strong)] object-cover"
          />
          <button
            type="button"
            onClick={onImageRemove}
            className="absolute -right-2 -top-2 rounded-full bg-[var(--danger)] p-0.5 text-white shadow-lg"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className={cn(
            "h-11 w-11 text-[var(--text-muted)] hover:text-[var(--accent)]",
            dragging && "border border-dashed border-[var(--accent)] text-[var(--accent)]"
          )}
          title="Upload atau drag & drop gambar soal"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
