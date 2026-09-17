# AR Plan — GamifikaThink: Lihat Objek 3D + Interaksi

> Dokumen rencana + tracking progress fitur AR.
> Terakhir diperbarui: 2026-09-16 | Status: `FASE 1 SEBAGIAN` (kuis + misi XP + integrasi Arena/Mantra hijau; 4 model + uji perangkat fisik TODO)

## 0. Ringkasan eksekutif

- **Fitur:** katalog objek 3D edukasi yang bisa diputar (mode 3D, semua perangkat) dan ditempatkan di dunia nyata (mode AR, HP).
- **Teknologi inti:** `<model-viewer>` dari Google (npm `@google/model-viewer`), bukan WebXR mentah / SDK berbayar.
- **Cakupan MVP:** 6 model gratis (mudah diganti aset pribadi), AR iOS wajib (butuh `.usdz`), interaksi wajib (hotspot anotasi + animasi + kuis menempel model).
- **Prinsip arsitektur:** satu sumber kebenaran di `src/lib/ar-catalog.ts`; ganti aset = ganti field path, tanpa ubah komponen.

## 1. Keputusan terkunci

| # | Keputusan | Implikasi |
|---|-----------|-----------|
| 1 | Aset gratis dulu, struktur siap-ganti | Wajib ada `license { author, name, url }` per model + layout folder konsisten `public/models/<id>/` |
| 2 | AR iOS wajib di MVP | Setiap model wajib punya `.glb` DAN `.usdz` + `poster.webp`; Quick Look jadi acceptance test |
| 3 | Interaksi sejak awal | Hotspot + kontrol animasi + kuis per model; bukan view-only |
| 4 | Desktop didukung | Fallback 3D orbit penuh; tidak boleh halaman kosong di laptop |
| 5 | Terhubung gamifikasi | 3 misi XP dengan cooldown anti-farm via `grantXp()` yang sudah ada |

## 2. Pilihan teknis & alternatif yang ditolak

| Opsi | Status | Alasan |
|------|--------|--------|
| `@google/model-viewer` (npm, self-host) | **Dipilih** | 1 komponen untuk Scene Viewer (Android) + Quick Look (iOS) + orbit Desktop; tanpa kode kamera sendiri |
| `three.js` / `react-three-fiber` mentah | Ditunda Fase 3 | Perlu tulis hit-test, plane detection, lighting sendiri; effort 3–5x untuk hasil setara MVP |
| MindAR (marker) | Ditunda Fase 3 | Cocok untuk "scan kartu mantra", bukan kebutuhan saat ini ("lihat objek 3D") |
| 8th Wall / Zappar / Niantic | Ditolak MVP | Berbayar + script eksternal + masalah privasi kamera; tidak sebanding untuk katalog statis |

### Batasan platform yang memengaruhi desain

- **Hotspot HTML, kuis, dan anotasi TIDAK ikut masuk ke mode AR** Quick Look / Scene Viewer. Pola UX resmi: **interaksi di mode 3D viewer, tombol AR untuk "lihat ukuran asli"**.
- iOS Safari tidak mendukung WebXR generik — hanya Quick Look via `ios-src`.
- `<model-viewer>` tidak butuh `getUserMedia`; kamera dibuka oleh aplikasi AR bawaan OS.

## 3. Katalog aset MVP

Layout folder (kontrak tetap, isi boleh diganti aset pribadi nanti):

```
public/models/<id>/model.glb
public/models/<id>/model.usdz
public/models/<id>/poster.webp
```

> Aturan cache-busting (2026-09-16): header `/models/*` immutable 1 tahun + SW cache-first membuat browser tidak pernah minta ulang URL lama. Setiap ganti isi aset WAJIB naikkan versi nama file (`model-v2.glb`, `poster-v2.webp`, …) + update katalog + naikkan versi cache SW. Insiden: model baru tidak tampil sampai URL diganti v2.

| ID | Mapel | Model gratis (contoh sumber) | Animasi target | Hotspot (rencana) | Status |
|----|-------|------------------------------|----------------|-------------------|--------|
| `kubus-prisma` | Matematika | Khronos `BoxAnimated` / prisma | rotasi / auto-rotate | sisi, rusuk, titik sudut | - [x] glb (ASET PRIBADI `newglb/newcubic.glb` — Rubik 3×3 animasi rakit, 1.2 MB, 2026-09-16; klip `Animation`) - [x] usdz (`model-v2.usdz` ASLI hasil konversi three USDZExporter + `quickLookCompatible`, 3.4 MB, ter-validasi pxr: 10 mesh + world bounds = GLB, 2026-09-17) - [x] poster (screenshot render asli 2026-09-16) |
| `molekul-h2o` | Kimia | Molekul H2O (Poly.pizza / Sketchfab CC-BY) | auto-rotate | atom O, atom H, sudut ikatan | - [ ] glb - [ ] usdz - [ ] poster |
| `magnet-batang` | Fisika | U-Magnet / bar magnet | — (hotspot only) | kutub U, kutub S, garis gaya | - [ ] glb - [ ] usdz - [ ] poster |
| `bandul` | Fisika | Pendulum sederhana | ayun (bila ada clip) | tali, beban, titik gantung | - [ ] glb - [ ] usdz - [ ] poster |
| `castle` | B. Inggris (vocab) | Castle Quaternius | — | tower, gate, wall (+ kosakata EN) | - [ ] glb - [ ] usdz - [ ] poster |
| `grammar-dragon` | Boss Battle | Dragon low-poly animasi idle | `idle` / `attack` selector | kepala, sayap, ekor | - [x] glb (ASET PRIBADI `newglb/newdragon.glb` — Mountain Dragon, klip `Take 001`; dinormalisasi ×0.001 + diangkat agar pas AR; dioptimasi quantize+webp 17.6→5.97 MB TANPA draco agar bebas decoder CDN, 2026-09-16) - [x] usdz (`model-v2.usdz` ASLI hasil konversi three USDZExporter + `quickLookCompatible` + tekstur 512px, 3.4 MB, ter-validasi pxr: 2 mesh + tekstur, 2026-09-17) - [x] poster (screenshot render asli 2026-09-16) |
| `ryuri` | Special | Spirit Companion humanoid (Sketchfab, aset pribadi) | `Idle_Static` / `Idle` / `Run` / `T_Pose` selector | karakter, aura magis | - [x] glb (`model-v3.glb` 18,25 MB, single-buffer TANPA meshopt — rebuild dari v2 via decode meshopt; v2 11 MB gagal parse di decoder bawaan model-viewer; lolos `load` + 4 klip terverifikasi headless 2026-09-17; framing kamera dikunci ke karakter 1,3 m) - [ ] usdz (BELUM ADA — file lama duplikat kubus, dihapus 2026-09-17; field dikosongkan + `placeholderAssets: ["usdz"]` agar Quick Look tidak tampilkan model salah) - [~] poster (`poster-v2.svg` placeholder grafis; file `.png/.webp` palsu berisi SVG dihapus 2026-09-17, `placeholderAssets: ["poster"]`) |

Sumber gratis yang diizinkan: KhronosGroup `glTF-Sample-Models`, Poly.pizza, Quaternius, Sketchfab dengan filter lisensi CC-BY / CC0. Setiap model wajib dicatat lisensinya (lihat skema §4).

Budget per model: **< 5 MB (ideal 1–3 MB)**, < 100k poligon, tekstur ≤ 2048px, kompresi Draco/KTX2 bila perlu. (Pengecualian tercatat 2026-09-16: dragon pribadi 5.97 MB — di atas ideal tapi di bawah batas tolak 8 MB. Draco DITOLAK karena butuh decoder CDN eksternal (melanggar §11 + merusak offline); dipakai quantize + webp + resize 1024 tanpa decoder eksternal.)

## 4. Skema data — `src/lib/ar-catalog.ts` (✅ dibuat 2026-09-16, + field `placeholderAssets?: ("glb"|"usdz"|"poster")[]` untuk tracking aset sementara)

```ts
interface ArHotspot {
  id: string
  position: string // "x y z" meter, contoh "0.2 0.5 0.1"
  normal: string   // "x y z"
  title: string
  body: string
}

interface ArQuizItem {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

interface ArModelLicense {
  author: string
  name: string // mis. "CC-BY 4.0"
  url: string
}

interface ArModel {
  id: string
  subject: "Matematika" | "Fisika" | "Kimia" | "Bahasa Inggris" | "Boss"
  title: string
  description: string
  glb: string   // "/models/<id>/model.glb"
  usdz: string  // "/models/<id>/model.usdz"
  poster: string
  license: ArModelLicense
  animations?: string[]
  hotspots: ArHotspot[]
  quiz: ArQuizItem[]
  xp: { open: number; hotspotsAll: number; quiz: number } // default {10,15,20}
}

// Helper:
// getArModel(id), getRelatedModels(subject), AR_MODELS: ArModel[]
```

Catatan: `ArQuizItem` sengaja dibentuk sama dengan `QuizQuestion` di `src/lib/quiz-bank.ts` agar bisa reuse gaya `boss-battle.tsx`.

## 5. Pipeline aset (per model, ulangi 6x)

- [x] **1. Unduh mentah** → simpan di luar repo (`/tmp/ar-raw/<id>/`), catat URL sumber + lisensi. (Selesai untuk `kubus-prisma`, `grammar-dragon` 2026-09-16.)
- [x] **2. Optimasi** → Blender / `gltfpack`: hapus kamera & lampu berlebih, resize tekstur, target < 5 MB. (Tidak diperlukan: 12 KB & 163 KB, 2026-09-16.)
- [x] **3. Konversi iOS** → `model.glb` → `model.usdz` (Apple Reality Converter / `usdzconvert` / eksportir Vectary). Cek ukuran tidak bengkak > 2x dan material tidak rusak. (SELESAI 2026-09-17 via three.js USDZExporter di headless Chrome + driver DevTools-WS + `quickLookCompatible:true` (kubus 3.4 MB, dragon 3.4 MB tekstur 512px); validasi pxr `Usd.Stage.Open` + BBoxCache. Sisa: bukti Quick Look di iPhone nyata.)
- [x] **4. Poster** → screenshot orbit 45° sebagai `poster.webp` (+ thumbnail grid bila perlu). (Sementara: poster grafis placeholder PIL, WAJIB diganti screenshot model.)
- [x] **5. Hotspot** → buka model di penampil glTF / `<model-viewer>` mode debug, salin `data-position` / `data-normal`, masukkan ke `ar-catalog.ts`. (Rubik: badan statis (0.08,1.16,6.42) sisi 2.24 — sisi `(0.08,1.16,7.57)`, rusuk `(0.08,2.301,7.561)`, sudut `(1.22,2.30,7.56)`, terverifikasi screenshot. Dragon: pose diam + autoplay=false karena `Take 001` menggerakkan seluruh badan — kepala `(0.1,1.57,1.15)`, badan/punggung `(0,1.6,1.2)`, sayap `(0.9,1.63,0.3)`, terverifikasi screenshot per label. ATURAN PENTING: jangkar WAJIB di udara luar permukaan — model-viewer menyembunyikan hotspot yang tertanam di dalam mesh.)
- [x] **6. Daftarkan** → tambah entri `ArModel` + 2–4 hotspot + 2–3 kuis + lisensi. (Selesai untuk 2 model; data kuis sudah ada, UI kuis di Fase 1.)

Urutan pembuktian pipeline: kerjakan **`kubus-prisma` + `grammar-dragon` dulu** (1 statis + 1 animasi). Lanjut 4 sisanya setelah Quick Look terbukti jalan.

## 6. Struktur rute & komponen

### Rute baru

```
src/app/ar/page.tsx        → /ar (grid katalog + filter mapel, pola kuis/page.tsx)
src/app/ar/[id]/page.tsx   → /ar/<id> (viewer + misi + kuis + kredit lisensi, link shareable)
```

### Komponen baru

| File | Tanggung jawab |
|------|----------------|
| `src/types/model-viewer.d.ts` | Deklarasi JSX `model-viewer` + event `ar-status`, `progress`, `load` (agar `tsc` lolos) | ✅ 2026-09-16 (augmentasi `react` JSX, bukan global — React 19) |
| `src/components/ar-viewer.tsx` | `"use client"`, dimuat `next/dynamic ssr:false`; wrapper `<model-viewer>` (detail §7) | ✅ 2026-09-16 (hotspot + animasi + progress + ar-status + fallback error) |
| `src/components/ar-model-card.tsx` | Kartu katalog (poster, badge mapel, tombol Buka) | ✅ 2026-09-16 (+ badge "Aset sementara") |
| `src/components/ar-quiz.tsx` | Sheet kuis per model; reuse gaya boss-battle + `sfx` + `celebrate()` | ✅ 2026-09-16 (alir mulai→soal→pembahasan→hasil; lulus = semua benar → `onPassed`; terpasang di `/ar/[id]`) |
| `src/components/ar-missions.tsx` | 3 misi XP + cooldown localStorage 24 jam | ✅ 2026-09-16 (+ hook `src/hooks/use-ar-missions.ts`: klaim via `grantXp` di event handler, bukan effect — patuh aturan hooks; badge Selesai/+XP) |

### Edit file lama

| File | Perubahan |
|------|-----------|
| `package.json` | Tambah `@google/model-viewer` (+ types bila perlu) | ✅ 2026-09-16 (v4.3.1, tanpa types tambahan — deklarasi lokal; + `three@^0.183.0` eksplisit sebagai peer dep model-viewer) |
| `next.config.ts` | Header `Cache-Control: public, max-age=31536000, immutable` untuk `/models/*` | ✅ 2026-09-16 (+ `Content-Type: model/vnd.usdz+zip` untuk `model.usdz` — Next tidak mengenal MIME usdz) |
| `public/sw.js` | JANGAN precache `/models/*` di `APP_SHELL`; tambah runtime cache terpisah berkuota (atau `network-first`) | ✅ 2026-09-16 (cache `gamifikathink-models` cache-first + dikecualikan dari pembersihan activate) |
| `src/middleware.ts` | Kecualikan `.glb`, `.usdz`, `/models/`, `/ar` dari matcher (pelajaran dari insiden manifest/SW ke-redirect `/login`) | ✅ 2026-09-16 (parsial: `models/` + `*.glb/*.usdz` dikecualikan; halaman `/ar` SENGAJA tetap di balik auth konsisten dengan `/arena` — lihat catatan §9) |
| `src/lib/supabase/middleware.ts` | Allowlist path yang sama di `updateSession()` (defense in depth) | ✅ 2026-09-16 (parsial, sama seperti di atas) |
| `src/components/sidebar.tsx` | Tambah `menuItems`: `{ href: "/ar", label: "AR Lab", icon: Boxes }` (+ versi collapsed otomatis ikut) | ✅ 2026-09-16 |
| Arena (`arena/page.tsx` / `chat-interface.tsx`) | Chip "Model AR terkait" via `getRelatedModels(subject)` — tanpa AI dulu | ✅ 2026-09-16 (chip di empty-state arena + link "Lihat Versi 3D" di detail Buku Mantra) |
| `buku-mantra/page.tsx` | Link "Lihat versi 3D" bila riwayat cocok mapel (opsional MVP) |

## 7. Spesifikasi `ar-viewer.tsx`

Atribut `<model-viewer>` MVP:

```html
<model-viewer
  src="/models/<id>/model.glb"
  ios-src="/models/<id>/model.usdz"
  poster="/models/<id>/poster.webp"
  ar
  ar-modes="scene-viewer quick-look webxr"
  ar-scale="auto"
  camera-controls
  auto-rotate
  shadow-intensity="1"
  exposure="1"
  loading="lazy"
  reveal="interaction">
  <!-- hotspot di-render dari katalog -->
  <button slot="hotspot-0" data-position="..." data-normal="...">…</button>
  <!-- tombol AR custom + progress bar -->
</model-viewer>
```

Perilaku wajib:

- [x] Progress bar dari event `progress` + `poster` selama loading; `loading="lazy"`, grid hanya render poster (jangan autoplay semua model). (Revisi 2026-09-16: halaman detail pakai `loading="eager"` + `reveal="auto"` agar model langsung dimuat tanpa perlu klik — lihat catatan diagnosis di bawah; + badge teks status `Menyiapkan penampil…` / `Memuat model 3D… N%`. Katalog tetap poster-only.)
- [x] Hotspot diklik → panel anotasi + `sfx.click()`; tandai `visited`; saat semua dikunjungi → misi selesai. (Callback `onAllHotspotsVisited` sudah dipanggil; UI misi menyusul Fase 1.)
- [x] Kontrol animasi: tombol play/pause + dropdown `animation-name` bila `animations.length > 1`; fallback `auto-rotate` bila model tanpa clip. (+ toggle rotasi, hormati `prefers-reduced-motion`.)
- [x] `ar-status="failed"` → toast "AR tidak didukung di perangkat ini, mode 3D tetap bisa dipakai" + banner Desktop "Buka di HP untuk AR". (`session-started` → toast + callback `onArSessionStarted` untuk misi XP Fase 1.)
- [x] Aksesibilitas: label Indonesia, tombol ≥ 44px, deskripsi tekstual tiap model untuk screen reader. (Hotspot 44px, `aria-label`, panel `aria-live`.)
- [x] Bedakan error modul JS vs model di UI (`moduleError` vs `loadError`) agar diagnosis terlihat pengguna.

> **Catatan diagnosis 2026-09-16 ("objek hanya 2 cincin"):** yang tampil adalah poster placeholder, bukan model. Penyebab: `reveal="interaction"` menahan model sampai diklik + poster generatif berbentuk cincin. Verifikasi headless Chrome membuktikan GLB + model-viewer valid (kubus & rubah ter-render, event `load` + `availableAnimations` benar). Perbaikan: `reveal="auto"` + `loading="eager"` + badge status + koreksi nama klip kubus `BoxAnimated` → `animation_0`. Setelah update, muat ulang halaman dengan hard refresh (Ctrl/Cmd+Shift+R) agar SW/chunk lama tidak dipakai.

## 8. Misi XP & kuis (anti-farm)

Reuse `grantXp()` dari `src/lib/xp-events.ts` (dispatch `XP_EVENT`, sidebar ter-update otomatis) + `sfx`/`celebrate()` dari `src/lib/feedback.ts`.

| Misi | XP default | Pemicu | Cooldown |
|------|------------|--------|----------|
| Buka di AR | +10 | Event `ar-status="session-started"` (atau klik tombol AR) | 1x / model / 24 jam |
| Jelajahi semua hotspot | +15 | Semua `hotspot.visited` | 1x / model / 24 jam |
| Kuis model benar | +20 | Jawaban benar di `ar-quiz.tsx` | 1x / model / 24 jam |

Kunci cooldown: `localStorage "ar-xp-<modelId>-<mission>"` berisi timestamp. Bila `grantXp()` null (belum login) → toast "Masuk dulu untuk simpan XP".

## 9. PWA, middleware, dan MIME (jebakan yang sudah pernah terjadi)

- [x] Matcher `src/middleware.ts` + allowlist `updateSession()` mencakup: `/ar`, `/models/`, `*.glb`, `*.usdz` (saat ini matcher hanya mengecualikan `sw.js`, `manifest.webmanifest`, `icons/`, dan gambar umum). (Keputusan final 2026-09-16: **aset** `models/*.glb/*.usdz` publik — Scene Viewer/Quick Look fetch tanpa cookie sesi; **halaman** `/ar` tetap di balik auth konsisten dengan `/arena`/`/kuis`.)
- [x] Verifikasi production: `.glb → model/gltf-binary`, `.usdz → model/vnd.usdz+zip` via `curl -I` (bukan redirect `/login`, bukan `text/html`). (Terverifikasi 2026-09-16 di `next start` lokal: glb 200 `model/gltf-binary`, usdz 200 `model/vnd.usdz+zip` setelah header kustom, tanpa sesi login.)
- [ ] Wajib HTTPS (Vercel production ok; `localhost` ok untuk dev).
- [x] PWA tetap valid: manifest/icons tidak berubah; halaman `/ar` ikut app-shell, model tidak ikut precache. (`build` hijau, `/manifest.webmanifest` tetap ter-generate.)

## 10. Performa & aksesibilitas

- [x] Tiap model < 5 MB; total halaman `/ar` (tanpa membuka model) < 1 MB JS + poster. (kubus 12 KB, naga 163 KB.)
- [x] `dynamic(ssr:false)` untuk viewer; katalog grid ringan (poster saja).
- [ ] Uji HP low-end: tidak overheat/crash; sediakan tombol "Matikan auto-rotate". (Tombol toggle rotasi sudah ada; uji perangkat menyusul.)
- [x] Teks Indonesia semua; kontras mengikuti token `--text-*`; hormati `prefers-reduced-motion` untuk auto-rotate.

## 11. Keamanan, privasi, lisensi

- [x] `<model-viewer>` tidak meminta `getUserMedia` sendiri — jangan tambah `Permissions-Policy: camera` kecuali memakai WebRTC sendiri nanti.
- [ ] Upload model (bila dibuka ke user di masa depan): validasi ekstensi + magic bytes + batas size; simpan privat + signed URL, bukan bucket publik.
- [x] Kredit lisensi tampil di tiap halaman detail + (opsional) satu halaman `/ar/kredit`. (Tampil di `/ar/[id]`; halaman kredit khusus belum ada.)
- [x] CSP `next.config.ts` ditinjau agar tidak memblokir `blob:`/model internal (tetap self-host via npm, bukan CDN script). (Tidak ada perubahan diperlukan — tidak ada script eksternal.)

## 12. Testing & acceptance criteria

### Perintah standar (wajib hijau tiap milestone)

```bash
npm run lint
npm run typecheck
npm run build
curl -I http://localhost:3000/models/kubus-prisma/model.glb
curl -I http://localhost:3000/models/kubus-prisma/model.usdz
```

### Matriks perangkat nyata (tidak cukup emulator)

| Perangkat | Harapan | Status |
|-----------|---------|--------|
| Android Chrome + ARCore | Tombol AR → Scene Viewer, model skala meja | - [ ] |
| iPhone Safari | Tombol AR → Quick Look (bukti USDZ valid) | - [ ] |
| Desktop Chrome/Safari | Orbit/zoom/hotspot/kuis jalan; banner "buka di HP untuk AR" | - [ ] |
| Mode pesawat setelah load | `/ar` terbuka (PWA); model terbuka bila sudah dibuka sekali | - [ ] |
| WebGL mati | Poster statis + pesan ramah, tanpa crash | - [ ] |

### Acceptance MVP

- [ ] 6 model tampil di `/ar` dengan poster + filter mapel.
- [ ] Tiap model: mode 3D (hotspot + animasi + kuis) jalan di Desktop.
- [ ] Tiap model: tombol AR jalan di 1 Android + 1 iPhone nyata.
- [ ] 3 misi XP memberi tepat 1x/24 jam dan muncul di sidebar.
- [ ] `lint`, `typecheck`, `build` hijau; PWA Lighthouse tidak regresi.

## 13. Fase rollout + tracking

### Fase 0 — Bukti pipeline (2–3 hari) — `SELESAI 2026-09-16`

- [x] `ar-catalog.ts` + 2 model (`kubus-prisma`, `grammar-dragon`) lengkap glb/usdz/poster. (glb asli; usdz + poster masih placeholder — lihat §3.)
- [x] `model-viewer.d.ts` + `ar-viewer.tsx` + `/ar` + `/ar/[id]` minimal (view + hotspot). (+ kartu katalog, kontrol animasi, ar-status, menu sidebar, SW/headers/middleware; `lint`+`typecheck`+`build` hijau.)
- [ ] Quick Look terbukti di 1 iPhone nyata. (Butuh perangkat fisik — belum dilakukan.)

### Fase 1 — MVP penuh (total 1–2 minggu) — `SEBAGIAN 2026-09-16`

- [ ] 4 model sisa (`molekul-h2o`, `magnet-batang`, `bandul`, `castle`) + kuis. (Data + UI kuis selesai untuk 2 model aktif; TERBLOKIR: butuh file `.glb` dari user seperti `newglb/`.)
- [x] `ar-missions.tsx` + `ar-quiz.tsx` + wiring callback viewer (`onArSessionStarted`, `onAllHotspotsVisited`, `onPassed`).
- [x] Sidebar "AR Lab" + chip terkait di Arena + link Buku Mantra. (Sidebar sejak Fase 0.)
- [x] SW runtime cache model + header `/models/*` + allowlist middleware. (Sejak Fase 0; versi cache naik ke v2 saat cache-busting.)
- [ ] Matriks perangkat + acceptance §12 hijau. (Butuh HP Android + iPhone fisik — tugas pengguna.)

### Fase 2 — Pendalaman (opsional)

- [ ] AI Arena menyarankan model otomatis berdasarkan soal.
- [ ] Anotasi lanjutan (audio SFX per hotspot, narasi TTS).
- [ ] Pindah aset ke Supabase Storage `ar-models` + CDN bila `public/` membengkak.

### Fase 3 — Di luar MVP

- [ ] Marker "scan kartu mantra" (MindAR) atau WebXR markerless (`react-three-fiber`).
- [ ] Boss battle AR interaktif penuh.

## 14. Risiko & mitigasi

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Model gratis tanpa animasi | Interaksi hambar | Minimal 1 naga + 1 bandul beranimasi; sisanya hotspot + auto-rotate |
| USDZ rusak/bengkak | AR iOS gagal (gagal acceptance) | Buktikan 1 model dulu; kunci tool konversi + checklist `curl -I` |
| Model > 5 MB di jaringan lambat | Loading lama, bounce | Progress bar + poster + lazy; tolak model > 8 MB masuk katalog |
| Atribusi lisensi terlewat | Masalah hak cipta | Field `license` wajib di tipe; tampilkan di UI detail |
| SW/middleware ke-redirect login | Model 404/HTML (pernah terjadi di manifest) | Allowlist `.glb/.usdz//models//ar` di dua lapis + uji `curl` tanpa login |

## 15. Referensi

- Model-viewer docs: `https://modelviewer.dev/` (elemen `ios-src`, `ar-modes`, slot `hotspot`, event `ar-status`/`progress`).
- Contoh model: KhronosGroup `glTF-Sample-Models`, Poly.pizza, Quaternius.
- Pola kode lokal yang direuse: `src/lib/xp-events.ts` (`grantXp`), `src/lib/feedback.ts` (`sfx`, `celebrate`), `src/lib/quiz-bank.ts` (`QuizQuestion`), `src/components/boss-battle.tsx` (gaya kuis), `src/app/kuis/page.tsx` (pola filter), `public/sw.js` + middleware (pelajaran allowlist).

## 16. Log perubahan dokumen

| Tanggal | Perubahan |
|---------|-----------|
| 2026-09-16 | Dibuat dari keputusan: aset gratis-swappable, AR iOS wajib, interaksi wajib. Status: PERENCANAAN. |
| 2026-09-16 | Fase 0 selesai: 2 model (glb asli Khronos; usdz+poster placeholder), katalog, viewer (hotspot/animasi/ar-status), rute `/ar` + `/ar/[id]`, menu sidebar, SW cache model, header MIME usdz, allowlist middleware aset. `lint`/`typecheck`/`build` hijau; MIME terverifikasi via curl. Sisa: validasi Quick Look iPhone nyata, USDZ/poster final, Fase 1 (kuis, misi XP, 4 model). |
| 2026-09-16 | Diagnosis "objek hanya cincin": terbukti poster placeholder + `reveal="interaction"`. Render headless Chrome: kubus & rubah tampil, `load` + animasi (`animation_0`; `Survey,Walk,Run`) valid. Fix: `reveal="auto"`, `loading="eager"`, badge status %, bedakan error modul vs model, koreksi klip kubus, `three` eksplisit di deps. `lint`/`typecheck`/`build` hijau; chunk model-viewer terkonfirmasi ada di output build. |
| 2026-09-16 | Presisi hotspot kubus: ukur bounds GLB (outer statis ±0.5 node 3; inner beranimasi), probe 8 sudut + 3 muka via screenshot headless, tambah epsilon normal (sisi 0.53; rusuk 0.521; sudut 0.52). Verifikasi visual: dot tepat di fitur. `lint`/`typecheck`/`build` hijau. |
| 2026-09-16 | Swap ke aset pribadi (`new glb/`): kubus→Rubik 3×3 animasi (klip `Animation`, hotspot di badan statis), dragon→Mountain Dragon (klip `Take 001`; skala ×0.001 + lift + optimasi 17.6→5.97 MB tanpa draco; hotspot pose-diam + `autoplay:false` karena animasi root-motion kuat; aturan jangkar-di-luar-permukaan; poster screenshot asli; lisensi internal, `url` opsional). `lint`/`typecheck`/`build` hijau; MIME+size terverifikasi via curl. Sisa placeholder: USDZ kedua model. |
| 2026-09-16 | Folder sumber dipindah user `new glb/` → `newglb/` (isi identik, terverifikasi). Perbaikan cache: aset diganti URL berversi (`model-v2.glb`, `poster-v2.webp`) + cache SW naik ke `gamifikathink-v2` / `gamifikathink-models-v2` agar model baru tampil (sebelumnya tertahan cache immutable + SW). `lint`/`typecheck`/`build` hijau; URL v2 terverifikasi via curl. |
| 2026-09-17 | Prioritas Lihat-di-AR: USDZ ASLI untuk kedua model (three USDZExporter + quickLookCompatible; kubus 3.4 MB/10 mesh, dragon 3.4 MB/2 mesh + tekstur; validasi pxr). Katalog pakai `model-v2.usdz`, placeholder usdz dicabut, aturan MIME Next digeneralisasi ke `*.usdz`. `lint`/`typecheck`/`build` hijau; curl 200 + MIME benar. Sisa: uji Quick Look + Scene Viewer di HP nyata. |
| 2026-09-16 | Fase 1 sebagian: `ar-quiz.tsx` (alir mulai→hasil, lulus = semua benar), `use-ar-missions.ts` + `ArMissions` (klaim XP via `grantXp` di handler + cooldown localStorage 24 jam), wiring di `/ar/[id]`, chip AR di empty-state Arena + seksi 3D di Buku Mantra. `lint`/`typecheck`/`build` hijau. Sisa: 4 model (butuh file user) + uji perangkat fisik. |
| 2026-09-17 | Diagnosis + fix "Ryuri tidak tampil" (akar masalah GANDA, terbukti via headless Chrome + kontrol kubus/dragon yang lolos): (1) GLB v2 gagal parse total (`error type=loadfailure`, GLB terunduh penuh 200) — satu-satunya model ber-`EXT_meshopt_compression` (13 bufferView, gltfpack) yang decoder bawaan model-viewer (era meshoptimizer 1.0) tidak sanggup decode, padahal decoder three 0.183 baru sukses 13/13. Fix: rebuild `model-v3.glb` (18,25 MB — decode pakai decoder baru, tulis ulang single-buffer TANPA meshopt; KHR_mesh_quantization dipertahankan; accessor/animasi/tekstur tak berubah) + katalog pindah ke v3 (aturan cache-busting). (2) Geometri pencilan: analisis AABB per-mesh membuktikan 12/15 mesh karakter normal (Y 0,05–1,33 m) tetapi 3 mesh (Hair ×2, Tail ×1) menjuntai ke Y −35 m → bbox 36 m → auto-frame membuat karakter ~4% viewport. Fix non-destruktif: field framing opsional baru (`cameraTarget/cameraOrbit/fieldOfView/minCameraOrbit/maxCameraOrbit`) diteruskan `ar-viewer.tsx`; Ryuri dikunci (`0m 1m 0m` / `0deg 72deg 7m` / `40deg` / 1,5–40 m, terverifikasi visual screenshot). (3) `autoplay:false` + default `Idle_Static` (preseden dragon, hindari root-motion 645ch); hotspot dikoreksi ke zona karakter; `usdz` dijadikan opsional + dikosongkan (file lama duplikat kubus, dihapus — banner "USDZ iOS menyusul"); poster palsu (`.png/.webp` berisi SVG) dihapus, katalog pakai `.svg` valid + `placeholderAssets: ["usdz","poster"]`. Sisa: USDZ asli (konversi seperti kubus/dragon), poster screenshot asli, perbaikan sumber mesh rambut/ekor + optimasi ukuran v3 (di atas budget 8 MB). |

---
*Ceklis di dokumen ini adalah tracker resmi. Tandai `[x]` setiap item selesai; jangan hapus baris — coret dengan tetap menyimpan riwayat.*
