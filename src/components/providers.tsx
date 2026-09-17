"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { PwaRegister } from "@/components/pwa-register"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <PwaRegister />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "var(--surface-2)",
            color: "var(--text-primary)",
            border: "1px solid var(--border)",
            backdropFilter: "blur(12px)",
          },
        }}
      />
    </ThemeProvider>
  )
}
