import type { Metadata, Viewport } from "next"
import { Providers } from "@/components/providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "GAMIFIKATHINK — Belajar Jadi Game",
  description: "Ubah soal pelajaran jadi skenario game epik dengan AI",
  applicationName: "GAMIFIKATHINK",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "GAMIFIKATHINK",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2faf8" },
    { media: "(prefers-color-scheme: dark)", color: "#031312" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      className="dark"
      suppressHydrationWarning
    >
      <head />
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
