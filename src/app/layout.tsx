import type { Metadata, Viewport } from "next"
import { Inter, Instrument_Serif } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

// Self-hosted via next/font: nol request eksternal, nol layout shift
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-instrument-serif",
})

export const metadata: Metadata = {
  title: "GAMIFIKATHINK: Belajar Jadi Game | Powered by RINTIS NALAR Learning Center",
  description:
    "Arena Belajar AI 4 mode, 18 Lab Visual Interaktif dengan maskot Robo, Boss Battle, Kartu Mantra SRS, AR Lab 3D, Materi PDF ke Podcast, dan Leaderboard untuk 14 mapel SD-SMA. Soal teks via ChatAnywhere, foto soal via Gemini Vision. Powered by RINTIS NALAR Learning Center.",
  keywords: [
    "belajar gamifikasi",
    "tutor AI Indonesia",
    "lab virtual interaktif",
    "simulasi fisika",
    "kuis UTBK",
    "flashcard",
    "AR edukasi",
  ],
  applicationName: "GAMIFIKATHINK",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "GAMIFIKATHINK: Belajar Jadi Game Epik",
    description:
      "18 lab visual, 14 mapel, 4 mode tutor AI, Boss Battle, AR 3D, dan podcast materi. Gratis, langsung main.",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary",
    title: "GAMIFIKATHINK: Belajar Jadi Game Epik",
    description: "18 lab visual, 14 mapel, 4 mode tutor AI. Gratis, langsung main.",
  },
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
      <body className={`antialiased ${inter.variable} ${instrumentSerif.variable}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
