"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { BackgroundFX } from "@/components/background-fx"

export default function ArenaPage() {
  const [subject, setSubject] = useState("Matematika")
  const [level, setLevel] = useState("SMA")

  const handleSelect = (newSubject: string, newLevel: string) => {
    setSubject(newSubject)
    setLevel(newLevel)
  }

  return (
    <div className="relative flex h-[100dvh] overflow-hidden">
      <BackgroundFX />
      <Sidebar
        userEmail="Warrior"
        level={level}
        subject={subject}
        onSelect={handleSelect}
      />
      <main className="relative z-10 flex-1">
        <ChatInterface subject={subject} level={level} />
      </main>
    </div>
  )
}
