"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LoginPage() {
  const router = useRouter()

  // Setelah auth dinonaktifkan, langsung ke arena
  useEffect(() => {
    router.push("/arena")
    router.refresh()
  }, [router])

  return null
}