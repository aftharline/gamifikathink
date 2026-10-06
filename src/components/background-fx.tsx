"use client"

export function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Grid */}
      <div className="bg-grid absolute inset-0 opacity-60 dark:opacity-100" />

      {/* Glow orbs */}
      <div className="animate-float-orb absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-teal-500/10 blur-3xl dark:bg-teal-500/20" />
      <div
        className="animate-float-orb absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-300/20"
        style={{ animationDelay: "-4s" }}
      />
      <div
        className="animate-float-orb absolute left-1/3 top-2/3 h-72 w-72 rounded-full bg-amber-400/5 blur-3xl dark:bg-amber-400/10"
        style={{ animationDelay: "-2s" }}
      />

      {/* Aurora: gradient bergerak sangat subtil (GPU-only) */}
      <div
        className="animate-aurora absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "linear-gradient(120deg, transparent 20%, rgba(45,212,191,0.5) 40%, transparent 60%, rgba(246,196,83,0.4) 80%, transparent 80%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Subtle scanline (decorative, very low opacity) */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(45,212,191,0.6) 3px, rgba(45,212,191,0.6) 4px)",
        }}
      />
    </div>
  )
}
