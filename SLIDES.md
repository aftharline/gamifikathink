# SLIDES — Presentasi GAMIFIKATHINK
### *Belajar Jadi Game Epik — AI + AR Gamifikasi*
> **Format:** Draf slide lengkap siap import ke **Google Slides / PowerPoint / Canva / Pitch**  
> **Rasio:** 16:9 • **Tema:** JARVIS Dark (bg `#031312`, accent `#2dd4bf`, gold `#f6c453`, glass blur)  
> **Font:** Heading Space Grotesk / Inter Bold, Body Inter, Mono JetBrains Mono untuk HUD/label  
> **Jumlah slide:** 36 (+ cover, divider, closing)  
> **Durasi presentasi:** 20–25 menit (opsional 10 menit demo live)  
> **Speaker notes** disertakan per slide.

---

## Cara Pakai File Ini

1. **Google Slides**: Buat presentasi kosong 16:9 → copy-paste per slide (Judul + bullets + notes). Untuk gambar, generate via prompt di MANUALBOOK BAB 14 dan import sebagai background/full-bleed.
2. **Canva**: Search template “Futuristic Dark Presentation” → replace konten.
3. **PowerPoint**: Import via Outline View (View → Outline) lalu paste heading.
4. **Cetak PDF**: Export → Handout 2 slide/halaman untuk juri.

**Tips desain per slide:**
- Background: gradient `#031312 → #0a2a26` + `bg-grid` 40px cyan 6% (`src/app/globals.css:168`) + 2 orb blur (cyan kiri-atas, indigo kanan-bawah).
- Kartu: pakai style `.glass` (`backdrop-blur 12px`, border `rgba(45,212,191,0.15)`) + `.glow-cyan` pada elemen aktif.
- Judul: `text-gradient` cyan→mint (`linear-gradient 135deg #2dd4bf → #99f6e4`).
- Label kecil: mono `text-[10px] tracking-[0.2em] uppercase` warna `text-muted`.

---

### SLIDE 1 — Cover
**Layout:** Full-bleed image + centered title

**Visual:** `docs/images/cover-hero.png` (Prompt #1) — arc reactor + floating 3D models

**Konten:**
```
[Badge pill glass]  ● SISTEM ONLINE • DUAL AI ENGINE • AR LAB

GAMIFIKATHINK                           [glow-text-cyan]
Belajar Jadi Game Epik

Ubah soal Matematika, Fisika, Kimia & B. Inggris
jadi skenario game epik dengan AI + AR

[Button gradient] Masuk ke Arena  [Button outline glass] Lihat AR Lab
```

**Footer HUD:** `SYS.ONLINE // AR: 7 MODELS // MODEL: GEMINI-3.5.FLASH + GPT-3.5`

**Speaker notes:** *Buka dengan hook: “Bayangkan soal Phytagoras diceritakan sebagai misi Mobile Legends.” Perkenalkan tim & tagline. Jangan lama — 30 detik.*

---

### SLIDE 2 — Agenda / Daftar Isi
**Layout:** 2 kolom — kiri timeline, kanan visual

**Konten:**
```
01  Masalah & Solusi
02  Demo Alur Pengguna (Arena → Boss → AR)
03  Arsitektur & Teknologi
04  Fitur Deep Dive (4 pilar)
05  Gamifikasi & Dampak Belajar
06  PWA & Aksesibilitas
07  Roadmap & Penutup
```

**Speaker notes:** *Sampaikan peta 20 menit. Tekankan ada demo live di tengah.*

---

### SLIDE 3 — Masalah (Problem)
**Layout:** 3 kartu glass + icon

**Konten:**
```
😴  Membosankan          🧩 Abstrak              📉 Motivasi Rendah
Soal di buku terasa      Molekul, vektor,       Tanpa reward langsung
monoton, siswa           grammar sulit          siswa cepat menyerah
kehilangan fokus         dibayangkan
```

**Speaker notes:** *Kutip data: 60% siswa anggap matematika sulit (bisa pakai PISA). Hubungkan ke kebutuhan visual & narasi.*

---

### SLIDE 4 — Solusi: GamifikaThink
**Layout:** 4 pilar icon besar

**Konten:**
```
🎮  Narasi Game          🤖 Dual AI            🧊 AR 3D Interaktif   🏆 Gamifikasi
Soal dibungkus lore      Gemini primary +      Putar, hotspot,       XP, Level, Combo,
ML/Roblox/Genshin        fallback GPT-3.5      tempatkan di meja     Misi, Boss HP
                         anti gagal
```

**Speaker notes:** *Satu kalimat per pilar. Tekankan “bukan ganti kurikulum, tapi bungkusnya.”*

---

### SLIDE 5 — Arsitektur Tingkat Tinggi
**Layout:** Diagram besar

**Visual:** `docs/images/architecture.png` (Prompt #2)

**Konten:**
```
Browser (PWA + SW) ⇄ Next.js App Router (App/Arena/AR/Kuis/History)
                    ⇄ Supabase (Auth + Postgres RLS)
                    ⇄ Gemini 3.5 Flash (primary) → ChatAnywhere GPT-3.5 (fallback)
                    ⇄ <model-viewer> (GLB+USDZ) → Webcam AR fallback
```

**Speaker notes:** *Jelaskan 30 detik: Next.js untuk SSR+streaming, Supabase untuk auth & XP, model-viewer untuk AR tanpa SDK berbayar.*

---

### SLIDE 6 — Stack Teknologi
**Layout:** Tabel 2 kolom + logo strip

**Konten:**
```
Framework   Next.js 16 + React 19 + Tailwind v4
AI          ai SDK v7 + @ai-sdk/google + @ai-sdk/openai
3D/AR       @google/model-viewer 4.3 + three.js 0.183 + USDZExporter
DB/Auth     Supabase (RLS, RPC add_xp)
PWA         Service Worker vanilla + Web Manifest
Styling     KaTeX + react-markdown + canvas-confetti + Web Audio SFX
Deploy      Vercel (HTTPS wajib untuk AR)
```

**Speaker notes:** *Tekankan: “Tidak ada SDK AR berbayar (8th Wall) — semua self-host, privasi kamera terjaga, no getUserMedia kecuali webcam fallback.”*

---

### SLIDE 7 — Struktur Proyek
**Layout:** Folder tree visual + highlight 3 file kunci

**Visual:** `docs/images/folder-structure.png` (Prompt #4)

**Konten:**
```
public/models/<id>/  (7 model GLB+USDZ+poster)
src/app/{arena,kuis,ar,buku-mantra,api}
src/components/{ar-viewer, chat-interface, boss-battle, sidebar}
src/lib/{ar-catalog.ts, quiz-bank.ts, xp.ts}

SINGLE SOURCE OF TRUTH: src/lib/ar-catalog.ts:66
Ubah model = edit 1 file, tanpa ubah komponen
```

**Speaker notes:** *Tunjukkan betapa mudah tambah model baru — cukup edit ar-catalog, tidak sentuh viewer.*

---

### SLIDE 8 — Setup Supabase (Sekilas)
**Layout:** Screenshot mockup + 3 steps

**Visual:** `docs/images/supabase-setup.png` (Prompt #3)

**Konten:**
```
1. SQL Editor → run supabase-schema.sql (profiles, chat_history, RLS, trigger)
2. Run supabase-gamification.sql (RPC add_xp, kurva level*100)
3. Aktifkan Auth Providers → Google + cek GRANT EXECUTE

Verifikasi: select public.add_xp(10) → xp, level, leveled_up
```

**Speaker notes:** *Jangan demo SQL live — cukup screenshot. Tekankan RLS: user hanya lihat data sendiri.*

---

### SLIDE 9 — Alur Pengguna (User Journey)
**Layout:** Horizontal flowchart 5 steps dengan arrow

**Konten:**
```
[Landing] → [Arena: chat AI + foto soal] → [Boss Battle: 5 soal timer] → [AR Lab: 3D + AR] → [Buku Mantra: riwayat + XP Level naik]
    ↓              ↓                              ↓                      ↓                    ↓
  CTA glass   Quick chips + Input Deck      HP/Hearts/Combo/Skor   Hotspot+Misi+Kuis    Related 3D chips
```

**Speaker notes:** *Ini peta demo live. Ajak audiens ikuti urutan ini.*

---

### SLIDE 10 — Landing Page
**Layout:** Screenshot browser mockup + 3 bullets

**Visual:** `docs/images/landing-page.png` (Prompt #5)

**Konten:**
```
Hero: Arc Reactor glow + title gradient shimmer + 2 CTA
Stats: 4 Mapel | 3 Jenjang | 7 Model 3D | 2 AI Engine
Feature Grid 6: Arena AI, Boss Battle, AR Lab, Buku Mantra, Misi XP, PWA Offline
HUD bar fixed: SYS.ONLINE // AR: 7 MODELS

src/app/page.tsx:93  +  BackgroundFX grid + orbs
```

**Speaker notes:** *Soroti CTA Rintis Nalar Learning Center (gold glow) sebagai mitra eksternal.*

---

### SLIDE 11 — Demo Live: Arena (Persiapan)
**Layout:** Checklist + screenshot kecil

**Konten:**
```
Siapkan:
☑ Pilih Matematika + SMA di sidebar
☑ Tap quick chip: “Jelaskan rumus phytagoras dengan cerita game”
☑ Atau upload foto soal (ImageUpload glass thumbnail)
```

**Speaker notes:** *Transisi ke demo live. Buka laptop → buka /arena → tunjukkan pilih mapel/jenjang. Jika offline, pakai video rekaman.*

---

### SLIDE 12 — Arena Deep Dive
**Layout:** Split — kiri screenshot chat, kanan bullets

**Visual:** `docs/images/arena-chat.png` (Prompt #6)

**Konten:**
```
Header HUD: Swords + subject/level + EngineLED (cyan/amber) + PING + ONLINE/STREAMING
Empty state: ArcReactor lg + 3 quick chips + “Lihat di AR” related models
Streaming: useChat + DefaultChatTransport + x-engine-used header → fallback toast
Input Deck: glass rounded-2xl, focus glow, textarea + ImageUpload + Send gradient
OnFinish: supabase insert chat_history + grantXp(10)
```

**File:** `src/components/chat-interface.tsx:62`, `src/app/api/chat/route.ts:47`

**Speaker notes:** *Saat demo, ketik soal dan biarkan AI streaming. Tunjukkan PING & LED berubah bila fallback.*

---

### SLIDE 13 — Pembahasan AI (Output Structure)
**Layout:** Contoh markdown output AI (4 heading)

**Konten:**
```
## 🎮 Skenario Game
  Layla butuh hitung jarak blink...

## 📝 Soal Asli
  Segitiga siku alas 3 tinggi 4, sisi miring?

## ⚔️ Langkah Penyelesaian
  1. Pythagoras √(3²+4²) = √25
  2. ...

## 💡 Jawaban Akhir
  5 satuan + KaTeX  $c = \sqrt{a^2+b^2}$
```

**File:** `src/app/api/chat/route.ts:27` (getSystemPrompt)

**Speaker notes:** *Tekankan: variabel/angka asli tidak diubah — hanya narasi yang digamifikasi.*

---

### SLIDE 14 — Boss Battle
**Layout:** Screenshot battle + HUD legend

**Visual:** `docs/images/boss-battle.png` (Prompt #7)

**Konten:**
```
Setup: Pilih Bos (King Al-Gebra, Grammar Dragon, Lord Newton, Doctor Mole) + Jenjang + Slider durasi 30-60s
Battle: Boss HP 100 + Hearts x3 + Combo x5 + Score + Timer bar + 4 opsi + feedback 1.7s
Menang: boss HP 0 atau semua soal dijawab → +15 per benar +25 boss defeated → grantXp
Kalah: hearts 0 → overlay “MISI GAGAL”

src/components/boss-battle.tsx:54  +  src/app/kuis/page.tsx:24
src/lib/quiz-bank.ts:14 (BOSSES) + /api/quiz generateObject fallback bank 24 soal
```

**Speaker notes:** *Demo 1 soal saja. Tunjukkan combo & HP berkurang. Jelaskan timer sfx tick saat ≤6 detik.*

---

### SLIDE 15 — Gamifikasi
**Layout:** Infografik XP + level curve

**Visual:** `docs/images/gamification.png` (Prompt #15)

**Konten:**
```
XP Rewards:
  Chat +10 | Quiz benar +15 | Boss defeated +25 | AR open +10 | Hotspots +15 | AR Quiz +20

Kurva Level: XP_next = level × 100  (src/lib/xp.ts:7, supabase-gamification.sql:7)
  Lv1 0 → Lv2 100 → Lv3 300 → Lv4 600 → Lv5 1000

Feedback: canvas-confetti (celebrate 90, levelUp 180+100+100) + sfx Web Audio (correct/wrong/levelup/win)
Sidebar XP bar: gradient + XP_EVENT dispatch (src/lib/xp-events.ts:12)
Misi AR cooldown 24 jam via localStorage
```

**Speaker notes:** *Tunjukkan XP bar di sidebar naik real-time saat demo. Jelaskan anti-farm cooldown.*

---

### SLIDE 16 — AR Lab Katalog
**Layout:** Grid screenshot + filter

**Visual:** `docs/images/ar-catalog.png` (Prompt #8)

**Konten:**
```
Grid 7 model + filter chips: Semua, Matematika, Fisika, Kimia, B.Inggris, Boss, Special
Kartu: poster + badge subject + badge kuning “Aset sementara” jika placeholder
Semua model <5 MB, <100k poly, teksur ≤2048px (AR_PLAN.md:62)

src/app/ar/page.tsx:15  +  src/components/ar-model-card.tsx
```

**Speaker notes:** *Scroll katalog, tap filter. Jelaskan 7 model yang ada dan mana yang placeholder.*

---

### SLIDE 17 — AR Viewer Detail
**Layout:** Screenshot viewer besar + legend hotspot

**Visual:** `docs/images/ar-viewer.png` (Prompt #9)

**Konten:**
```
<model-viewer> attrs: src glb, ios-src usdz, poster, ar/modes auto, camera-controls, autoplay, reveal auto
Progress bar + status “Memuat model 3D… N%” (progress event)
Hotspot: 44px dot, slot hotspot-i, visited hijau, active gold, default cyan glow
Kontrol: Putar/Jeda, Rotasi On/Off, dropdown animasi (jika >1 klip)
Panel anotasi glass min-h-20 aria-live polite
Defer load untuk model besar (Ryuri 11 MB → tombol “Muat Ryuri 3D”)
```

**File:** `src/components/ar-viewer.tsx:238`, `src/lib/ar-catalog.ts:54` (camera framing)

**Speaker notes:** *Demo putar model, ketuk hotspot 1-2-3. Tunjukkan control bar.*

---

### SLIDE 18 — Dua Mode AR
**Layout:** Split comparison

**Visual:** `docs/images/ar-modes.png` (Prompt #10)

**Konten:**
```
Native AR (OS)          |  Webcam AR (In-Browser)
Slot ar-button →        |  Tombol “Buka Kamera AR” →
Scene Viewer (Android)  |  WebcamArViewer modal fullscreen
Quick Look (iOS)        |  three.js + getUserMedia overlay
Paling stabil, OS handle|  Fallback untuk desktop / device tanpa ARCore/ARKit
Hotspot & kuis TIDAK ikut ke AR Quick Look — hanya di 3D viewer (by design)
```

**File:** `src/components/ar-viewer.tsx:284`, `src/components/webcam-ar-viewer.tsx`

**Speaker notes:** *Jelaskan perbedaan. Demo Native AR butuh HP fisik; jika tidak ada, pakai Webcam AR di laptop.*

---

### SLIDE 19 — Buku Mantra
**Layout:** Screenshot split list+detail

**Visual:** `docs/images/buku-mantra.png` (Prompt #11)

**Konten:**
```
List kiri (glass, scroll): badge subject•level, preview 2 line, date, trash → confirm Hapus/Batal
Detail kanan: Soal box + Pembahasan markdown+KaTeX (react-markdown + rehypeKatex) + Related 3D chips (getRelatedModels)
Query: supabase from chat_history where user_id = auth.uid order created_at desc
RLS: user hanya lihat miliknya

src/app/buku-mantra/page.tsx:30
```

**Speaker notes:** *Buka Buku Mantra, klik item terbaru, scroll pembahasan KaTeX, klik chip “Lihat Versi 3D” → navigasi ke AR.*

---

### SLIDE 20 — PWA & Offline
**Layout:** 3 phone mockups + SW diagram

**Visual:** `docs/images/pwa-install.png` (Prompt #13)

**Konten:**
```
Manifest: standalone, theme #0d9488, icons 192/512 maskable (src/app/manifest.ts:3)
Service Worker: gamifikathink-v2 + gamifikathink-models-v2 terpisah
  - navigate → network-first fallback cache "/"
  - /models/*.glb/*.usdz → cache-first
  - _next/static → stale-while-revalidate
  - /api/* & supabase → network-only (skip)
Install: PwaInstallButton (primary di landing, sidebar, icon variant collapsed)

public/sw.js:1
```

**Speaker notes:** *Demo install ke HP atau Chrome “Install app”. Tunjukkan offline: matikan wifi, refresh, halaman tetap terbuka.*

---

### SLIDE 21 — Desain JARVIS
**Layout:** Design system sheet

**Visual:** `docs/images/design-system.png` (Prompt #12)

**Konten:**
```
Tokens: --background #031312, --accent #2dd4bf, --gold #f6c453, --surface glass 60%
Utilities: .glass (blur 12px), .glass-strong, .glow-cyan, .text-gradient, .bg-grid 40px
Keyframes: fade-up, pulse-glow, spin-slow, shimmer, typing-dot — respect prefers-reduced-motion
Responsive: <768 drawer 85vw, 768-1024 collapse 64px, >1024 288px, h-[100dvh]
```

**File:** `src/app/globals.css:7`, `DESIGNREFACTOR.md:1`

**Speaker notes:** *Tekankan konsistensi: semua halaman pakai BackgroundFX yang sama (grid+orbs).*

---

### SLIDE 22 — Sidebar & Theme
**Layout:** Screenshot sidebar expanded vs collapsed

**Konten:**
```
Expanded 288px: logo glow + user card (avatar ring gradient + LV + XP bar) + nav 4 items + jenjang/mapel selector (hanya /arena) + SYS.ONLINE + Logout
Collapsed 64px: icon-only + ThemeToggle + PwaInstall icon
Mobile: drawer overlay blur + MobileMenuTrigger hamburger
ThemeToggle Sun/Moon rotate/scale, next-themes persist localStorage, default dark
```

**File:** `src/components/sidebar.tsx:50`, `src/components/theme-toggle.tsx`

**Speaker notes:** *Demo collapse di desktop, lalu resize ke mobile.*

---

### SLIDE 23 — Basis Data
**Layout:** ER diagram sederhana (2 tabel)

**Konten:**
```
profiles (id PK FK auth.users, email, display_name, avatar_url, level 1, xp 0)
  ↳ trigger handle_new_user on auth.users insert

chat_history (id PK uuid, user_id FK, subject, level, question, answer markdown, engine_used, created_at)
  ↳ index user_id + created_at desc
  ↳ RLS: view/insert/delete own only

RPC add_xp(amount) → {xp, level, leveled_up}  (loop while xp >= level*100)
```

**File:** `supabase-schema.sql:11`, `supabase-gamification.sql:8`

**Speaker notes:** *Jelaskan kenapa xp disimpan sebagai xpIntoLevel bukan total — untuk progress bar.*

---

### SLIDE 24 — API & AI Prompt
**Layout:** 2 kartu code snippet

**Konten:**
```
POST /api/chat  → streamText google(gemini-3.5-flash) → fallback chatanywhere(gpt-3.5-turbo)
  body: {messages, subject, level, imageBase64}  header: x-engine-used primary/fallback
  systemPrompt 4 heading: Skenario Game, Soal Asli, Langkah, Jawaban (src/app/api/chat/route.ts:14)

POST /api/quiz → generateObject gemini-3.5-flash zod 5 soal → fallback getFallbackQuestions (24 soal)
```

**Speaker notes:** *Tunjukkan header x-engine-used di Network tab — bukti dual engine.*

---

### SLIDE 25 — Menambah Model AR (Untuk Admin)
**Layout:** 6-step flowchart

**Visual:** `docs/images/ar-workflow.png` (Prompt #14)

**Konten:**
```
1 Unduh mentah → /tmp/ar-raw/<id>/ + catat lisensi
2 Optimasi → Blender/gltfpack → target <5 MB
3 Konversi iOS → glb→usdz (USDZExporter quickLookCompatible) → curl -I cek MIME
4 Poster → screenshot 45° → poster-v2.png
5 Hotspot → modelviewer.dev/editor → copy position/normal (jangkar di udara luar mesh)
6 Daftar → tambah object di src/lib/ar-catalog.ts:66 + naik versi file + naik CACHE sw.js

Jangan lupa placeholderAssets flag bila aset belum final!
```

**Speaker notes:** *Ini untuk juri teknis. Tekankan “tanpa ubah komponen viewer”.*

---

### SLIDE 26 — Contoh Katalog Saat Ini
**Layout:** Tabel 7 baris (ringkas)

**Konten:**
```
Kubus Rubik 3×3 (Math) — Sisi/Rusuk/Sudut — Animation — ✅ final 1.2 MB
Grammar Dragon (Boss) — Head/Body/Wing vocab — Take 001 — ✅ 5.97 MB
Molekul H2O (Kimia) — O/H/Sudut 104.5° — ✅ v2
Magnet Batang (Fisika) — U/S/Medan — ✅ v2
Bandul (Fisika) — Gantung/Tali/Beban — ✅ v2
Castle (B.Inggris) — Keep/Turret/Gate vocab — ✅ v2
Ryuri Spirit (Special) — Karakter/Aura — 4 anim Idle/Run — deferLoad, framing custom
```

**Speaker notes:** *Sebutkan mana yang sudah foto-real dan mana yang masih butuh USDZ asli.*

---

### SLIDE 27 — Keamanan & Privasi
**Layout:** 3 bullets + shield icon

**Konten:**
```
RLS: user hanya akses data sendiri (policies di supabase-schema.sql:63)
SECURITY DEFINER terbatas + search_path = '' (anti search_path hijack)
<model-viewer> tidak minta getUserMedia sendiri — kamera hanya dibuka OS native AR
Upload model masa depan: validasi magic bytes + batas size + bucket privat + signed URL (AR_PLAN.md:216)
```

**Speaker notes:** *Jawab kekhawatiran ortu: “Aplikasi tidak akses kamera kecuali user tekan AR.”*

---

### SLIDE 28 — Performa
**Layout:** 3 metrics

**Konten:**
```
Model <5 MB (ideal 1-3 MB), halaman /ar tanpa buka model <1 MB JS + poster
dynamic(ssr:false) untuk viewer, katalog hanya poster (lazy)
SW cache-first untuk model, immutable header 1 tahun + versioned URL (model-v2.glb)
Lighthouse PWA: manifest + icons + SW hijau
```

**Speaker notes:** *Sebutkan dragon 5.97 MB pengecualian tapi masih <8 MB batas tolak; tanpa Draco karena butuh decoder CDN.*

---

### SLIDE 29 — Troubleshooting Cepat (Cadangan bila demo error)
**Layout:** Tabel 3 baris

**Konten:**
```
Model hanya poster/cincin → hard refresh Ctrl+Shift+R (SW chunk lama)
AR gagal → banner “Native AR tidak tersedia — gunakan Kamera AR Web”
Chat fallback amber → normal jika quota Gemini habis, tetap jalan via GPT-3.5
```

**Speaker notes:** *Simpan slide ini sebagai “plan B” — jangan ditampilkan kecuali error.*

---

### SLIDE 30 — Dampak & Testimoni (Opsional)
**Layout:** Quote + stats

**Konten:**
```
“Dulu takut Fisika, sekarang nagih lawan Lord Newton!” — Siswa SMA (contoh)
“Anak saya jadi mau latihan soal tiap malam demi naik level.” — Orang tua (contoh)

Metrik yang bisa diukur next: retention, avg session, quiz accuracy, XP/week
```

**Speaker notes:** *Ganti dengan testimoni asli bila sudah ada user test. Jika belum, pakai proyeksi.*

---

### SLIDE 31 — Roadmap
**Layout:** Timeline 3 fase

**Konten:**
```
Fase 0 ✅  Bukti pipeline 2 model (kubus+dragon) — DONE 2026-09-16
Fase 1 ✅  MVP 7 model + kuis + misi XP — DONE 2026-09-17 (sisa uji HP fisik)
Fase 2 ⏳  AI auto-suggest model + audio TTS per hotspot + Supabase Storage CDN
Fase 3 🔮  Marker scan kartu mantra (MindAR) + Boss AR interaktif + Dashboard guru + Leaderboard
```

**File:** `AR_PLAN.md:250`

**Speaker notes:** *Tekankan Fase 1 sudah siap demo; Fase 2 butuh feedback juri.*

---

### SLIDE 32 — Kompetitor & Diferensiasi
**Layout:** 2x2 matrix

**Konten:**
```
                AR             Tanpa AR
Gamifikasi  [GAMIFIKATHINK]   Quizizz, Kahoot
Non-gam     AR CoSpace        Ruangguru, Zenius
                            → Kami satu-satunya: gamifikasi + AI narasi + AR native tanpa SDK berbayar
```

**Speaker notes:** *Jelaskan positioning: bukan ganti Ruangguru, tapi “lapisan motivasi” di atas materi.*

---

### SLIDE 33 — Tim & Peran
**Layout:** Foto + role (ganti dengan tim asli)

**Konten:**
```
[Foto]  Ketua — Product & AR Pipeline
[Foto]  Developer — Next.js + Supabase
[Foto]  Desainer — JARVIS Theme + 3D
[Foto]  Content — Bank Soal + Narasi Game
```

**Speaker notes:** *Perkenalkan tim 10 detik per orang. Jika solo, ganti jadi “Solo developer + AI pair programming”.*

---

### SLIDE 34 — Demo Live Checklist
**Layout:** Checklist besar (untuk presenter, hidden dari audiens bila print handout)

**Konten:**
```
□ Buka landing → klik Masuk ke Arena
□ Pilih Matematika SMA → tap quick chip → lihat streaming KaTeX
□ Upload foto soal (siapkan foto di HP)
□ Buka Boss Battle → 1 soal → tunjukkan HP/Combo/XP
□ Buka AR Lab → filter Fisika → buka Bandul → ketuk hotspot
□ Buka Kamera AR → tunjukkan overlay (atau Native AR bila ada HP)
□ Buka Buku Mantra → lihat related 3D chips
□ Tunjukkan XP bar naik + confetti
□ Install PWA (jika HP tersedia)
```

**Speaker notes:** *Slide ini untuk gladi. Sembunyikan saat presentasi final atau jadikan speaker notes.*

---

### SLIDE 35 — Penutup & Call to Action
**Layout:** Full-bleed team/celebration + CTA buttons

**Visual:** `docs/images/team-closing.png` (Prompt #16)

**Konten:**
```
Terima kasih! 🙏

GAMIFIKATHINK — Belajar Jadi Game Epik

[Button] Coba Sekarang: https://domain.vercel.app
[Button gold] Kunjungi Rintis Nalar Learning Center
[QR Code]  (generate dari URL deploy)

Kami siap bawa ke sekolah-sekolah — mari gamifikasi pendidikan Indonesia!
```

**Speaker notes:** *Akhiri dengan ajakan: “Scan QR, coba AR dragon di meja juri sekarang.” Beri jeda untuk tanya jawab.*

---

### SLIDE 36 — Lampiran / Q&A
**Layout:** Minimal — judul besar + kontak

**Konten:**
```
Q & A

Repo: github.com/xxx/gamifikathink
Docs: MANUALBOOK.md (lengkap 14 bab)
Kontak: email / WA

Backup slides (hidden, tampil bila ditanya):
- Skema DB SQL lengkap
- Header curl -I untuk .glb/.usdz
- Prompt AI system lengkap
```

**Speaker notes:** *Siapkan jawaban untuk: biaya, privasi, offline, tambah mapel, lisensi model.*

---

## Lampiran Slide — Prompt Gambar Lengkap

Salin dari MANUALBOOK BAB 14 (15 prompt). Simpan di `docs/images/` dan import ke slides sebagai background. Untuk QR Code slide 35, generate di https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://domain.vercel.app

## Checklist Export

- [ ] Generate 15 gambar via prompt
- [ ] Import ke Google Slides (File → Import → Upload)
- [ ] Set master slide: bg `#031312`, grid overlay 6%, orb blur
- [ ] Terapkan `.glass` style ke semua kartu (di Slides: fill white 10% + blur + border cyan 15%)
- [ ] Tambahkan animasi: fade-up 0.3s untuk bullet masuk, pulse-glow untuk LED
- [ ] Rehearse 20 menit + 5 menit demo + 5 menit Q&A
- [ ] Export PDF handout (2 slides/page) untuk juri
- [ ] Siapkan video rekaman demo sebagai backup bila wifi bermasalah
- [ ] Test AR di HP Android + iOS nyata sebelum hari H (bawa 2 HP)
