"use client"

import { useRef, useState } from "react"
import { ImagePlus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageSelect: (base64: string) => void
  onImageRemove: () => void
  imagePreview: string | null
}

export function ImageUpload({ onImageSelect, onImageRemove, imagePreview }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        onImageSelect(result)
        setLoading(false)
      }
      reader.readAsDataURL(file)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
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
          className="h-11 w-11 text-[var(--text-muted)] hover:text-[var(--accent)]"
        >
          <ImagePlus className="h-5 w-5" />
        </Button>
      )}
    </div>
  )
}
