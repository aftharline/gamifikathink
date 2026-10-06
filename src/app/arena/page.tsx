"use client"

export const dynamic = "force-dynamic"

import { useCallback, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { BackgroundFX } from "@/components/background-fx"
import { TutorialTour } from "@/components/tutorial-tour"

export default function ArenaPage() {
  const [subject, setSubject] = useState("Matematika")
  const [level, setLevel] = useState("SMA")
  const [resetSignal, setResetSignal] = useState(0)
  const [hasMessages, setHasMessages] = useState(false)

  const handleMessagesChange = useCallback((count: number) => {
    setHasMessages(count > 0)
  }, [])

  const handleSelect = (newSubject: string, newLevel: string) => {
    if (newSubject === subject && newLevel === level) return
    // ponytail: percakapan milik mapel lama; buang dengan konfirmasi
    if (hasMessages && !window.confirm("Ganti mapel? Percakapan ini akan dibuang.")) return
    setSubject(newSubject)
    setLevel(newLevel)
    setResetSignal((s) => s + 1)
  }

  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar
        level={level}
        subject={subject}
        onSelect={handleSelect}
      />
      <main className="relative z-10 flex-1">
        <ChatInterface
          subject={subject}
          level={level}
          resetSignal={resetSignal}
          onMessagesChange={handleMessagesChange}
        />
      </main>
      <TutorialTour tour="arena" />
    </div>
  )
}
