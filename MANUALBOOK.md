# MANUAL BOOK LENGKAP — GAMIFIKATHINK
### *Belajar Jadi Game Epik — Platform Edukasi Gamifikasi + AI + AR*

> **Versi Dokumen:** 1.0  
> **Tanggal:** 17 September 2026  
> **Platform:** Next.js 16.2.12 + Supabase + Vercel  
> **Tim:** GamifikaThink Dev  
> **Repositori:** `gamifikathink`

---

## 📑 DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Arsitektur & Teknologi](#2-arsitektur--teknologi)
3. [Persiapan & Instalasi](#3-persiapan--instalasi)
4. [Struktur Proyek](#4-struktur-proyek)
5. [Panduan Peran Pengguna](#5-panduan-peran-pengguna)
6. [Panduan Fitur Lengkap](#6-panduan-fitur-lengkap)
7. [Sistem Gamifikasi (XP & Level)](#7-sistem-gamifikasi-xp--level)
8. [Basis Data & API](#8-basis-data--api)
9. [Desain Visual — JARVIS Style](#9-desain-visual--jarvis-style)
10. [PWA & Offline](#10-pwa--offline)
11. [Troubleshooting & FAQ](#11-troubleshooting--faq)
12. [Roadmap & Pengembangan Lanjut](#12-roadmap--pengembangan-lanjut)
13. [Lampiran](#13-lampiran)
14. [Prompt Gambar & Penempatan](#14-prompt-gambar--penempatan)

---

## 1. PENDAHULUAN

### 1.1 Apa itu GAMIFIKATHINK?

**GAMIFIKATHINK** adalah platform web edukasi yang mengubah soal pelajaran (Matematika, Fisika, Kimia, Bahasa Inggris — jenjang SD/SMP/SMA) menjadi **skenario game epik** dengan bantuan **Dual AI Engine** dan **Augmented Reality (AR) 3D**. Tagline: *Ubah soal pelajaran jadi skenario game epik dengan AI* (`src/app/layout.tsx:6`).

Inspirasi nama: *Gamifikasi + Think*. Branding visual: **JARVIS HUD** ala Iron Man — glassy, neon cyan-teal (`#2dd4bf`), gelap-futuristik.

### 1.2 Tujuan

| Tujuan | Penjelasan |
|--------|------------|
| Motivasi belajar | Membuat latihan soal tidak membosankan dengan narasi ML/Roblox/Genshin |
| Pemahaman konsep | AI menjelaskan step-by-step sampai paham, bukan hanya jawaban |
| Visualisasi 3D | AR Lab memungkinkan siswa memutar, men-zoom, dan menempatkan model di meja nyata |
| Kompetisi sehat | Boss Battle + XP/Level + Combo menumbuhkan semangat bertanding |
| Akses mudah | PWA — install ke HP tanpa Play Store, tetap bisa buka offline |

### 1.3 Sasaran Pengguna

- **Siswa SD/SMP/SMA** — pengguna utama. Pilih mapel & jenjang, chat AI, lawan boss, eksplor AR, kumpulkan XP.
- **Guru / Orang Tua** — pantau engagement via Buku Mantra (riwayat chat).
- **Developer / Admin** — kelola katalog AR (`src/lib/ar-catalog.ts:66`), prompt AI, dan skema Supabase.

### 1.4 Keunggulan Kompetitif

- **Dual AI Engine** dengan fallback otomatis: `gemini-3.5-flash` (primary) → `gpt-3.5-turbo` via ChatAnywhere (fallback) — anti gagal total (`src/app/api/chat/route.ts:6-12`).
- **7 Model 3D + AR** siap pakai (GLB + USDZ + poster) + hotspot anotasi + kuis per model.
- **Gamifikasi terintegrasi penuh**: chat (+10 XP), quiz benar (+15 XP), boss defeated (+25 XP), misi AR (+10/+15/+20 XP).
- **100% PWA + Offline shell** dengan Service Worker caching terpisah untuk model 3D (`public/sw.js:1`).
- **Desain JARVIS premium** — bukan template sekolah generik.

> **🖼️ GAMBAR 1.1 — Cover / Hero (Letak: Halaman judul MANUAL BOOK, juga slide 1)**
> Prompt: `Futuristic JARVIS HUD hero for education app GAMIFIKATHINK, dark teal glassmorphism, arc reactor logo glowing cyan, holographic grid, 3D models floating (rubik cube, dragon, molecule), Indonesian students using phone AR, cinematic 16:9, ultra-detailed`
> Penempatan: Sampul manual book & slide pembuka. File: `docs/images/cover-hero.png` (buat folder `docs/images/` bila belum ada)

---

## 2. ARSITEKTUR & TEKNOLOGI

### 2.1 Stack Ringkas

| Lapisan | Teknologi | Versi | File Kunci |
|---------|-----------|-------|------------|
| Framework | Next.js (App Router) | 16.2.12 | `next.config.ts:1` |
| Bahasa | TypeScript | 5.x | `tsconfig.json` |
| UI | React 19.2.4 + Tailwind CSS v4 | - | `src/app/globals.css:1` |
| Komponen | Radix UI + shadcn-style | - | `src/components/ui/` |
| AI SDK | `ai` v7 + `@ai-sdk/google` + `@ai-sdk/openai` + `@ai-sdk/react` | - | `src/app/api/chat/route.ts:2`, `package.json:17-20` |
| 3D/AR | `@google/model-viewer` 4.3.1 + `three` 0.183.2 + USDZExporter | - | `src/components/ar-viewer.tsx:78` |
| DB & Auth | Supabase (Postgres + Auth + RLS) | 2.x | `supabase-schema.sql:1`, `supabase-gamification.sql:1` |
| Styling | KaTeX + react-markdown + remark/rehype | - | `package.json:36-46` |
| Feedback | canvas-confetti + Web Audio API | - | `src/lib/feedback.ts:1` |
| PWA | Service Worker vanilla + Web Manifest | - | `public/sw.js:1`, `src/app/manifest.ts:1` |
| Deploy | Vercel (optimized) | - | `next.config.ts:9` |

### 2.2 Diagram Arsitektur Tingkat Tinggi

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Browser   │ ───▶ │  Next.js App     │ ───▶ │  Supabase       │
│  (PWA + SW) │ ◀─── │  /arena /ar /kuis│ ◀─── │  auth + profiles│
└──────┬──────┘      │  /api/chat /quiz │      │  + chat_history │
       │             └────────┬─────────┘      └─────────────────┘
       │                      │
       │             ┌────────▼─────────┐
       │             │  AI Engines      │
       └────────────▶│  Gemini primary  │
                     │  ChatAnywhere    │
                     └──────────────────┘

AR Path:  <model-viewer> ──▶ .glb (semua) + .usdz (iOS Quick Look)
          Fallback: WebcamArViewer (three.js + getUserMedia) → src/components/webcam-ar-viewer.tsx
```

> **🖼️ GAMBAR 2.1 — Diagram Arsitektur (Letak: BAB 2, setelah tabel stack)**
> Prompt: `Clean software architecture diagram for GamifikaThink, boxes: Browser PWA, Next.js App Router, Supabase (Auth/Postgres), Gemini AI primary + fallback, AR model-viewer, arrows with labels, dark JARVIS theme with teal accents, vector, 16:9`
> Penempatan: `docs/images/architecture.png`

### 2.3 Alur Data Utama

1. **Chat Arena**: User ketik/foto soal → `ChatInterface` (`src/components/chat-interface.tsx:62`) kirim ke `/api/chat` → `streamText` Gemini (atau fallback) → streaming token ke UI → `onFinish` simpan ke `chat_history` + `grantXp(10)`.
2. **Boss Battle**: `/api/quiz` generate 5 soal via `generateObject` + `zod` → fallback ke `quiz-bank.ts` jika API key kosong/error → battle logic di `boss-battle.tsx:54` (HP, hearts, combo) → `grantXp` saat selesai.
3. **AR Lab**: Katalog statis `AR_MODELS` (`src/lib/ar-catalog.ts:66`) → `ar-viewer.tsx:238` render `<model-viewer>` → event `ar-status`/`progress`/`load` → misi XP via `useArMissions` + `grantXp`.

### 2.4 Keamanan

- Row Level Security (RLS) di Supabase: user hanya bisa baca/tulis data miliknya (`supabase-schema.sql:63-86`).
- `SECURITY DEFINER` hanya untuk `handle_new_user()` dan `add_xp()` — terisolasi `search_path = ''`.
- Tidak ada secret di client; `NEXT_PUBLIC_*` hanya anon key Supabase; API key AI di server-only env.

---

## 3. PERSIAPAN & INSTALASI

### 3.1 Prasyarat

- Node.js ≥ 20 (lihat `.nvmrc`)
- npm / pnpm / yarn
- Akun Supabase (gratis)
- API Key Google AI Studio (`GOOGLE_GENERATIVE_AI_API_KEY`) — wajib untuk primary
- API Key ChatAnywhere (`CHATANYWHERE_API_KEY`) — opsional (fallback)

### 3.2 Clone & Install

```bash
git clone <repo-url> gamifikathink
cd gamifikathink
npm install
```

### 3.3 Konfigurasi Environment

Salin `.env.example` menjadi `.env.local`:

```env
# Supabase - https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# AI - Primary (Gemini via Google AI Studio) - https://aistudio.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=AIza...

# AI - Fallback (ChatAnywhere / OpenAI compatible) - https://api.chatanywhere.tech
CHATANYWHERE_API_KEY=sk-...
CHATANYWHERE_BASE_URL=https://api.chatanywhere.tech/v1
```

> File referensi: `.env.example:1`

### 3.4 Setup Supabase

1. Buka **Supabase Dashboard > SQL Editor**.
2. Copy-paste seluruh isi `supabase-schema.sql` → **Run**. Ini membuat tabel `profiles`, `chat_history`, trigger `handle_new_user`, dan RLS policies.
3. Kemudian copy-paste `supabase-gamification.sql` → **Run**. Ini membuat RPC `add_xp(amount INTEGER)` untuk kenaikan level (`level * 100` XP).
4. Aktifkan **Authentication > Providers > Google** (opsional, bila ingin login Google) — atau biarkan anonim flow (saat ini `/login` redirect ke `/arena` tanpa auth gate: `src/app/login/page.tsx:6`).
5. Verifikasi:

```sql
select * from profiles limit 1;
select * from chat_history limit 1;
select public.add_xp(10); -- harus return xp, level, leveled_up
```

> **🖼️ GAMBAR 3.1 — Supabase SQL Editor (Letak: BAB 3.4, langkah setup DB)**
> Prompt: `Screenshot-style illustration of Supabase Dashboard SQL Editor with SQL code for creating profiles and chat_history tables, dark theme, highlighted Run button, realistic UI mockup, 16:9`
> Penempatan: `docs/images/supabase-setup.png`

### 3.5 Menjalankan Aplikasi

```bash
npm run dev      # dev mode http://localhost:3000
npm run build    # build production (wajib hijau sebelum deploy)
npm run start    # serve production (test MIME .glb/.usdz)
npm run lint
npm run typecheck
```

Verifikasi MIME & caching AR:

```bash
curl -I http://localhost:3000/models/kubus-prisma/model-v2.glb
# Harus: 200 + Content-Type: model/gltf-binary
curl -I http://localhost:3000/models/kubus-prisma/model-v2.usdz
# Harus: 200 + Content-Type: model/vnd.usdz+zip
```

Header `Cache-Control: public, max-age=31536000, immutable` untuk `/models/*` sudah dikonfigurasi di `next.config.ts:24`.

### 3.6 Deploy ke Vercel

1. Push ke GitHub → Import di Vercel → set env vars yang sama.
2. Pastikan **HTTPS** aktif (wajib untuk AR Quick Look & Scene Viewer).
3. Test di device nyata (Android Chrome + iOS Safari) — lihat matriks di `AR_PLAN.md:232`.

---

## 4. STRUKTUR PROYEK

```
gamifikathink/
├── public/
│   ├── logo.svg, sw.js, manifest.ts
│   ├── icons/ (192, 512, maskable, apple-touch)
│   └── models/<id>/  (7 folder, tiap folder: model-v2.glb + model-v2.usdz + poster-v2.*)
│       ├── kubus-prisma/  (Rubik 3x3 animasi, 1.2 MB)
│       ├── grammar-dragon/ (Dragon 5.97 MB, anim Take 001)
│       ├── ryuri/          (Spirit Companion 11 MB, 4 animasi)
│       ├── molekul-h2o/, magnet-batang/, bandul/, castle/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout + metadata + Providers
│   │   ├── globals.css          # Tokens JARVIS + glass + keyframes
│   │   ├── page.tsx             # Landing Page (hero, features, stats)
│   │   ├── arena/page.tsx       # Arena Belajar (state subject/level + Sidebar + ChatInterface)
│   │   ├── kuis/page.tsx        # Boss Battle setup + BossBattle component
│   │   ├── ar/page.tsx          # AR Lab katalog grid + filter subject
│   │   ├── ar/[id]/page.tsx     # AR Detail (viewer + missions + quiz + license)
│   │   ├── buku-mantra/page.tsx # History list + detail markdown + related AR
│   │   ├── login/page.tsx       # Redirect ke /arena (auth gate dimatikan)
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── api/chat/route.ts    # Dual AI streaming (Gemini primary → fallback)
│   │   └── api/quiz/route.ts    # Generate 5 soal via Gemini + fallback bank
│   │
│   ├── components/
│   │   ├── providers.tsx, background-fx.tsx, arc-reactor.tsx, theme-toggle.tsx
│   │   ├── sidebar.tsx          # HUD panel glass + XP bar + collapse + drawer
│   │   ├── chat-interface.tsx   # Header HUD + messages + quick chips + input deck
│   │   ├── chat-message.tsx     # Bubble user/AI + LED + markdown KaTeX
│   │   ├── boss-battle.tsx      # Logic battle 5 soal + timer + HP + combo + XP
│   │   ├── ar-viewer.tsx        # Wrapper <model-viewer> + hotspot + progress + AR modes
│   │   ├── ar-model-card.tsx    # Kartu katalog poster + badge
│   │   ├── ar-missions.tsx      # 3 misi XP + cooldown
│   │   ├── ar-quiz.tsx          # Sheet kuis per model
│   │   ├── webcam-ar-viewer.tsx # In-browser AR via kamera (fallback non-native)
│   │   └── ui/                  # button, card, dialog, etc.
│   │
│   ├── lib/
│   │   ├── ar-catalog.ts        # SINGLE SOURCE OF TRUTH katalog AR (7 models)
│   │   ├── quiz-bank.ts         # Bank soal fallback (24 soal, 4 mapel)
│   │   ├── xp.ts                # XP_REWARDS + levelFromXp()
│   │   ├── xp-events.ts         # grantXp() + XP_EVENT dispatch
│   │   ├── feedback.ts          # celebrate() + sfx (Web Audio)
│   │   ├── supabase/            # client, server, middleware
│   │   └── utils.ts             # cn()
│   │
│   ├── hooks/
│   │   └── use-ar-missions.ts   # Cooldown localStorage 24 jam
│   │
│   └── types/
│       └── model-viewer.d.ts    # JSX augmentasi untuk <model-viewer>
│
├── supabase-schema.sql          # Skema utama
├── supabase-gamification.sql    # RPC add_xp
├── AR_PLAN.md                   # Rencana & tracking AR
├── DESIGNREFACTOR.md            # Desain JARVIS spec
├── next.config.ts               # Headers MIME + cache
├── package.json
└── .env.example
```

> **🖼️ GAMBAR 4.1 — Struktur Folder (Letak: BAB 4, di atas tree)**
> Prompt: `Minimalist folder tree infographic for Next.js project, icons for app, components, lib, public/models, dark background with teal lines, clean vector, 4:3`
> Penempatan: `docs/images/folder-structure.png`

#### File Kunci yang WAJIB Dipahami Developer Baru

| File | Peran |
|------|-------|
| `src/lib/ar-catalog.ts:66` | Tambah/edit model AR cukup edit di sini — tidak perlu ubah komponen. Field `glb/usdz/poster/license/placeholderAssets/cameraTarget` sangat sensitif. |
| `src/app/api/chat/route.ts:14` | `getSystemPrompt()` — tone AI Game Master. Ubah struktur output markdown di sini. |
| `supabase-schema.sql:11` + `supabase-gamification.sql:8` | Sumber kebenaran skema DB & kurva level `level * 100`. |
| `src/components/ar-viewer.tsx:78` | Titik tersulit — lifecycle `<model-viewer>`, event `progress/load/ar-status/error`, hotspot, animasi, webcam fallback. |
| `src/components/sidebar.tsx:104` | Navigasi utama + XP bar + collapsed logic. Menu baru tambah di `menuItems`. |
| `src/app/globals.css:120` | Semua token warna, `.glass`, `.glow-*`, `.bg-grid`, keyframes. Ubah tema cukup edit CSS variables di `:root` dan `.dark`. |

---

## 5. PANDUAN PERAN PENGGUNA

### 5.1 Untuk Siswa (End User)

#### Langkah 0 — Buka Aplikasi

- Desktop: buka `https://domain-kamu.vercel.app` → landing page tampil (`src/app/page.tsx:93`).
- HP: buka link yang sama → tap **Install** (banner PWA) atau tombol **PWA Install** di landing → aplikasi terpasang seperti native.

> **🖼️ GAMBAR 5.1 — Landing Page (Letak: 5.1 Langkah 0)**
> Prompt: `Landing page screenshot mockup of GAMIFIKATHINK, hero with glowing arc reactor logo, title "Belajar Jadi Game Epik", 6 feature cards (Arena AI, Boss Battle, AR Lab, Buku Mantra, Misi XP, PWA), stats row (4 mapel 3 jenjang 7 model 3D), dark JARVIS theme, browser frame, 16:9`
> Penempatan: `docs/images/landing-page.png`

#### Langkah 1 — Masuk ke Arena Belajar (`/arena`)

1. Di landing, klik **Masuk ke Arena** → `/arena` (`src/app/arena/page.tsx:10`).
2. Di sidebar kiri, pilih **Jenjang** (SD/SMP/SMA) dan **Mata Pelajaran** (Matematika, Fisika, Kimia, Bahasa Inggris) — state tersimpan di `useState` (`src/app/arena/page.tsx:11`).
3. Lihat **Quick Prompt Chips** di tengah layar kosong: tap salah satu untuk mulai cepat (`src/components/chat-interface.tsx:239`).
4. Atau ketik soal langsung di **Input Deck** bawah (`src/components/chat-interface.tsx:308`): contoh *“Jelaskan rumus phytagoras dengan cerita game”* → **Enter** atau klik Send.
5. **Upload Foto Soal**: klik icon kamera di input deck → pilih foto → preview thumbnail glass muncul → kirim. AI akan OCR + jawab (`src/components/chat-interface.tsx:314`, `src/app/api/chat/route.ts:57`).

> **🖼️ GAMBAR 5.2 — Arena Chat (Letak: 5.1 Langkah 1)**
> Prompt: `Chat interface mockup, header with Swords icon "Arena Matematika SMA", HUD status showing Engine LED cyan PING 42ms ONLINE, AI bubble with markdown and KaTeX formula, user bubble gradient, input deck glass with textarea and send button, quick chips, dark theme, 16:9`
> Penempatan: `docs/images/arena-chat.png`

#### Langkah 2 — Pahami Pembahasan AI

- Jawaban AI selalu berstruktur: **🎮 Skenario Game → 📝 Soal Asli → ⚔️ Langkah Penyelesaian → 💡 Jawaban Akhir** (`src/app/api/chat/route.ts:27`).
- Rumus matematika dirender dengan **KaTeX** (`rehype-katex`).
- Perhatikan **LED indikator** di bubble AI: **cyan pulse = primary (Gemini)**, **amber = fallback (GPT-3.5)** (`src/components/chat-message.tsx` + `src/components/engine-led.tsx`).
- Header menampilkan **PING** real-time dari latency fetch (`src/components/chat-interface.tsx:75`).

#### Langkah 3 — Boss Battle (`/kuis`)

1. Klik menu **Boss Battle** di sidebar (`src/components/sidebar.tsx:104`).
2. Pilih **Bos** sesuai mapel: King Al-Gebra (Matematika), Grammar Dragon (B. Inggris), Lord Newton (Fisika), Doctor Mole (Kimia) (`src/lib/quiz-bank.ts:14`).
3. Pilih **Jenjang** dan **Durasi per soal** (30–60 detik, slider `range-jarvis`).
4. Klik **MULAI PERTEMPURAN** → 5 soal ber-timer.
   - Jawaban benar: boss -20 HP, +score (100 × combo multiplier max x5), combo naik.
   - Jawaban salah/waktu habis: -1 hati (dari 3).
   - Kondisi menang: boss HP 0 atau semua soal dijawab; kalah: hati habis.
5. Lihat hasil: skor, combo max, jawaban benar, **XP diperoleh** (+15 per benar +25 jika boss kalah) (`src/components/boss-battle.tsx:96`).

> **🖼️ GAMBAR 5.3 — Boss Battle (Letak: 5.1 Langkah 3)**
> Prompt: `Boss battle game screen mockup, boss card with ArcReactor and HP bar, hearts, combo x3, timer bar, question card with 4 option buttons, dark JARVIS glass theme, dramatic, 16:9`
> Penempatan: `docs/images/boss-battle.png`

#### Langkah 4 — AR Lab (`/ar`)

1. Klik **AR Lab** di sidebar → grid katalog 7 model (`src/app/ar/page.tsx:63`) dengan filter subject (Semua, Matematika, Fisika, ...).
2. Klik kartu model → halaman detail `/ar/[id]` (`src/app/ar/[id]/page.tsx:30`).
3. **Mode 3D Interaktif**:
   - Putar/zoom dengan drag/scroll (`camera-controls` di `src/components/ar-viewer.tsx:244`).
   - Ketuk **titik bernomor** (hotspot) → panel anotasi muncul di bawah viewer (`src/components/ar-viewer.tsx:389`). Titik yang sudah dikunjungi berubah hijau.
   - Tombol **Putar/Jeda** & **Rotasi On/Off** + dropdown animasi (jika model punya >1 klip) (`src/components/ar-viewer.tsx:339`).
4. **Mode AR**:
   - **Native AR (OS)**: tombol *Native AR* (slot `ar-button`) → membuka **Scene Viewer** (Android) atau **Quick Look** (iOS) langsung dari OS — paling stabil (`src/components/ar-viewer.tsx:296`).
   - **Kamera AR Web**: tombol *Buka Kamera AR* → modal fullscreen `WebcamArViewer` (`src/components/ar-viewer.tsx:284`) yang pakai `getUserMedia` + `three.js` overlay — fallback untuk device tanpa native AR atau untuk demo di desktop.
   - **Catatan penting**: hotspot & kuis **TIDAK ikut** ke mode AR Quick Look/Scene Viewer — interaksi hanya di mode 3D. Ini perilaku resmi `model-viewer` (`AR_PLAN.md:34`).
5. Selesaikan **Misi XP** (`src/components/ar-missions.tsx`): Buka di AR (+10), Jelajahi semua hotspot (+15), Kuis benar (+20) — masing-masing **cooldown 24 jam** per model (localStorage).
6. Kerjakan **Kuis AR** di bawah misi — lulus = semua benar → XP.

> **🖼️ GAMBAR 5.4a — AR Lab Katalog (Letak: 5.1 Langkah 4, grid)**
> Prompt: `AR Lab catalog grid mockup, 6 cards with 3D model posters (rubik cube, dragon, molecule, magnet, pendulum, castle, ryuri), filter chips Semua Matematika Fisika, glass cards, dark JARVIS, 16:9`
> Penempatan: `docs/images/ar-catalog.png`
> **🖼️ GAMBAR 5.4b — AR Viewer Detail (Letak: 5.1 Langkah 4, viewer)**
> Prompt: `AR detail page mockup, top 3D viewer with <model-viewer> showing Grammar Dragon, numbered hotspots (1,2,3), control bar (Putar Jeda Rotasi), annotation panel below, missions XP cards, quiz sheet, LMS style, dark theme, 16:9`
> Penempatan: `docs/images/ar-viewer.png`
> **🖼️ GAMBAR 5.4c — Kamera AR Web vs Native AR (Letak: 5.1 Langkah 4, AR modes)**
> Prompt: `Split screen comparison: left Native AR Quick Look placing dragon on table, right Webcam AR in-browser with camera feed and 3D overlay, labels, phone mockups, 16:9`
> Penempatan: `docs/images/ar-modes.png`

#### Langkah 5 — Buku Mantra (`/buku-mantra`)

1. Klik **Buku Mantra** → daftar riwayat chat tersimpan (`src/app/buku-mantra/page.tsx:44`), diurut terbaru dulu.
2. Klik item → panel kanan tampil **Soal** & **Pembahasan** dengan markdown+KaTeX (`src/app/buku-mantra/page.tsx:202`).
3. Di bawah detail, ada **“Lihat Versi 3D”** — chip link ke model AR terkait mapel (`src/app/buku-mantra/page.tsx:257`).
4. Hapus dengan icon trash → konfirmasi Hapus/Batal.

> **🖼️ GAMBAR 5.5 — Buku Mantra (Letak: 5.1 Langkah 5)**
> Prompt: `Buku Mantra page mockup, left panel list of history cards with subject badges and dates, right panel detail with Soal and Pembahasan markdown, related 3D model chips at bottom, glass theme, 16:9`
> Penempatan: `docs/images/buku-mantra.png`

#### Langkah 6 — Sidebar & Gamifikasi

- Di sidebar atas: **Avatar + LV + progress bar XP** (`src/components/sidebar.tsx:196`). Contoh: `LV.2 • 45/200 XP`.
- Tap **Sun/Moon** (`ThemeToggle`) untuk ganti Dark/Light (`src/components/theme-toggle.tsx`).
- Di desktop: tombol **collapse** (PanelLeftClose) → sidebar jadi icon-only 64px (`src/components/sidebar.tsx:170`).
- Di mobile: sidebar jadi **drawer** 85vw dengan overlay blur — buka via hamburger (`MobileMenuTrigger`).

### 5.2 Untuk Guru / Orang Tua

- Gunakan akun siswa untuk membuka **Buku Mantra** dan meninjau pembahasan yang telah disimpan.
- Perhatikan **pola soal** yang paling sering ditanyakan → indikasi materi yang perlu pengayaan.
- Arahkan siswa untuk **menyeimbangkan** Arena (konsep) + Boss Battle (kecepatan) + AR Lab (visual-spatial).
- Tidak ada dashboard guru terpisah pada versi ini — roadmap ada di BAB 12.

### 5.3 Untuk Developer / Admin

#### Menambah Model AR Baru (Tanpa Coding Komponen)

1. Siapkan file di `public/models/<id-baru>/`:
   ```
   public/models/<id-baru>/model-v2.glb
   public/models/<id-baru>/model-v2.usdz   // wajib untuk iOS, konversi via three USDZExporter atau Reality Converter
   public/models/<id-baru>/poster-v2.png   // screenshot orbit 45° (jangan SVG palsu)
   ```
   Budget: **< 5 MB**, <100k poligon, tekstur ≤2048px. Lihat `AR_PLAN.md:62`.

2. Edit `src/lib/ar-catalog.ts:66` — tambah object `ArModel`:
   ```ts
   {
     id: "magnet-batang",
     subject: "Fisika",
     title: "Magnet Batang",
     description: "...",
     glb: "/models/magnet-batang/model-v2.glb",
     usdz: "/models/magnet-batang/model-v2.usdz",
     poster: "/models/magnet-batang/poster-v2.png",
     license: { author: "...", name: "CC-BY 4.0", url: "..." },
     animations: ["..."],
     hotspots: [{ id:"kutub-utara", position:"0 0 0.4", normal:"0 0 1", title:"...", body:"..." }],
     quiz: [{ question:"...", options:[...], answerIndex:1, explanation:"..." }],
     xp: { open: 10, hotspotsAll: 15, quiz: 20 }
   }
   ```

3. Jika hotspot sulit pas: buka model di `https://modelviewer.dev/editor` → copy `data-position`/`data-normal` → aturan jangkar **WAJIB di udara luar permukaan** (model-viewer sembunyikan yang tertanam di mesh) — `AR_PLAN.md:115`.

4. Jika bounding box model aneh (contoh Ryuri dengan ekor -35m): pakai field `cameraTarget/cameraOrbit/fieldOfView/minCameraOrbit/maxCameraOrbit` (`src/lib/ar-catalog.ts:54`).

5. Bila aset belum final: set `placeholderAssets: ["usdz","poster"]` agar UI tampil badge kuning “Aset sementara” (`src/app/ar/[id]/page.tsx:70`).

6. Wajib naikkan versi file (`-v2`, `-v3`) + naikkan versi cache SW (`public/sw.js:2` → `gamifikathink-v3`) karena header `immutable` 1 tahun — browser tak akan fetch ulang URL lama.

> **🖼️ GAMBAR 5.6 — Workflow Tambah Model (Letak: 5.3, diagram pipeline)**
> Prompt: `Workflow diagram for adding AR model: 6 steps (Download raw, Optimize, Convert to USDZ, Poster screenshot, Hotspot measurement, Register in catalog) with icons, flowchart style, teal accents, 16:9`
> Penempatan: `docs/images/ar-workflow.png`

#### Mengubah Prompt AI

Edit `getSystemPrompt()` di `src/app/api/chat/route.ts:14`. Struktur output wajib 4 heading markdown; ubah tone narasi game di poin 1.

#### Mengubah Boss / Bank Soal

Edit `src/lib/quiz-bank.ts:14` (BOSSES) dan `BANK` untuk soal fallback. Soal AI dinamis dihasilkan di `src/app/api/quiz/route.ts:34` via `generateObject` + `zod` — ubah `system` prompt di sana untuk style soal.

---

## 6. PANDUAN FITUR LENGKAP

### 6.1 Landing Page (`src/app/page.tsx:28`)

- **Hero**: logo `glow-drop-cyan` + badge “Sistem Online • Dual AI Engine • AR Lab” + title gradient shimmer (`shimmerStyle` `src/app/page.tsx:17`) + deskripsi + 3 CTA (Masuk ke Arena, Jelajahi AR Lab, PWA Install).
- **Link eksternal**: `RINTIS NALAR Learning Center` (`RINTIS_NALAR_URL` `src/app/page.tsx:26`).
- **Stats**: 4 mapel / 3 jenjang / 7 model 3D / 2 AI Engine (`src/app/page.tsx:86`).
- **Feature Grid**: 6 kartu glass (`Arena AI, Boss Battle, AR Lab, Buku Mantra, Misi & XP, PWA Offline`) (`src/app/page.tsx:29`).
- **Steps**: 3 langkah “Pilih Mapel → Belajar/Battle/Eksplor → Kumpulkan XP”.
- **HUD status bar** fixed bottom: `SYS.ONLINE // AR: 7 MODELS // MODEL: GEMINI-3.5.FLASH + GPT-3.5` (`src/app/page.tsx:220`).

### 6.2 Arena Belajar

#### 6.2.1 Header HUD (`src/components/chat-interface.tsx:172`)

- Kiri: icon Swords + `Arena {subject}` + `{level} // {subject}`.
- Kanan: chip HUD `EngineLED + PING + ONLINE/STREAMING` (hidden di mobile) + `ThemeToggle` + tombol **+ Baru** (`handleNewChat` reset state).

#### 6.2.2 Empty State (`src/components/chat-interface.tsx:224`)

- `ArcReactor size="lg"` + teks “Siap Bertarung, Warrior?” + chips quick prompts per mapel (`QUICK_PROMPTS` `src/components/chat-interface.tsx:39`) + seksi **Lihat di AR** (chip Scan → link `/ar/[id]`) bila ada `getRelatedModels(subject)`.

#### 6.2.3 Messaging

- `useChat` dari `@ai-sdk/react` dengan `DefaultChatTransport` (`src/components/chat-interface.tsx:88`) — streaming real-time.
- `prepareSendMessagesRequest` mengirim `subject, level, imageBase64` sebagai body tambahan (bukan bagian chat history).
- `handleFetch` mengukur latency `performance.now()` → update `ping` state + deteksi `x-engine-used` header → toast “Beralih ke jalur cadangan” bila fallback.
- `onFinish` simpan ke Supabase `chat_history` + `grantXp(10)` — hanya jika user login (`src/components/chat-interface.tsx:109`).
- Auto-scroll ke `messagesEndRef` tiap ada message baru.
- `Enter` kirim, `Shift+Enter` newline (`handleKeyDown` `src/components/chat-interface.tsx:153`).

#### 6.2.4 Input Deck (`src/components/chat-interface.tsx:308`)

- `glass` rounded-2xl dengan `focus-within:glow-cyan`.
- `ImageUpload` (`src/components/image-upload.tsx`) — tombol kamera ghost + preview thumbnail + remove.
- `textarea` transparan, `min-h-[44px]`, char count `/2000` + engine label micro di bawah form.
- Tombol send circular gradient + glow, disabled bila loading & kosong.

#### 6.2.5 Bubble & Markdown

- `ChatMessage`: user bubble gradient cyan→indigo, AI bubble `glass-strong`.
- LED pulsing per bubble AI + label mono model.
- Streaming cursor `▍` blink saat AI mengetik; bubble muncul `animate-fade-up`.
- Markdown via `react-markdown + remarkGfm + remarkMath + rehypeKatex + rehypeRaw`.

### 6.3 Boss Battle (`src/components/boss-battle.tsx:54` + `src/app/kuis/page.tsx:24`)

#### Setup Screen (`src/app/kuis/page.tsx:47`)

- Pilih Bos (4 grid), pilih Jenjang (SD/SMP/SMA), slider Durasi Per Soal (30–60 detik, step 5) dengan `range-jarvis` (`src/app/globals.css:264`).

#### Battle Screen (`src/components/boss-battle.tsx:202`)

- **Top HUD**: tombol “Tinggalkan Arena” + badge subject/level + badge Soal X/5.
- **Boss Card**: `ArcReactor lg`, nama + title + quote + **HP bar** (100 → teal >50%, amber >25%, red ≤25%).
- **Player HUD**: hearts (Heart icons) + **combo** (Zap icon, muncul jika combo ≥2) + score.
- **Timer bar**: `timePct`, warna red bila ≤10 detik, `sfx.timer()` tiap detik saat ≤6.
- **Question Card**: teks soal + 4 opsi grid (highlight teal bila benar, red bila salah, muted bila tidak dipilih).
- **Feedback box**: “BENAR! +points” atau “SALAH” + explanation (delay 1700ms sebelum next question).
- **Result Overlay**: fixed `bg-black/70 backdrop-blur-md` — trophy/skull + skor + combo max + jawaban benar + XP diperoleh + tombol Lawan Lagi / Ganti Mapel.

#### Bank Soal

- `src/lib/quiz-bank.ts:37` — 24 soal (6 per mapel). `getFallbackQuestions()` shuffle & slice 5.
- API `/api/quiz` coba generate via Gemini `gemini-3.5-flash` + `zod` schema; jika gagal/keys kosong → fallback bank. Ini menjamin battle selalu bisa dimulai meski offline dari AI.

### 6.4 AR Lab

#### 6.4.1 Katalog (`src/app/ar/page.tsx:15`)

- Filter `useState("Semua")` + `AR_SUBJECTS` dari `src/lib/ar-catalog.ts:495`.
- Grid `ArModelCard` (`src/components/ar-model-card.tsx`) — poster + badge subject + badge “Aset sementara” jika ada `placeholderAssets`.

#### 6.4.2 Viewer Detail (`src/app/ar/[id]/page.tsx:30` + `src/components/ar-viewer.tsx:48`)

- `next/dynamic ssr:false` untuk viewer + fallback `ArcReactor` loading.
- Badge placeholder kuning, title, description, viewer, missions, quiz, kredit lisensi.

#### 6.4.3 `<model-viewer>` Spec (`src/components/ar-viewer.tsx:238`)

Atribut MVP:

```html
<model-viewer
  src="/models/<id>/model-v2.glb"
  ios-src="/models/<id>/model-v2.usdz"
  poster="/models/<id>/poster-v2.png"
  ar ar-modes="scene-viewer quick-look webxr" ar-scale="auto"
  camera-controls autoplay animation-name auto-rotate
  loading="eager" reveal="auto"
  shadow-intensity="1" exposure="1">
  <button slot="hotspot-0" data-position="..." data-normal="...">1</button>
  <!-- ar-button custom -->
</model-viewer>
```

- **Import dinamis** `@google/model-viewer` di `useEffect` (`src/components/ar-viewer.tsx:78`) — bedakan error modul JS vs model GLB di UI (banner berbeda).
- **Progress bar** dari event `progress` + status teks “Menyiapkan penampil…” / “Memuat model 3D… N%” (`src/components/ar-viewer.tsx:197`).
- **Event listeners**: `progress`, `load` (set `availableAnimations`), `ar-status` (`session-started` → `sfx.win()` + `onArSessionStarted` + toast; `failed` → toast + banner), `error`.
- **Hotspot**: dot 44px, `slot="hotspot-i"`, click → `handleHotspotClick` → `sfx.click()` → `visited` state → jika semua dikunjungi → `onAllHotspotsVisited`.
- **Kontrol**: Play/Pause (`viewerRef.current.play()/pause()`), auto-rotate toggle (respect `prefers-reduced-motion` via `getInitialAutoRotate()`), dropdown animasi bila `animations.length > 1`.
- **Defer load**: model Ryuri (`deferLoad:true`) tampil tombol “Muat Ryuri 3D” dulu agar halaman katalog tidak berat (GLB 11 MB).
- **Framing custom**: `cameraTarget/Orbit/fieldOfView/min/max` diteruskan dari `ArModel` untuk fix kasus Ryuri.
- **Panel anotasi** glass `min-h-20` dengan `aria-live="polite"` — tampil judul+body hotspot aktif.
- **Webcam AR fallback**: tombol “Buka Kamera AR” → `WebcamArViewer` fullscreen modal (`getUserMedia` + three.js) — untuk device tanpa native AR.

#### 6.4.4 Misi & Kuis AR

- `useArMissions(model)` (`src/hooks/use-ar-missions.ts`) — 3 misi (`open, hotspotsAll, quiz`) masing-masing 10/15/20 XP, **cooldown 24 jam** via `localStorage "ar-xp-<modelId>-<mission>"`. Klaim via `grantXp()` di event handler (bukan effect) — patuh aturan hooks.
- `ArMissions` tampil kartu misi + badge Selesai/+XP.
- `ArQuiz` (`src/components/ar-quiz.tsx`) — alur mulai→soal→pembahasan→hasil; **lulus = semua benar** → `onPassed` → notify quiz mission.

#### 6.4.5 Katalog Lengkap (7 Model)

| # | ID | Mapel | Judul | Spot Highlight | Animasi | Status Aset |
|---|----|-------|-------|----------------|---------|-------------|
| 1 | `kubus-prisma` | Matematika | Kubus Rubik 3×3 | Sisi, Rusuk, Titik Sudut | `Animation` (auto) | ✅ GLB+USDZ+poster final |
| 2 | `grammar-dragon` | Boss | Grammar Dragon | Kepala(Head), Badan(Body), Sayap(Wing) vocab EN | `Take 001` (manual play, autoplay off krn root-motion) | ✅ GLB+USDZ+poster final |
| 3 | `molekul-h2o` | Kimia | Molekul Air H₂O | Atom O, Atom H, Sudut 104.5° | — | ✅ v2 placeholders (menunggu aset foto-real) |
| 4 | `magnet-batang` | Fisika | Magnet Batang | Kutub U, Kutub S, Medan Magnet | — | ✅ v2 |
| 5 | `bandul` | Fisika | Bandul Sederhana | Titik Gantung, Panjang Tali, Beban | — | ✅ v2 |
| 6 | `castle` | B.Inggris | English Vocab Castle | Keep, Turret, Gatehouse | — | ✅ v2 |
| 7 | `ryuri` | Special | Ryuri Spirit Companion | Karakter, Aura Magis | `Idle_Static/Idle/Run/T_Pose` (defer load) | ⚠️ GLB final, USDZ/poster placeholder (badge kuning) |

Lihat `src/lib/ar-catalog.ts:66` untuk data lengkap tiap model termasuk quiz 2 soal per model.

### 6.5 Buku Mantra (`src/app/buku-mantra/page.tsx:30`)

- Fetch `supabase.from("chat_history").select("*").eq("user_id", user.id).order("created_at", desc)` — loading → `ArcReactor`, empty → BookOpen + teks.
- List kiri (`glass w-full sm:w-80 lg:w-96`): kartu `subject•level`, question preview 2 line, date, trash button → confirm Hapus/Batal.
- Detail kanan: header subject•level+date, box Soal (`glass rounded-2xl`), box Pembahasan (ReactMarkdown dengan custom components: strong, em, h1/h2/h3, p, ul/ol, li, hr, code inline vs block).
- **Related AR** chips di bawah detail: `getRelatedModels(subject)` → link Scan → `/ar/[id]`.

### 6.6 Sidebar, Theme, Background

- **Sidebar** (`src/components/sidebar.tsx:50`): glass HUD, header logo + `glow-text-cyan`, user card (avatar ring gradient + LV + XP bar), nav 4 items (Arena, Boss Battle, Buku Mantra, AR Lab) dengan active state `border-l-2 border-[var(--accent)] + glow`, selector jenjang/mapel (hanya di `/arena`), riwayat, footer SYS.ONLINE + PWA install + Logout. Collapse logic: `w-72` vs `w-16` vs drawer `w-[85vw]`.
- **XP Bar**: `xpNeededForLevel(profileLevel)` dari `src/lib/xp.ts:7` → `xpPct = xp / needed *100` → gradient bar.
- **XP_EVENT**: `grantXp()` dispatch custom event → sidebar listen & update tanpa refresh (`src/components/sidebar.tsx:84`).
- **Theme**: `next-themes` (`src/components/providers.tsx`) + `ThemeToggle` (Sun/Moon rotate/scale).
- **BackgroundFX** (`src/components/background-fx.tsx`): fixed layer: `bg-grid` (40px grid cyan 6% opacity, `src/app/globals.css:168`) + 2 orbs blur-3xl (cyan kiri-atas + indigo kanan-bawah) + optional scanline.

### 6.7 Halaman Lain

- **Login** (`src/app/login/page.tsx:6`): saat ini **redirect langsung** ke `/arena` — auth tidak dijaga. Cocok untuk demo; untuk production aktifkan middleware auth.
- **Middleware** (`src/middleware.ts` + `src/lib/supabase/middleware.ts`): allowlist `.glb/.usdz//models/` agar tidak redirect ke `/login` (pelajaran dari insiden manifest/SW).

---

## 7. SISTEM GAMIFIKASI (XP & LEVEL)

### 7.1 Sumber XP

| Aksi | XP | File | Cooldown |
|------|----|------|----------|
| Chat selesai (Arena) | +10 | `src/lib/xp.ts:2`, `src/components/chat-interface.tsx:123` | — |
| Quiz benar (Boss) | +15 per jawaban benar | `src/lib/xp.ts:3`, `src/components/boss-battle.tsx:98` | — |
| Boss dikalahkan | +25 bonus | `src/lib/xp.ts:4`, `src/components/boss-battle.tsx:98` | — |
| AR: Buka di AR | +10 | `src/lib/ar-catalog.ts:61` (`DEFAULT_XP`) | 1×/model/24 jam |
| AR: Jelajahi semua hotspot | +15 | sama | 1×/model/24 jam |
| AR: Kuis lulus (semua benar) | +20 | sama | 1×/model/24 jam |

### 7.2 Kurva Level

Formula: XP dibutuhkan untuk naik dari level `L` ke `L+1` = `L × 100` (`supabase-gamification.sql:7`, `src/lib/xp.ts:7`).

| Level | XP kumulatif untuk capai | XP next |
|-------|--------------------------|---------|
| 1 | 0 | 100 |
| 2 | 100 | 200 |
| 3 | 300 | 300 |
| 4 | 600 | 400 |
| 5 | 1000 | 500 |
| ... | ... | ... |

Fungsi helper:

```ts
// src/lib/xp.ts:11
levelFromXp(totalXp) → { level, xpIntoLevel }
xpNeededForLevel(level) → level * 100
```

Di DB, `add_xp(amount)` melakukan loop `WHILE current_xp >= level*100` → kurangi & naik level atomik, lalu `UPDATE profiles` & return `xp, level, leveled_up` (`supabase-gamification.sql:8`).

### 7.3 Feedback

- **Confetti**: `celebrate()` 90 partikel saat menang/kuis lulus, `levelUpCelebrate()` 180+100+100 saat naik level (`src/lib/feedback.ts:5`).
- **SFX** via Web Audio (`src/lib/feedback.ts:86`): `correct` (880+1318 Hz), `wrong` (sawtooth), `levelup` (do-mi-sol-do), `win` (6 nada triangle), `click`, `timer` (440 Hz sine).

---

## 8. BASIS DATA & API

### 8.1 Skema (`supabase-schema.sql:11`)

**Tabel `profiles`**:

| Kolom | Tipe | Default | Ket |
|-------|------|---------|-----|
| `id` | UUID PK FK `auth.users(id)` | — | cascade delete |
| `email` | TEXT | — | — |
| `display_name` | TEXT | — | dari `raw_user_meta_data.full_name` atau email |
| `avatar_url` | TEXT | — | — |
| `level` | INT | 1 | — |
| `xp` | INT | 0 | xpIntoLevel (bukan total) |
| `created_at` | TIMESTAMPTZ | now() | — |
| `updated_at` | TIMESTAMPTZ | now() | update via `add_xp` |

Trigger `handle_new_user()` auto-insert profile saat signup (`supabase-schema.sql:40`).

**Tabel `chat_history`**:

| Kolom | Tipe | Ket |
|-------|------|-----|
| `id` | UUID PK gen_random_uuid() | — |
| `user_id` | UUID FK auth.users | — |
| `subject` | TEXT | Matematika/Fisika/Kimia/B.Inggris |
| `level` | TEXT | SD/SMP/SMA |
| `question` | TEXT | — |
| `answer` | TEXT | markdown |
| `engine_used` | TEXT | primary/fallback |
| `created_at` | TIMESTAMPTZ | — |

Index `user_id` + `created_at desc` (`supabase-schema.sql:36`).

**RLS Policies** (`supabase-schema.sql:63`): user hanya bisa view/update own profile; view/insert/delete own chat_history.

### 8.2 RPC `add_xp` (`supabase-gamification.sql:8`)

- `SECURITY DEFINER` agar bisa update profile tanpa RLS block.
- `GRANT EXECUTE TO authenticated`.
- Dipanggil via `supabase.rpc("add_xp", { amount })` di `src/lib/xp-events.ts:24` → dispatch `XP_EVENT`.

### 8.3 API Routes

#### `POST /api/chat` (`src/app/api/chat/route.ts:47`)

- Input JSON: `{ messages: UIMessage[], subject, level, imageBase64 }`.
- Build `systemPrompt` (`getSystemPrompt`), `userContent` (text atau `[text,image]`), `modelMessages` (history tanpa last).
- Try `streamText({ model: google("gemini-3.5-flash"), ... })` → `toUIMessageStreamResponse({ headers: { "x-engine-used": "primary" } })`.
- Catch → fallback `chatanywhere("gpt-3.5-turbo")` dengan header `fallback`.

#### `POST /api/quiz` (`src/app/api/quiz/route.ts:18`)

- Input: `{ subject, level }` (default Matematika/SMP).
- Jika `!GOOGLE_GENERATIVE_AI_API_KEY` → langsung `getFallbackQuestions(subject)`.
- Else `generateObject({ model: google("gemini-3.5-flash"), schema: quizSchema (5 soal, 4 opsi, answerIndex 0-3), system: "...", prompt: "Buat 5 soal..." })` → `questions`.
- Catch → fallback bank.

---

## 9. DESAIN VISUAL — JARVIS STYLE

Spesifikasi lengkap di `DESIGNREFACTOR.md:1`.

### 9.1 Tokens (`src/app/globals.css:7`)

| Token | Light (`:root`) | Dark (`.dark` default) |
|-------|-----------------|------------------------|
| `--background` | `#f2faf8` | `#031312` |
| `--surface` | `rgba(255,255,255,0.75)` | `rgba(9,34,31,0.6)` |
| `--accent` | `#0d9488` (teal-600) | `#2dd4bf` (teal-400) |
| `--accent-2` | `#5eead4` | `#99f6e4` |
| `--gold` | `#b45309` | `#f6c453` |

semua komponen WAJIB pakai CSS variables, tidak hardcode hex.

### 9.2 Utilities

- `.glass` → `background: var(--surface) + blur 12px + border var(--border)` (`src/app/globals.css:120`)
- `.glass-strong` → blur 20px + shadow
- `.glow-cyan / .glow-drop-cyan / .glow-text-cyan / .glow-gold` + `.text-gradient` + `.bg-gradient-jarvis` (135deg accent→accent-2)
- `.bg-grid` → grid 40px cyan 6% (`src/app/globals.css:168`)

### 9.3 Keyframes & Animasi

`fade-up`, `fade-in`, `pulse-glow`, `spin-slow`, `blink-cursor`, `shimmer`, `float-orb`, `typing-dot` (`src/app/globals.css:175`). Respect `prefers-reduced-motion: reduce` matikan semua (`src/app/globals.css:321`).

### 9.4 Responsive

| Breakpoint | Sidebar | Konten |
|------------|---------|--------|
| `<768px` | drawer 85vw + overlay | full |
| `768-1024px` | collapse 64px | max-w-2xl |
| `>1024px` | 288px (collapse-able) | max-w-3xl |

Tinggi `h-[100dvh]` safe untuk mobile address bar, touch target ≥44px.

> **🖼️ GAMBAR 9.1 — Design System (Letak: BAB 9)**
> Prompt: `Design system sheet for JARVIS education app, color tokens (teal, gold, glass), typography scale, glass card examples, glow effects, grid background, dark and light mode side by side, Figma style, 16:9`
> Penempatan: `docs/images/design-system.png`

---

## 10. PWA & OFFLINE

### 10.1 Manifest (`src/app/manifest.ts:3`)

`name: "GAMIFIKATHINK — Belajar Jadi Game"`, `display: standalone`, `theme_color #0d9488`, icons 192/512 + maskable.

### 10.2 Service Worker (`public/sw.js:1`)

- `CACHE = "gamifikathink-v2"`, `APP_SHELL = ["/", "/logo.svg", "/icons/*", "/manifest.webmanifest"]`.
- `install`: `cache.addAll(APP_SHELL)` + `skipWaiting`.
- `activate`: hapus cache lama kecuali `CACHE` & `gamifikathink-models-v2`.
- `fetch`:
  - Skip non-GET, skip cross-origin, skip `/api/` & supabase → network-only.
  - `request.mode === "navigate"` → **network-first**, fallback `caches.match(request) || caches.match("/")` (offline tetap bisa buka).
  - `/models/` / `.glb` / `.usdz` → **cache-first** terpisah `gamifikathink-models-v2` (jangan masuk APP_SHELL karena besar) — Scene Viewer/Quick Look fetch langsung ke server, bukan via SW.
  - `/_next/static/ /icons/ .(svg|png|ico|css|js|woff2)` → **stale-while-revalidate**.
- Registrasi via `src/components/pwa-register.tsx` + tombol install `src/components/pwa-install-button.tsx`.

### 10.3 Offline UX

- Halaman `/` & `/arena` & `/ar` tetap terbuka bila sudah pernah dikunjungi saat online.
- Model 3D tetap bisa diputar bila sudah pernah dibuka sekali (sudah tercache).
- Chat & quiz butuh online (API AI) — akan gagal graceful dengan toast.

> **🖼️ GAMBAR 10.1 — PWA Install (Letak: BAB 10)**
> Prompt: `PWA install flow illustration, phone showing "Add to Home Screen" banner for GAMIFIKATHINK, app icon on home screen, offline badge, 3 phone mockups, clean, 16:9`
> Penempatan: `docs/images/pwa-install.png`

---

## 11. TROUBLESHOOTING & FAQ

### 11.1 Build / Typecheck Gagal

```bash
npm run lint
npm run typecheck
npm run build
```

- Error `Cannot find module '@google/model-viewer'` → `npm install` ulang; pastikan `three` eksplisit di deps (`package.json:49`).
- Error `JSX element type 'model-viewer' does not exist` → cek `src/types/model-viewer.d.ts` augmentasi `react` JSX untuk React 19.
- Error `model-viewer` chunk missing → hard refresh `Ctrl+Shift+R` agar SW tidak serve chunk lama.

### 11.2 Supabase

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| `grantXp` return null | User belum login / RLS block | Cek `supabase.auth.getUser()`; pastikan `add_xp` GRANT ke authenticated |
| `chat_history` tidak tersimpan | RLS insert policy | Jalankan ulang `supabase-schema.sql:80` |
| Level tidak naik | `add_xp` belum dijalankan | Jalankan `supabase-gamification.sql` |
| Profile kosong | Trigger `handle_new_user` belum ada | Cek `DROP TRIGGER IF EXISTS on_auth_user_created` |

### 11.3 AR

| Gejala | Penyebab | Solusi |
|--------|----------|--------|
| Model hanya poster / 2 cincin | `reveal="interaction"` + poster placeholder (insiden lama) | Sudah fix: pakai `reveal="auto" + loading="eager"` (`src/components/ar-viewer.tsx:255`). Hard refresh. |
| Model tidak tampil (Ryuri kecil hilang) | Bounding box 36m karena mesh rambut/ekor pencilan | Sudah fix: `cameraTarget 0m 0.8m 0m + cameraOrbit 0deg 75deg 2.8m` (`src/lib/ar-catalog.ts:443`). |
| Hotspot tidak muncul | Tertanam di dalam mesh | Geser `position` ke udara luar permukaan + `normal` menghadap kamera (lihat AR_PLAN §5). |
| USDZ 404 / MIME salah | `next.config.ts` header belum ada | Cek `curl -I` harus `model/vnd.usdz+zip` (`next.config.ts:36`). |
| Model baru tidak tampil setelah ganti file | Cache immutable + SW cache-first | Naikkan versi file (`model-v3.glb`) + update katalog + naikkan `CACHE` di `public/sw.js:2`. |
| Tombol AR tidak muncul di desktop | Memang normal — native AR hanya di HP ARCore/ARKit | Gunakan “Buka Kamera AR” (webcam) untuk demo desktop. |
| Kamera AR hitam | Permission ditolak | Allow camera di browser; cek HTTPS wajib untuk `getUserMedia`. |
| Quick Look gagal (iOS) | USDZ placeholder/duplikat | Jangan pakai duplikat kubus untuk Ryuri — field `usdz` dikosongkan + badge placeholder (`src/lib/ar-catalog.ts:428`). |

### 11.4 AI

| Gejala | Solusi |
|--------|--------|
| Chat selalu fallback (amber) | Cek `GOOGLE_GENERATIVE_AI_API_KEY` valid & quota; lihat Network tab `x-engine-used` header |
| Quiz selalu fallback bank | Cek `GOOGLE_GENERATIVE_AI_API_KEY` ada; jika sengaja offline itu normal |
| Streaming putus | Cek koneksi; `isApiRequest` di SW tidak cache `/api/` jadi harus online |

### 11.5 FAQ

**Q: Apakah harus login Google?**  
A: Saat ini `/login` redirect ke `/arena` tanpa gate (`src/app/login/page.tsx:11`). Fitur auth dimatikan untuk demo. Untuk production, aktifkan middleware auth & Google provider di Supabase.

**Q: Berapa biaya operasional AI?**  
A: Gemini 2.5 Flash gratis tier cukup untuk demo kelas (60 RPM). Fallback ChatAnywhere sebagai cadangan bila quota habis.

**Q: Bisa tambah mapel baru (mis. Ekonomi)?**  
A: Bisa. Tambah di `QUICK_PROMPTS` + `SUBJECTS` + `BOSSES` + `BANK` + `AR_MODELS` subject enum. Tidak perlu ubah DB schema (subject free text).

**Q: Model AR bisa diganti aset sekolah sendiri?**  
A: Bisa. Ikuti pipeline §5.3 — satu-satunya file yang diubah adalah `src/lib/ar-catalog.ts:66` + folder `public/models/`.

---

## 12. ROADMAP & PENGEMBANGAN LANJUT

### 12.1 Status Saat Ini (2026-09-17)

- Fase 0 (Bukti pipeline 2 model) — ✅ Selesai
- Fase 1 (MVP penuh 6 model + kuis + misi XP) — ✅ Selesai sebagian (7 model terdaftar, 2 model final, 5 butuh USDZ/poster foto-real, uji HP fisik TODO) — lihat `AR_PLAN.md:5`

### 12.2 Fase 2 — Pendalaman (Opsional)

- [ ] AI Arena auto-suggest model AR terkait berdasarkan soal (via embeddings).
- [ ] Anotasi lanjutan: audio SFX per hotspot, narasi TTS.
- [ ] Pindah aset ke Supabase Storage `ar-models` + CDN bila `public/` >50 MB.

### 12.3 Fase 3 — Beyond MVP

- [ ] Marker “scan kartu mantra” (MindAR) atau WebXR markerless (`react-three-fiber`).
- [ ] Boss battle AR interaktif penuh.
- [ ] Dashboard guru: analytics per kelas (XP, accuracy, topik lemah).
- [ ] Leaderboard global + badge koleksi.

---

## 13. LAMPIRAN

### 13.1 Perintah Penting

```bash
npm run dev          # dev
npm run build        # build prod
npm run lint
npm run typecheck
npm run format       # prettier check
npm run format:fix   # prettier write
```

### 13.2 File Konfigurasi

- `eslint.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `next.config.ts`, `.prettierrc`

### 13.3 Lisensi Aset

- Tiap model wajib `license: { author, name, url }` di `src/lib/ar-catalog.ts:16`. Tampil di UI detail (`src/app/ar/[id]/page.tsx:97`). Untuk aset CC-BY wajib cantumkan URL sumber.

### 13.4 Kontak & Bantuan

- Laporan bug / fitur: https://github.com/anomalyco/opencode
- Referensi model-viewer: https://modelviewer.dev/
- Model gratis: KhronosGroup glTF-Sample-Models, Poly.pizza, Quaternius, Sketchfab (filter CC-BY/CC0)

---

## 14. PROMPT GAMBAR & PENEMPATAN

Ringkasan semua prompt gambar yang dibutuhkan agar manual book & slide terlihat profesional. Generate via Midjourney / DALL·E 3 / Stable Diffusion XL / Leonardo, lalu simpan sesuai jalur.

| # | Nama | Prompt (copy-paste) | Rasio | Letak di MANUALBOOK | Letak di SLIDES |
|---|------|---------------------|-------|---------------------|-----------------|
| 1 | Cover Hero | `Futuristic JARVIS HUD hero for education app GAMIFIKATHINK, dark teal glassmorphism, arc reactor logo glowing cyan, holographic grid, 3D models floating (rubik cube low-poly, dragon, water molecule H2O, magnet, pendulum, castle), Indonesian students using phone AR, cinematic lighting, ultra-detailed, 8k --ar 16:9` | 16:9 | Sampul + BAB 1 | Slide 1 |
| 2 | Architecture | `Clean software architecture diagram for GamifikaThink, boxes: Browser PWA (Service Worker), Next.js App Router, Supabase Auth+Postgres, Google Gemini primary + ChatAnywhere fallback, AR model-viewer with GLB+USDZ, arrows labeled, dark JARVIS theme teal accents, vector illustration --ar 16:9` | 16:9 | BAB 2 | Slide 5-6 |
| 3 | Supabase Setup | `Illustration of Supabase Dashboard SQL Editor dark theme, SQL code for profiles and chat_history, Run button highlighted green, sidebar, realistic UI mockup --ar 16:9` | 16:9 | BAB 3.4 | Slide 8 |
| 4 | Folder Structure | `Minimalist folder tree infographic for Next.js project, icons for app/arena/ar/kuis, components, lib, public/models with 7 subfolders, dark background teal lines, clean vector --ar 4:3` | 4:3 | BAB 4 | Slide 7 |
| 5 | Landing Page | `Browser mockup screenshot of GAMIFIKATHINK landing page, hero with arc reactor logo, title Belajar Jadi Game Epik gradient, 6 feature cards glass, stats row, bottom HUD bar, dark JARVIS theme --ar 16:9` | 16:9 | BAB 5.1 Langkah 0 | Slide 10 |
| 6 | Arena Chat | `Chat interface mockup, header Swords Arena Matematika SMA, HUD chip Engine LED cyan PING 42ms ONLINE, AI bubble markdown KaTeX formula, user bubble gradient, glass input deck with textarea, dark theme --ar 16:9` | 16:9 | BAB 5.1 Langkah 1 | Slide 12 |
| 7 | Boss Battle | `Boss battle game screen, boss card ArcReactor HP bar 100, hearts x3, combo x3 Zap, timer bar, question card 4 options, glass JARVIS theme, dramatic --ar 16:9` | 16:9 | BAB 5.1 Langkah 3 | Slide 14 |
| 8 | AR Catalog | `AR Lab catalog grid, 7 cards with 3D posters (rubik, dragon, molecule, magnet, pendulum, castle, anime companion), filter chips, glass cards, dark theme --ar 16:9` | 16:9 | BAB 5.1 Langkah 4 | Slide 16 |
| 9 | AR Viewer | `AR detail page, top 3D viewer model-viewer dragon with numbered hotspots 1,2,3, controls Putar Jeda Rotasi, annotation panel, missions XP, quiz sheet, LMS --ar 16:9` | 16:9 | BAB 5.1 Langkah 4 | Slide 17 |
| 10 | AR Modes | `Split screen phone mockups: left Native AR Quick Look dragon on table, right Webcam AR in-browser with camera feed overlay, labels, comparison --ar 16:9` | 16:9 | BAB 5.1 Langkah 4 | Slide 18 |
| 11 | Buku Mantra | `Buku Mantra page, left list history cards subject badges, right detail Soal Pembahasan markdown, related 3D chips, glass theme --ar 16:9` | 16:9 | BAB 5.1 Langkah 5 | Slide 19 |
| 12 | Design System | `Design system sheet, color tokens teal/gold/glass, typography Space Grotesk, glass card examples, glow effects, grid background, light vs dark side by side, Figma style --ar 16:9` | 16:9 | BAB 9 | Slide 21 |
| 13 | PWA Install | `PWA install flow, 3 phone mockups showing Add to Home Screen banner, app icon on home screen, offline badge, clean --ar 16:9` | 16:9 | BAB 10 | Slide 20 |
| 14 | Workflow AR | `Flowchart 6 steps adding AR model: Download raw, Optimize, Convert USDZ, Poster screenshot, Hotspot measurement, Register catalog, icons teal, flowchart --ar 16:9` | 16:9 | BAB 5.3 | Slide 25 |
| 15 | Gamification | `Gamification infographic, XP rewards table, level curve chart (level*100), confetti celebration, hearts combo HP bars, JARVIS theme --ar 16:9` | 16:9 | BAB 7 | Slide 15 |
| 16 | Team / Closing | `Indonesian student team celebrating, trophy, AR dragon floating, classroom futuristic, warm lighting, photorealistic --ar 16:9` | 16:9 | Penutup | Slide 35 |

**Cara pakai prompt:**

1. Buka Midjourney/DALL·E/Leonardo → paste prompt → generate 4 varian → pilih terbaik → upscale.
2. Simpan di `docs/images/<nama-file>.png` (buat folder `docs/images/` bila belum ada; atau `public/docs/images/` jika ingin serve via Next).
3. Referensikan di Markdown dengan `![Alt](docs/images/<file>.png)`.
4. Untuk slide (Google Slides/PowerPoint/Canva): import sebagai background/full-bleed; overlay teks glass.

**Tips**: Tambahkan `--style raw --v 6` di Midjourney untuk hasil lebih fotorealistik; untuk diagram arsitektur gunakan `--style diagram` atau buat manual di Figma/Excalidraw lalu export PNG.

---

> **Catatan akhir**: Manual ini sinkron dengan kode pada commit terakhir (2026-09-17). Jika menambah model/field baru di `src/lib/ar-catalog.ts:66`, update juga tabel di BAB 6.4.5 dan prompt gambar AR. Untuk pertanyaan implementasi, rujuk `AR_PLAN.md:1` & `DESIGNREFACTOR.md:1` sebagai dokumen rencana yang lebih granular.

*— Selesai — Selamat mengajar & bermain! 🎮✨*

