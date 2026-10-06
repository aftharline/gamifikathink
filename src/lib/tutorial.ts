// ponytail: progres tur di localStorage, tanpa tabel/analitik

export type TourKey = "arena" | "kuis" | "kartu" | "buku-mantra" | "ar" | "lab" | "materi" | "dashboard" | "otak" | "leaderboard"

export interface TourStep {
  /** nilai atribut data-tour; "" = kartu tengah (tanpa sorot) */
  target: string
  title: string
  body: string
}

export const TOUR_EVENT = "gamifikathink:tour"

function key(tour: TourKey): string {
  return `tour-seen-${tour}`
}

export function hasSeenTour(tour: TourKey): boolean {
  if (typeof window === "undefined") return true
  return window.localStorage.getItem(key(tour)) === "done"
}

export function markTourSeen(tour: TourKey): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key(tour), "done")
}

export function resetTours(): void {
  if (typeof window === "undefined") return
  ;(
    ["arena", "kuis", "kartu", "buku-mantra", "ar", "lab", "materi", "dashboard", "otak", "leaderboard"] as TourKey[]
  ).forEach((t) => window.localStorage.removeItem(key(t)))
}

export const TOURS: Record<TourKey, TourStep[]> = {
  arena: [
    {
      target: "subject-picker",
      title: "Pilih Kelas & Mapel",
      body: "Di sidebar ini pilih jenjang (SD/SMP/SMA) lalu 1 dari 14 mapel. Bahasa dan tingkat soal menyesuaikan pilihanmu.",
    },
    {
      target: "arena-mode",
      title: "Pilih mode tutor",
      body: "Solver = jawaban cepat. Socrates = dipandu pertanyaan. Uji Dulu = dites ingatan dulu. Ujian Lisan = ditanya satu-per-satu + dinilai.",
    },
    {
      target: "arena-input",
      title: "Tulis soalnya di sini",
      body: "Ketik soal apa adanya, angka dan variabel jangan diubah. Pakai tombol ∑ untuk simbol matematika (π√²∫). Tekan Enter untuk kirim.",
    },
    {
      target: "arena-image",
      title: "Foto / coret-coret soal",
      body: "Klik ikon gambar atau drag & drop foto soal (maks 4MB). Bisa juga coret rumus di kanvas digital, langsung dianalisis AI.",
    },
    {
      target: "arena-send",
      title: "Kirim ke Game Master",
      body: "Tekan tombol kirim. Soal teks dijawab ChatAnywhere, soal gambar dijawab Gemini, otomatis + fallback.",
    },
    {
      target: "arena-messages",
      title: "Baca skenario + rumus",
      body: "Jawaban berisi skenario game, langkah penyelesaian, dan rumus LaTeX rapi. Blok teks mana pun bisa diklik untuk ditanyakan lagi (Smart Text). Kalkulator mini ada di pojok input.",
    },
  ],
  kuis: [
    {
      target: "kuis-boss",
      title: "Pilih Bos yang dilawan",
      body: "14 mapel berikon, tiap mapel dijaga bos berbeda: King Al-Gebra, Grammar Dragon, Lord Newton, Doctor Mole, Mother Spore, Raja Kata, plus bos baru (Lord Pasar, Titan Bumi, Cyber Lord…).",
    },
    {
      target: "kuis-level",
      title: "Pilih Jenjang + Mode Ujian",
      body: "SD/SMP/SMA + mode: Boss (5 soal), Ujian UTBK (10 soal), atau True/False (Benar/Salah). Dari /materi, soal bisa grounded ke dokumenmu.",
    },
    {
      target: "kuis-start",
      title: "Mulai Pertempuran",
      body: "Jawab sebelum timer habis. Benar = serang bos + kombo, salah = hatimu berkurang. Hasil tersimpan ke Dashboard (knowledge gaps) + tombol Share untuk bagi paket ke teman.",
    },
  ],
  kartu: [
    {
      target: "kartu-deck",
      title: "Pilih Deck Mantra",
      body: "Satu deck berisi 8 kartu sesuai mapel dan jenjang: istilah di depan, jawaban + penjelasan di belakang. Bisa juga dari dokumen /materi.",
    },
    {
      target: "kartu-level",
      title: "Pilih Jenjang",
      body: "Kartu dibuat AI sesuai jenjangmu. Sistem SRS otomatis: kartu yang sering salah muncul lebih dulu (jatuh tempo).",
    },
    {
      target: "kartu-start",
      title: "Panggil Deck",
      body: "Masuk ke duel kartu melawan bos mapel yang kamu pilih.",
    },
    {
      target: "",
      title: "Duel: Hafal atau Belum?",
      body: "Ketuk kartu untuk membukanya, lalu jujur: Hafal menyerang bos, Belum membuat bos menyerangmu. Kombo 3x+ menambah damage. Deck boleh diulang, run ulang XP-nya kecil.",
    },
  ],
  "buku-mantra": [
    {
      target: "buku-list",
      title: "Pilih mantra tersimpan",
      body: "Semua pembahasan dari Arena tersimpan di sini. Klik salah satu untuk membukanya.",
    },
    {
      target: "buku-detail",
      title: "Baca ulang pembahasan",
      body: "Soal, skenario game, langkah, dan rumus tersimpan utuh, termasuk link Lihat di AR jika mapelnya punya model 3D.",
    },
    {
      target: "",
      title: "Hapus mantra",
      body: "Tidak butuh lagi? Arahkan ke item, tekan ikon sampah, lalu konfirmasi Hapus.",
    },
  ],
  ar: [
    {
      target: "ar-filter",
      title: "Saring per mapel",
      body: "Pilih Semua atau satu mapel untuk menemukan model 3D yang kamu butuhkan.",
    },
    {
      target: "ar-grid",
      title: "Pilih model 3D",
      body: "Klik kartu model untuk membukanya. Kamu bisa memutar dan memperbesar langsung di sini.",
    },
    {
      target: "",
      title: "Di dalam model",
      body: "Ketuk titik bernomor (hotspot) untuk penjelasannya, ikut kuis singkatnya, lalu tekan Lihat di AR. Khusus Fisika/Kimia ada tombol lanjutan ke simulasi Lab interaktif (bandul 3D / molekul H₂O).",
    },
  ],
  lab: [
    {
      target: "lab-grid",
      title: "Pilih simulasi (18 lab)",
      body: "Lab sains + 12 lab baru: pizza pecahan, katrol seret, pH mixer, rantai makanan, word drop, imbuhan, pasar, peta, timeline, Garuda heraldik, magnet, sorting. Bandul butuh Proyektil, Sel butuh Grafik.",
    },
    {
      target: "lab-eco",
      title: "Hemat efek",
      body: "HP terasa berat? Nyalakan Hemat efek untuk mematikan partikel dan animasi berat di semua lab.",
    },
    {
      target: "lab-sim",
      title: "Geser variabelnya + ikuti Robo",
      body: "Maskot Robo memandu tiap lab dengan sapaan dan cerita 3 babak (misi → konflik → bos). Seret langsung beban katrol/magnet, gunakan mode tebak (sel) dan bedah (Garuda). Tiap eksperimen +5 XP, misi +10 XP. Di bawah ada AI widget: ketik topik apa pun untuk dibuatkan mini-app, atau pakai template offline saat AI gagal.",
    },
  ],
  materi: [
    {
      target: "",
      title: "Upload → Ringkas → Main",
      body: "Upload PDF/TXT (10MB, 10 hal pertama) atau paste teks → Ringkas AI → putar sebagai podcast gratis → Jadi Kartu / Jadi Kuis grounded ke dokumenmu.",
    },
  ],
  dashboard: [
    {
      target: "",
      title: "Pantau + rencanakan",
      body: "Lihat streak harian, akurasi per mapel (knowledge gaps: fokus ke yang <70%), lalu tekan Buat Rencana 7 Hari untuk roadmap personal.",
    },
  ],
  otak: [
    {
      target: "",
      title: "Latih otak visual",
      body: "Math sprint 60 detik, memori urutan, plus Lab Otak Visual: Stroop warna (klik warna tinta!), reflek tap (<400ms = XP), pola grid 3×3.",
    },
  ],
  leaderboard: [
    {
      target: "",
      title: "Berburu peringkat",
      body: "Top 20 Warrior per level+XP. Main Boss/Kartu/Lab untuk naik. Bagikan paket via tombol Share (link /p/KODE) ke teman sekelas.",
    },
  ],
}
