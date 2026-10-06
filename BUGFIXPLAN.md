# BUGFIXPLAN: GAMIFIKATHINK

Hasil audit runtime (auth diabaikan, sengaja dimatikan untuk debugging).
Diagnostik: `typecheck` ✅, `lint` ✅, `npm test` ⚠️ (vitest belum terinstal).
Sehat: env, `public/`, versi AI SDK, ES2017, regex LaTeX, `ar-catalog`, quiz/flashcards routes (kecuali catatan deck 8 vs 6).

## Fase 1: HIGH, user-visible langsung

| # | Lokasi | Bug | Perbaikan | Status |
|---|---|---|---|---|
| 1 | `src/lib/xp-events.ts:29-33` | `add_xp` RETURNS TABLE → `data` array, dibaca sebagai objek → `xp/level` `undefined`: counter XP NaN, selebrasi level-up mati, cooldown misi AR tercatat palsu | Ambil `data[0]` + guard null | ✅ |
| 2 | `src/app/api/chat/route.ts:129-131` | `try/catch` tak menangkap error mid-stream; `onError` hanya log → chat putus tanpa fallback server | Error terstruktur ke klien (header `x-error-code` saat gagal pre-stream + pesan stream saat gagal mid-stream) agar retry klien tepat sasaran | ✅ |
| 3 | `src/app/api/chat/route.ts:134-163` | Error JSON biasa tak bisa diparse klien SSE → pesan spesifik hilang, toast selalu generik | Samakan dengan #2: kode error lewat header respons error | ✅ |
| 4 | `src/components/chat-interface.tsx:onFinish` | Baca `messages`/`input` closure basi (`input` sudah `""`) → riwayat tersimpan kosong/salah pasangan; `engine` basi | Signature SDK `onFinish({messages})` + ref teks terkirim + ref engine dari header | ✅ |
| 5 | `src/components/chat-interface.tsx` submit+retry | `imageBase64` di-clear sebelum request disiapkan; retry `regenerate()` jalan tanpa gambar → halusinasi | Pertahankan base64 sampai selesai/gagal final; retry pakai pesan terakhir yang menyimpan gambar | ✅ |
| 6 | `src/components/image-upload.tsx` tombol X | Tanpa `type="button"` di dalam `<form>` → klik hapus ikut submit | Tambah `type="button"` | ✅ |
| 7 | `src/components/boss-battle.tsx:137 vs 189` | Label `+poin` off-by-one (dihitung setelah combo naik) | Hitung dari `comboNext` yang sama dengan skor aktual | ✅ |
| 8 | `src/components/flash-battle.tsx:104` | `markDeckDone` juga saat kalah → run berikutnya kena XP ¼ padahal belum pernah clear | Tandai done hanya jika menang | ✅ |

## Fase 2: MEDIUM (race timer, state basi, validasi)

| # | Lokasi | Bug | Perbaikan | Status |
|---|---|---|---|---|
| 9 | `src/components/boss-battle.tsx:145-154` | `setTimeout(1700)` tanpa cancel → callback lama menimpa game baru/unmount | Simpan id, clear di restart/unmount | ✅ |
| 10 | `src/components/flash-battle.tsx:147-160,226` | Sama (`650ms`) + `advance` tutup `index` basi → lompat kartu/finish palsu; `cards[index]` tanpa guard | Cancel timeout + guard OOB | ✅ |
| 11 | `src/components/ar-quiz.tsx:34-70` | State tak reset saat `model` ganti (tanpa `key`), `passedRef` tak di-reset → XP misi hangus + potensi crash OOB | `key={model.id}` di pemanggil + reset `passedRef` + guard index | ✅ |
| 12 | `src/app/api/chat/route.ts:67-87` | `req.json()` tanpa try/catch, image tanpa validasi server, `subject/level` tanpa default ("undefined" masuk prompt) | try/catch + default + batas ukuran | ✅ |
| 13 | `src/components/tutorial-tour.tsx:97-108` | `clearTimeout(t2)` di dalam callback (tak pernah jadi cleanup) → sorot flicker | Restruktur cleanup effect | ✅ |
| 14 | `src/app/arena/page.tsx:15-18` | Ganti mapel tak reset pesan → percakapan lama tersimpan dengan label baru | `setMessages([])` via ref/lift saat ganti mapel (konfirmasi jika ada pesan) | ✅ |
| 15 | `src/app/buku-mantra/page.tsx:71,40` | `setHistory` closure + `getUser().then` tanpa catch (loading macet) | Functional update + catch | ✅ |

## Fase 3: LOW / defensif

| # | Lokasi | Bug | Perbaikan | Status |
|---|---|---|---|---|
| 16 | `src/components/boss-battle.tsx:413` | `/5` hardcoded | `questions.length` | ✅ |
| 17 | Guard pembagi-nol | `boss-battle:186`, `flash-battle:57`, `sidebar:118` | Guard nilai 0 | ✅ |
| 18 | Validasi bentuk soal API | `options`/`answerIndex` sebelum render | Filter soal valid saat load | ✅ |
| 19 | `src/components/flash-battle.tsx` restart | `xpEarned` tak di-reset | Reset di `restart` | ✅ |
| 20 | `src/components/chat-interface.tsx` | Scroll merebut tiap chunk + timeout retry tanpa cleanup | Scroll hanya jika dekat bawah + cleanup | ✅ |
| 21 | `supabase-gamification.sql` | Baris lawas `xp`/`level` NULL → UPDATE menulis NULL kembali | `COALESCE` | ✅ |
| 22 | `public/sw.js:10` | Precache `/manifest.webmanifest` dinamis → salinan basi | Keluarkan dari precache | ✅ |

## Fase 4: harness

- Pasang `vitest` + smoke test ✅ (vitest@2.1.9, `vitest.config.ts`, 10 tes lolos): parse hasil RPC, fallback bank, `bankToCards`, `normalizeMathDelimiters`.

## Verifikasi

`typecheck` + `lint` tiap fase; manual: klaim XP agar angka waras + selebrasi; chat gagal agar fallback/toast spesifik;
retry gambar agar gambar ikut; hapus gambar agar tak submit; restart cepat boss/flash agar tak lompat; ganti model AR agar kuis reset.

## Catatan eksekusi

- `react-hooks/refs` (v7.1) false positive: tulis `ref.current` di dalam callback yang disimpan ke `useMemo` di-flag transitif, diatasi via sinkronisasi ref di effect (`chat-interface.tsx`).
- `.prettierrc` punya `trailingComma: "esModule"` yang invalid (pre-existing) → diganti `es5`; repo baseline memang belum prettier-clean jadi tidak ada reformat massal.
