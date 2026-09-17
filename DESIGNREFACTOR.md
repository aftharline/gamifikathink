# DESIGNREFACTOR.md — Interface Redesign "JARVIS STYLE"

> Refactor besar tampilan GAMIFIKATHINK dari tema gaming gelap biasa menjadi **holographic AI interface ala JARVIS (Iron Man)** — premium, futuristic, glassy, dan responsif.

---

## 1. Vision & Aesthetic

### 1.1 Konsep Utama
- **Look & feel:** HUD canggih JARVIS di dalam Iron Man suit — gelap, glassy, neon cyan, holographic.
- **Mood:** "Kamu sedang berada di dalam AI cockpít yang hidup."
- **Efek khas:** glassmorphism, glow neon, grid futuristik, scanline halus, partikel, animasi transisi halus.
- **Tetap edukatif:** elemen game (level, XP, hero) dipertahankan sebagai bagian HUD.

### 1.2 Pilar Desain (4 P)
1. **Premium** — spacing konsisten, micro-interaction halus, tidak ada elemen "mentah".
2. **Glassy** — panel transparan dengan `backdrop-blur`, border tipis, shadow lembut.
3. **Glowing** — aksen neon cyan sebagai signature color, bukan sekadar warna indigo polos.
4. **Layered** — hierarki jelas: background → surface → elevated (modals) → overlay.

---

## 2. Color System (Dark & Light Mode)

### 2.1 Dark Mode (Default — "JARVIS Night")
| Token | Hex | Penggunaan |
|---|---|---|
| `--background` | `#05060a` | Latar utama (hampir hitam kebiruan) |
| `--surface` | `#0b0e15 / 60%` | Panel glass (dengan blur) |
| `--surface-2` | `#111522 / 70%` | Card, sidebar |
| `--border` | `rgba(56, 189, 248, 0.15)` | Border glass, subtle glow |
| `--accent` | `#22d3ee` (cyan-400) | Warna utama JARVIS — tombol, link, LED |
| `--accent-2` | `#818cf8` (indigo-400) | Sekunder, gradient partner |
| `--text-primary` | `#e8edf4` | Teks utama |
| `--text-secondary` | `#8b95a7` | Teks sekunder |
| `--text-muted` | `#5b6472` | Placeholder, label kecil |
| `--success` | `#34d399` | LED primary engine |
| `--warning` | `#fbbf24` | LED fallback engine |
| `--danger` | `#f87171` | Error, delete |

**Gradient signature:** `linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)` — dipakai di tombol utama, logo, progress bar.

### 2.2 Light Mode ("JARVIS Day")
| Token | Hex | Penggunaan |
|---|---|---|
| `--background` | `#eef2f7` | Latar utama (abu-biru muda) |
| `--surface` | `rgba(255,255,255,0.7)` | Panel glass (blur) |
| `--surface-2` | `rgba(255,255,255,0.85)` | Card, sidebar |
| `--border` | `rgba(37, 99, 235, 0.12)` | Border glass |
| `--accent` | `#0891b2` (cyan-600) | Tombol, link (kontras aman) |
| `--accent-2` | `#6366f1` (indigo-500) | Sekunder |
| `--text-primary` | `#0f172a` | Teks utama |
| `--text-secondary` | `#475569` | Teks sekunder |
| `--text-muted` | `#94a3b8` | Placeholder |

> **Aturan:** semua komponen WAJIB membaca CSS variables — tidak boleh ada warna hex hardcoded di komponen (kecuali gradient signature yang sama untuk kedua mode).

---

## 3. Typography

- **Sans (utama):** `Space Grotesk` untuk heading (futuristik, karakter game-tech), `Inter` untuk body (legibility). *(Ganti font Google di `layout.tsx`)*
- **Mono (kode & rumus):** `JetBrains Mono` — tetap dipakai untuk `code`, `pre`, angka statistik, dan label teknis.
- **Skala:**
  - Hero / Landing title: `text-5xl md:text-7xl font-bold tracking-tight`
  - Halaman title: `text-2xl font-semibold`
  - Judul section: `text-sm font-semibold uppercase tracking-[0.2em]` (label HUD)
  - Body: `text-sm`
  - Micro (LED, timestamps): `text-[10px] tracking-wider uppercase`
- **Efek teks:** heading bisa pakai `bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400` untuk aksen.

---

## 4. Design Tokens & Base

### 4.1 Glass Surface (Utility `glass`)
```css
.glass {
  background: var(--surface);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid var(--border);
}
.glass-strong {
  background: var(--surface-2);
  backdrop-filter: blur(20px) saturate(160%);
  border: 1px solid var(--border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}
```

### 4.2 Glow (Utility `glow`)
```css
.glow-cyan { box-shadow: 0 0 20px rgba(34, 211, 238, 0.25), 0 0 60px rgba(34, 211, 238, 0.1); }
.glow-text-cyan { text-shadow: 0 0 12px rgba(34, 211, 238, 0.5); }
```
- Tombol utama: `bg-gradient-to-r from-cyan-500 to-indigo-500 + glow-cyan + hover:brightness-110`
- Hover: intensity glow naik (`hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]`)

### 4.3 Background Layers (Halaman Utama)
1. `bg-[--background]` solid
2. **Grid futuristik** (fixed, pointer-events-none):
   ```css
   .bg-grid {
     background-image:
       linear-gradient(to right, rgba(34, 211, 238, 0.05) 1px, transparent 1px),
       linear-gradient(to bottom, rgba(34, 211, 238, 0.05) 1px, transparent 1px);
     background-size: 40px 40px;
   }
   ```
3. **Glow orbs** (blob blur besar di pojok, subtle, animated pulse 8s infinite):
   - kiri-atas: cyan `blur-3xl opacity-20`
   - kanan-bawah: indigo `blur-3xl opacity-20`
4. **Scanline** opsional (subtle, 6px stripe bergerak vertikal, opacity 0.03) — default OFF, toggle di settings.

### 4.4 Radius & Spacing
- Radius konsisten: `rounded-xl` (card), `rounded-2xl` (panel besar), `rounded-full` (pills/LED).
- Spacing base 4px, section 24–32px.
- Page max-width: `max-w-5xl` untuk konten, `max-w-3xl` untuk chat thread.

---

## 5. Component Redesign

### 5.1 Sidebar (HUD Panel)
- **Style:** `glass` penuh, border-right `var(--border)`, tidak ada warna solid.
- **Header:** Logo dengan **Arc Reactor ring** (lingkaran gradient berputar perlahan `animate-spin-slow`) + nama app dengan `glow-text-cyan`.
- **User card:** avatar dengan ring gradient cyan; nama + level dengan XP progress bar tipis (gradient cyan→indigo, `h-1 rounded-full`).
- **Nav items:** active state = pill glass + glow kiri (`border-l-2 border-cyan-400`) + icon menyala; hover = `bg-white/5`.
- **Selector kelas/mapel:** chip glass dengan icon; active = ring cyan + glow.
- **Riwayat:** item dengan hover reveal delete icon.
- **Collapse:** di desktop bisa collapse ke `w-16` (icon-only) — tombol di header sidebar.
- **Mobile:** drawer full-width `w-[85vw] max-w-sm` dengan overlay blur `backdrop-blur-sm bg-black/40`.

### 5.2 Chat Interface
- **Header chat:** sticky, `glass`, judul mapel dengan icon glow; kanan: **engine LED + live status** (`PING 42ms` ala HUD, update real-time), tombol "+ Baru".
- **Bubble user:** `bg-gradient-to-r from-cyan-500/20 to-indigo-500/20`, border cyan/30, align kanan.
- **Bubble AI:** `glass-strong`, border `--border`, rounded `rounded-2xl rounded-tl-md`.
- **LED indicator per bubble AI:** dot pulsing (animate-pulse) — cyan = primary, amber = fallback. Label kecil mono: `GEMMI-2.5.FLASH` / `GPT-3.5`.
- **Streaming animation:** cursor khas JARVIS `▍` berkedip saat AI mengetik; bubble AI muncul dengan fade+slide-in `animate-fade-up`.
- **Empty state (belum ada chat):** logo arc reactor besar dengan pulse glow + teks instruksi + 3 saran soal cepat (quick chips).
- **Typing indicator:** 3 titik cyan yang memantul di bubble AI saat loading awal.

### 5.3 Input Area (Command Deck)
- **Container:** `glass` rounded-2xl dengan glow saat focus-within (`focus-within:glow-cyan`).
- **Textarea:** transparan penuh (tanpa border box sendiri), placeholder `text-muted`.
- **Tombol send:** circular `h-11 w-11`, gradient cyan→indigo, icon Send, glow; disabled state: opacity-30.
- **Image upload:** tombol ghost icon kamera; preview gambar muncul sebagai thumbnail glass dengan tombol remove.
- **Karakter count + status engine** di kiri bawah input (micro text mono).

### 5.4 Buttons & Chips
| Variant | Style |
|---|---|
| `primary` | Gradient cyan→indigo, glow, rounded-xl, hover:brightness-110 + shadow naik |
| `ghost` | Transparan, text-secondary, hover:text-primary + bg-white/5 |
| `outline` | Border cyan/30, text cyan, hover:glow subtle |
| `danger` | text-red-400, hover:bg-red-500/10 |
| Quick chip | Pill `glass` text-xs, hover:border-cyan-400/50 + text-cyan |

### 5.5 Landing Page (Hero JARVIS)
- Full-screen, background grid + orbs + partikel (CSS-only, tanpa library).
- **Arc Reactor logo** di tengah atas: lingkaran concentric dengan gradient cyan → outer ring berputar (`animation: spin 12s linear infinite`).
- **Title:** gradient text, `text-6xl md:text-8xl`, dengan glitch/shimmer subtle (CSS keyframes, tidak perlu library).
- **Status bar HUD:** di pojok bawah — `SYS.ONLINE // ENGINES: DUAL // MODEL: GEMINI-2.5-FLASH` mono micro, blinking cursor.
- **Feature cards:** glass dengan icon glow, hover translate-y-[-4px] + glow.

### 5.6 Buku Mantra (History)
- List item: glass card, hover border-cyan, preview 2 line.
- Detail: layout 2 kolom (Soal / Pembahasan) di desktop; stacked di mobile.
- Delete: muncul saat hover, konfirmasi pakai dialog glass.
- Empty state: arc reactor kecil + "Belum ada mantra tersimpan".

### 5.7 Login Page
- Card glass center `w-full max-w-md`, glow ring saat focus.
- Google button: outline glass + logo G asli (SVG inline, bukan icon generic).
- Divider: `--- ATAU ---` mono micro.
- Background sama (grid + orbs) supaya konsisten.

### 5.8 Modals & Toasts
- Dialog: `glass-strong rounded-2xl glow` + overlay blur.
- Toast (sonner): style glass, border cyan/20, icon LED sesuai tipe; posisi bottom-right; muncul dengan slide-in.

---

## 6. Animations (semua CSS-only, tanpa Framer Motion untuk MVP)

```css
/* registrasi keyframes di globals.css */
@keyframes fade-up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse-glow { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }
@keyframes spin-slow { to { transform: rotate(360deg); } }
@keyframes blink-cursor { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
```

| Elemen | Animasi |
|---|---|
| Bubble AI baru | `fade-up 0.3s ease-out` |
| LED engine | `pulse-glow 2s infinite` |
| Arc reactor | `spin-slow 12s linear infinite` |
| Typing cursor | `blink-cursor 1s steps(1) infinite` |
| Title shimmer | `shimmer 6s linear infinite` |
| Page transition | fade 200ms |
| Hover card | `transition-all duration-300 translate-y-[-4px]` |
| Mobile drawer | slide-in 300ms `ease-out` |

- **Respect `prefers-reduced-motion`:** media query mematikan semua animasi dekoratif.

---

## 7. Responsive Strategy

### 7.1 Breakpoints
| Breakpoint | Behavior |
|---|---|
| `< 768px (mobile)` | Sidebar = drawer (toggle icon di top-left); chat penuh; input bottom-fixed; landing 1 kolom |
| `768–1024px (tablet)` | Sidebar collapse ke icon-only `w-16`; konten `max-w-2xl` |
| `> 1024px (desktop)` | Sidebar penuh `w-72` (collapse-able); konten `max-w-3xl` |

### 7.2 Layout Utama (Arena)
```
┌────────────┬──────────────────────────────┐
│            │  Header (glass, sticky)      │
│  Sidebar   ├──────────────────────────────┤
│  (glass,   │  Messages (scroll area)      │
│  scroll)   ├──────────────────────────────┤
│            │  Input Deck (glass, focus    │
│            │  glow)                       │
└────────────┴──────────────────────────────┘
```
- Tinggi: `h-[100dvh]` (mobile address-bar safe).
- Sidebar: `h-full overflow-y-auto`; chat area: flex-1 + `min-h-0` (scroll internal).

### 7.3 Mobile Spesifik
- Input Deck: `pb-[env(safe-area-inset-bottom)]`.
- Touch target minimum 44px.
- Sidebar drawer + overlay click-to-close.
- Font chat: `text-[15px]` biar enak dibaca.

---

## 8. Theme System (Dark/Light Toggle)

### 8.1 Setup
- Sudah pakai `next-themes` (di `providers.tsx`) — **ubah** dari `forcedTheme="dark"` menjadi **unforced**:
  ```tsx
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
  ```
- CSS variables mode: define ulang variable yang sama di dalam `.dark` dan `:root` (atau `html[data-theme]`). Tailwind v4: pakai `@custom-variant dark (&:where(.dark, .dark *));` supaya utility `dark:` berfungsi.

### 8.2 Toggle Button
- Lokasi: header sidebar + header chat (icon `Sun`/`Moon` dari lucide).
- Animasi: icon rotate/scale saat berganti (`transition-transform duration-300`).
- Persistensi: otomatis oleh `next-themes` (localStorage).
- Default: dark (sesuai brand), tapi ikuti `prefers-color-scheme` kalau user belum pernah pilih.

### 8.3 Checklist Adaptasi
- [ ] Semua komponen sudah menggunakan CSS variables / utility theme-aware.
- [ ] KaTeX (rumus) kontras di kedua mode (katex CSS scoped di `.dark .katex`).
- [ ] Markdown code block bg menyesuaikan (`dark:bg-zinc-900`).
- [ ] Glass effect tetap terlihat di light mode (border lebih gelap, shadow lebih soft).
- [ ] Glow dikurangi intensity di light mode (`light` mode: opacity glow dikali 0.4).

---

## 9. File Changes Plan

```
src/
├── app/
│   ├── layout.tsx                → + Space Grotesk font, meta theme-color
│   ├── globals.css               → + tokens dark/light, glass, glow, grid, keyframes, scrollbar
│   └── page.tsx                  → REDESIGN hero JARVIS
├── components/
│   ├── providers.tsx             → hapus forcedTheme, theme toggle context
│   ├── background-fx.tsx         → NEW: grid + orbs + scanline layer
│   ├── arc-reactor.tsx           → NEW: logo animasi
│   ├── theme-toggle.tsx          → NEW: tombol dark/light
│   ├── sidebar.tsx               → REDESIGN glass + collapse + drawer
│   ├── chat-interface.tsx        → REDESIGN header HUD + input deck
│   ├── chat-message.tsx          → REDESIGN bubble + LED + streaming cursor
│   ├── engine-led.tsx            → NEW: dot LED reusable
│   ├── ui/button.tsx             → variabel baru (gradient, glow) via CSS vars
│   ├── ui/input.tsx, card.tsx, etc. → adjust ke tokens baru
├── lib/
│   └── theme.ts                  → NEW: helper theme (opsional)
```

---

## 10. Acceptance Criteria (DoD)

- [ ] Tidak ada background putih di dark mode; semua panel glass/blur.
- [ ] Light mode lengkap & kontras cukup (WCAG AA untuk teks body).
- [ ] Toggle dark/light berfungsi di semua halaman tanpa flicker.
- [ ] Tampilan desktop, tablet, mobile rapi; tidak ada horizontal scroll.
- [ ] Chat bubble AI: markdown + rumus KaTeX tetap bagus di kedua mode.
- [ ] LED engine terlihat jelas (cyan/amber + pulse).
- [ ] Animasi halus (max 300ms) dan non-blocking.
- [ ] Semua halaman memakai background-fx yang sama (konsisten).
- [ ] Build & typecheck lolos.

---

## 11. Urutan Pengerjaan (Backlog)

| # | Task | Prioritas |
|---|---|---|
| 1 | Tokens warna + globals.css (dark/light, glass, glow, grid, keyframes) | 🔴 |
| 2 | Theme toggle (next-themes unforced + tombol) | 🔴 |
| 3 | Background FX layer (grid + orbs) di semua halaman | 🔴 |
| 4 | Sidebar redesign (glass, collapse, drawer) | 🔴 |
| 5 | Chat interface redesign (header HUD, input deck, LED) | 🔴 |
| 6 | Chat bubble redesign (markdown styling polish, cursor) | 🟡 |
| 7 | Landing page hero JARVIS | 🟡 |
| 8 | Buku Mantra + Login restyle | 🟡 |
| 9 | Buttons/inputs/UI kit adjust ke tokens baru | 🟡 |
| 10 | Responsive polish + reduced-motion + QA | 🟢 |

---
*Referensi visual: Iron Man JARVIS HUD, Windows Fluent (glass), Vercel Geist (typography).*
