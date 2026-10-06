"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import {
  BookOpen,
  Boxes,
  Layers,
  LogIn,
  LogOut,
  ScrollText,
  Swords,
  Skull,
  X,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
  Brain,
  Trophy,
  FileText,
  FlaskConical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { SUBJECTS, LEVELS } from "@/lib/subjects"
import { createClient } from "@/lib/supabase/client"
import { ThemeToggle } from "@/components/theme-toggle"
import { PwaInstallButton } from "@/components/pwa-install-button"
import { XP_EVENT, type XpEventDetail } from "@/lib/xp-events"
import { xpNeededForLevel } from "@/lib/xp"
import { OPEN_SIDEBAR_EVENT } from "@/components/mobile-menu-trigger"

interface SidebarProps {
  userEmail?: string
  level?: string
  subject?: string
  chatHistory?: { id: string; title: string }[]
  onSelect?: (subject: string, level: string) => void
}

export function Sidebar({
  userEmail,
  level: currentLevel,
  subject: currentSubject,
  chatHistory = [],
  onSelect,
}: SidebarProps) {
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [xp, setXp] = useState(0)
  const [profileLevel, setProfileLevel] = useState(1)
  const [sessionName, setSessionName] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setLoggedIn(true)
          setSessionName(
            user.user_metadata?.full_name ||
            user.user_metadata?.display_name ||
            user.email ||
            "Warrior"
          )
          const { data } = await supabase
            .from("profiles")
            .select("xp, level, display_name")
            .eq("id", user.id)
            .single()
          if (data?.xp != null) setXp(data.xp)
          if (data?.level != null) setProfileLevel(data.level)
          if (data?.display_name) setSessionName(data.display_name)
        } else {
          setLoggedIn(false)
          setSessionName(null)
        }
      } catch {
        // silent (tamu / offline)
      }
    }
    loadProfile()

    const onXpEvent = (e: Event) => {
      const detail = (e as CustomEvent<XpEventDetail>).detail
      setXp(detail.xp)
      setProfileLevel(detail.level)
    }
    window.addEventListener(XP_EVENT, onXpEvent)
    const onOpenSidebar = () => setOpen(true)
    window.addEventListener(OPEN_SIDEBAR_EVENT, onOpenSidebar)
    return () => {
      window.removeEventListener(XP_EVENT, onXpEvent)
      window.removeEventListener(OPEN_SIDEBAR_EVENT, onOpenSidebar)
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const menuItems = [
    { href: "/arena", label: "Arena Belajar", icon: Swords },
    { href: "/kuis", label: "Boss Battle", icon: Skull },
    { href: "/kartu", label: "Kartu Mantra", icon: Layers },
    { href: "/materi", label: "Materi + Podcast", icon: FileText },
    { href: "/lab", label: "Lab Interaktif", icon: FlaskConical },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/otak", label: "Brain Games", icon: Brain },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/buku-mantra", label: "Buku Mantra", icon: ScrollText },
    { href: "/ar", label: "AR Lab", icon: Boxes },
  ]

  const levelLabel = currentLevel || "…"
  const xpNeeded = xpNeededForLevel(profileLevel)
  const xpPct =
    Number.isFinite(xp) && xpNeeded > 0
      ? Math.min(100, Math.round((xp / xpNeeded) * 100))
      : 0

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "glass fixed inset-y-0 left-0 z-40 flex flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-all duration-300 lg:static lg:translate-x-0",
          open ? "w-[85vw] max-w-sm translate-x-0" : collapsed ? "w-0 -translate-x-full lg:w-16 lg:translate-x-0" : "w-72 -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center border-b border-[var(--border)]", collapsed ? "lg:flex-col lg:gap-3 lg:py-3" : "justify-between p-4")}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="GAMIFIKATHINK"
                width={36}
                height={36}
                className="glow-drop-cyan h-9 w-9"
              />
              <span className="glow-text-cyan font-sans text-sm font-bold tracking-wide text-[var(--text-primary)]">
                GAMIFIKATHINK
              </span>
            </div>
          )}
          {collapsed && (
            <>
              <Image
                src="/logo.svg"
                alt="GAMIFIKATHINK"
                width={32}
                height={32}
                className="glow-drop-cyan h-8 w-8"
              />
              <button
                onClick={() => setCollapsed(false)}
                title="Perluas"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-white/5 hover:text-[var(--accent)]"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </button>
            </>
          )}
          {!collapsed && (
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setOpen(false)
                  setCollapsed(!collapsed)
                }}
                className="hidden h-8 w-8 text-[var(--text-muted)] hover:text-[var(--accent)] lg:flex"
              >
                {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 text-[var(--text-muted)] lg:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {/* User info */}
            <div className="border-b border-[var(--border)] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-gradient-jarvis p-[2px]">
                  <Avatar className="h-9 w-9 bg-[var(--surface-2)]">
                    <AvatarFallback className="bg-[var(--surface-2)] text-xs text-[var(--accent)]">
                      {(sessionName || userEmail || "W").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--text-primary)]">
                    {sessionName || userEmail || "Tamu"}
                    {!loggedIn && (
                      <span className="ml-1.5 rounded-md bg-[var(--secondary)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
                        Tamu
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Level {profileLevel} • {levelLabel}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--secondary)]">
                      <div
                        className="h-full rounded-full bg-gradient-jarvis transition-all duration-500"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {xp}/{xpNeededForLevel(profileLevel)} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
              <p className="mb-2 px-2 text-xs font-semibold text-[var(--text-secondary)]">
                Menu
              </p>
              {menuItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => {
                    router.push(item.href)
                    setOpen(false)
                  }}
                  className={cn(
                    "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    pathname === item.href
                      ? "glass border-l-2 border-l-[var(--accent)] text-[var(--accent)]"
                      : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                  )}
                >
                  <item.icon
                    className={cn("h-4 w-4", pathname === item.href && "glow-text-cyan")}
                  />
                  {item.label}
                </button>
              ))}

              <Separator className="my-4 bg-[var(--border)]" />

              {/* Level & Subject selector */}
              {pathname === "/arena" && onSelect && (
                <div data-tour="subject-picker">
                  <p className="mb-2 px-2 text-xs font-semibold text-[var(--text-secondary)]">
                    Kelas & Mapel
                  </p>
                  <div className="space-y-1">
                    <p className="px-2 text-xs text-[var(--text-muted)]">Jenjang</p>
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        onClick={() => onSelect(currentSubject || "Matematika", lvl.value)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          currentLevel === lvl.value
                            ? "glass border-l-2 border-l-[var(--accent)] text-[var(--accent)]"
                            : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <lvl.icon className="h-3.5 w-3.5" style={{ color: lvl.color }} />
                          {lvl.label}
                        </span>
                        {currentLevel === lvl.value && <ChevronRight className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 space-y-1">
                    <p className="px-2 text-xs text-[var(--text-muted)]">Mata Pelajaran</p>
                    {SUBJECTS.map((sub) => (
                      <button
                        key={sub.value}
                        onClick={() => onSelect(sub.value, currentLevel || "SMA")}
                        className={cn(
                          "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                          currentSubject === sub.value
                            ? "glass border-l-2 border-l-[var(--accent)] text-[var(--accent)]"
                            : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <sub.icon className="h-3.5 w-3.5" style={{ color: sub.color }} />
                          {sub.label}
                        </span>
                        {currentSubject === sub.value && <ChevronRight className="h-3 w-3" />}
                      </button>
                    ))}
                  </div>

                  <Separator className="my-4 bg-[var(--border)]" />
                </div>
              )}

              {/* Chat history */}
              {chatHistory.length > 0 && (
                <>
                  <p className="mb-2 px-2 text-xs font-semibold text-[var(--text-secondary)]">
                    Riwayat
                  </p>
                  {chatHistory.map((chat) => (
                    <button
                      key={chat.id}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-[var(--text-primary)]"
                    >
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                  ))}
                </>
              )}
            </nav>

            {/* Footer */}
            <div className="border-t border-[var(--border)] p-3">
              <div className="mb-2 flex items-center justify-between px-2">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Online
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <PwaInstallButton variant="sidebar" className="mb-1" />
              {loggedIn ? (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-[var(--text-muted)] hover:text-[var(--danger)]"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-[var(--accent)]"
                  onClick={() => {
                    router.push("/login")
                    setOpen(false)
                  }}
                >
                  <LogIn className="h-4 w-4" />
                  Masuk / Daftar
                </Button>
              )}
            </div>
          </>
        )}

        {collapsed && (
          <div className="flex flex-1 flex-col items-center gap-2 p-2">
            {menuItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                title={item.label}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                  pathname === item.href
                    ? "glass text-[var(--accent)]"
                    : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                )}
              >
                <item.icon className="h-4 w-4" />
              </button>
            ))}
            <ThemeToggle className="mt-2" />
            <PwaInstallButton variant="icon" />
            {loggedIn ? (
              <button
                onClick={handleLogout}
                title="Keluar"
                className="mt-auto flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-red-500/10 hover:text-[var(--danger)]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => router.push("/login")}
                title="Masuk / Daftar"
                className="mt-auto flex h-10 w-10 items-center justify-center rounded-xl text-[var(--accent)] hover:bg-white/5"
              >
                <LogIn className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  )
}
