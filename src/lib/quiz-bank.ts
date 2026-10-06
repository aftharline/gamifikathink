export interface QuizQuestion {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface Boss {
  name: string
  title: string
  quote: string
}

export const BOSSES: Record<string, Boss> = {
  Matematika: {
    name: "King Al-Gebra",
    title: "Penguasa Persamaan",
    quote: "Angka tidak pernah berbohong. Tunjukkan kecepatanmu!",
  },
  "Bahasa Inggris": {
    name: "Grammar Dragon",
    title: "Penjaga Kata-Kata",
    quote: "You shall not pass… tanpa grammar yang benar!",
  },
  Fisika: {
    name: "Lord Newton",
    title: "Tuan Hukum Gerak",
    quote: "Gaya yang kamu lawan adalah kebodohan. Buktikan!",
  },
  Kimia: {
    name: "Doctor Mole",
    title: "Alkemis Reaksi",
    quote: "Campuran tepat menciptakan ledakan. Awas salah reaksi!",
  },
  Biologi: {
    name: "Mother Spore",
    title: "Ratu Sel Hidup",
    quote: "Setiap sel adalah pasukanku. Taklukkan ekosistemku jika berani!",
  },
  "Bahasa Indonesia": {
    name: "Raja Kata",
    title: "Penjaga Bahasa",
    quote: "Satu kata salah, misimu gagal. Buktikan tajam bahasamu!",
  },
  Ekonomi: { name: "Lord Pasar", title: "Penguasa Modal", quote: "Supply-demand menentukan nasibmu!" },
  Geografi: { name: "Titan Bumi", title: "Penjaga Peta", quote: "Kenali bumimu sebelum menaklukkannya!" },
  Sejarah: { name: "Kaisar Waktu", title: "Penjaga Masa", quote: "Yang lupa sejarah akan mengulanginya!" },
  Sosiologi: { name: "Oracle Sosial", title: "Pemandu Masyarakat", quote: "Pahami manusia, kuasai dunia!" },
  PPKn: { name: "Garuda Sakti", title: "Penjaga Konstitusi", quote: "Pancasila adalah senjatamu!" },
  IPA: { name: "Dr. Sains", title: "Penjelajah Alam", quote: "Eksperimen atau punah!" },
  IPS: { name: "Penjelajah Dunia", title: "Petualang Sosial", quote: "Dunia menunggumu!" },
  Informatika: { name: "Cyber Lord", title: "Penguasa Kode", quote: "Bug adalah musuhmu. Debug sekarang!" },
}

export const BANK: Record<string, QuizQuestion[]> = {
  Matematika: [
    {
      question: "Berapakah nilai x jika 2x + 5 = 15?",
      options: ["x = 4", "x = 5", "x = 7", "x = 10"],
      answerIndex: 1,
      explanation:
        "Kurangi kedua ruas dengan 5 → 2x = 10, lalu bagi 2 → x = 5.",
    },
    {
      question: "Hasil dari 8 × 7 adalah…",
      options: ["54", "56", "64", "48"],
      answerIndex: 1,
      explanation: "8 × 7 = 56. Hafalkan tabel perkalian, itu senjata rahasiamu!",
    },
    {
      question: "Berapa luas persegi dengan sisi 6 cm?",
      options: ["24 cm²", "30 cm²", "36 cm²", "12 cm²"],
      answerIndex: 2,
      explanation: "Luas persegi = sisi × sisi = 6 × 6 = 36 cm².",
    },
    {
      question: "Hasil dari 15 + 27 adalah…",
      options: ["40", "42", "43", "45"],
      answerIndex: 1,
      explanation: "15 + 27 = 42. Kelompokkan 15 + (25 + 2) biar cepat.",
    },
    {
      question: "Sisi miring segitiga siku-siku dengan alas 3 dan tinggi 4 adalah…",
      options: ["5", "6", "7", "8"],
      answerIndex: 0,
      explanation: "Pakai Pythagoras: √(3² + 4²) = √25 = 5.",
    },
    {
      question: "Berapa hasil dari 144 ÷ 12?",
      options: ["10", "11", "12", "14"],
      answerIndex: 2,
      explanation: "144 ÷ 12 = 12, karena 12 × 12 = 144.",
    },
  ],
  "Bahasa Inggris": [
    {
      question: "Which sentence is correct in past tense?",
      options: [
        "I go to school yesterday",
        "I went to school yesterday",
        "I gone to school yesterday",
        "I goes to school yesterday",
      ],
      answerIndex: 1,
      explanation:
        "Past tense memakai bentuk kedua (V2): go → went untuk menyatakan kejadian lampau.",
    },
    {
      question: "Choose the correct article: ___ apple a day keeps the doctor away.",
      options: ["a", "an", "the", "no article"],
      answerIndex: 1,
      explanation:
        "'Apple' diawali bunyi vokal, jadi pakai 'an'. 'An apple a day…'",
    },
    {
      question: "What is the plural form of 'child'?",
      options: ["childs", "children", "childes", "child"],
      answerIndex: 1,
      explanation: "Irregular plural: child → children.",
    },
    {
      question: "'She ___ reading a book right now.'",
      options: ["is", "are", "am", "be"],
      answerIndex: 0,
      explanation: "Present continuous untuk 'she' memakai 'is'.",
    },
    {
      question: "The opposite of 'strong' is…",
      options: ["weak", "heavy", "tall", "fast"],
      answerIndex: 0,
      explanation: "Antonim (opposite) dari strong adalah weak.",
    },
    {
      question: "Which word is a noun?",
      options: ["run", "happiness", "quickly", "and"],
      answerIndex: 1,
      explanation:
        "'Happiness' adalah kata benda (noun). 'Run' bisa verb, 'quickly' adverb.",
    },
  ],
  Fisika: [
    {
      question: "Sebutkan satuan gaya dalam SI!",
      options: ["Joule", "Newton", "Watt", "Pascal"],
      answerIndex: 1,
      explanation: "Gaya diukur dalam Newton (N), sesuai nama Sir Isaac Newton.",
    },
    {
      question: "Rumus kecepatan rata-rata adalah…",
      options: [
        "jarak ÷ waktu",
        "waktu ÷ jarak",
        "jarak × waktu",
        "gaya ÷ massa",
      ],
      answerIndex: 0,
      explanation: "v = s / t, yaitu jarak dibagi waktu tempuh.",
    },
    {
      question: "Benda dengan massa 10 kg dan percepatan 2 m/s² menghasilkan gaya…",
      options: ["5 N", "8 N", "12 N", "20 N"],
      answerIndex: 3,
      explanation: "Hukum II Newton: F = m × a = 10 × 2 = 20 N.",
    },
    {
      question: "Energi yang tersimpan karena ketinggian disebut…",
      options: [
        "energi kinetik",
        "energi potensial gravitasi",
        "energi panas",
        "energi bunyi",
      ],
      answerIndex: 1,
      explanation:
        "Energi potensial gravitasi = m × g × h, bergantung pada ketinggian.",
    },
    {
      question: "Satuan energi dalam SI adalah…",
      options: ["Watt", "Newton", "Joule", "Volt"],
      answerIndex: 2,
      explanation: "Energi diukur dalam Joule (J).",
    },
    {
      question: "Sifat bayangan pada cermin datar adalah…",
      options: [
        "terbalik dan diperkecil",
        "maya, tegak, sama besar",
        "nyata dan terbalik",
        "maya dan diperbesar",
      ],
      answerIndex: 1,
      explanation:
        "Cermin datar menghasilkan bayangan maya, tegak, dan sama besar.",
    },
  ],
  Kimia: [
    {
      question: "Simbol kimia untuk unsur natrium adalah…",
      options: ["Na", "N", "So", "K"],
      answerIndex: 0,
      explanation: "Natrium (sodium) memiliki simbol Na dari bahasa Latin 'Natrium'.",
    },
    {
      question: "Rumus kimia air adalah…",
      options: ["H2O2", "H2O", "OH", "HO2"],
      answerIndex: 1,
      explanation: "Air tersusun dari 2 atom hidrogen dan 1 atom oksigen: H₂O.",
    },
    {
      question: "Zat yang pH-nya di bawah 7 bersifat…",
      options: ["basa", "netral", "asam", "garam"],
      answerIndex: 2,
      explanation: "pH < 7 = asam, pH > 7 = basa, pH = 7 = netral.",
    },
    {
      question: "Perubahan wujud dari padat menjadi gas disebut…",
      options: ["menguap", "menyublim", "mengembun", "membeku"],
      answerIndex: 1,
      explanation: "Padat → gas disebut menyublim (contoh: kapur barus).",
    },
    {
      question: "Jumlah proton dalam inti atom menentukan…",
      options: [
        "massa atom",
        "nomor atom",
        "jumlah neutron",
        "jumlah elektron valensi",
      ],
      answerIndex: 1,
      explanation: "Nomor atom = jumlah proton. Unsur yang berbeda punya nomor atom berbeda.",
    },
    {
      question: "Lambang unsur emas adalah…",
      options: ["Ag", "Fe", "Au", "Cu"],
      answerIndex: 2,
      explanation: "Emas (aurum) memiliki simbol Au.",
    },
  ],
  Biologi: [
    {
      question: "Tempat berlangsungnya fotosintesis pada tumbuhan adalah…",
      options: ["mitokondria", "kloroplas", "nukleus", "ribosom"],
      answerIndex: 1,
      explanation: "Fotosintesis terjadi di kloroplas yang mengandung klorofil.",
    },
    {
      question: "Pembuluh darah yang membawa darah kaya oksigen dari jantung adalah…",
      options: ["vena", "aorta", "kapiler", "arteri pulmonalis"],
      answerIndex: 1,
      explanation: "Aorta adalah arteri terbesar yang mengalirkan darah kaya oksigen ke tubuh.",
    },
    {
      question: "Proses pembelahan sel untuk pertumbuhan tubuh disebut…",
      options: ["meiosis", "mitosis", "fertilisasi", "difusi"],
      answerIndex: 1,
      explanation: "Mitosis menghasilkan sel anak identik untuk pertumbuhan dan perbaikan.",
    },
    {
      question: "Organ manusia yang berfungsi memompa darah adalah…",
      options: ["hati", "paru-paru", "jantung", "ginjal"],
      answerIndex: 2,
      explanation: "Jantung memompa darah ke seluruh tubuh lewat pembuluh darah.",
    },
    {
      question: "Makhluk hidup yang mampu membuat makanannya sendiri disebut…",
      options: ["konsumen", "dekomposer", "produsen", "predator"],
      answerIndex: 2,
      explanation: "Produsen (tumbuhan) berfotosintesis dan jadi sumber energi ekosistem.",
    },
    {
      question: "Bagian sel yang mengatur seluruh aktivitas sel adalah…",
      options: ["membran sel", "sitoplasma", "nukleus", "dinding sel"],
      answerIndex: 2,
      explanation: "Nukleus (inti sel) menyimpan materi genetik dan mengatur aktivitas sel.",
    },
  ],
  "Bahasa Indonesia": [
    {
      question: "Kalimat berikut yang menggunakan imbuhan me- dengan benar adalah…",
      options: [
        "Dia memfoto pemandangan itu",
        "Dia menfoto pemandangan itu",
        "Dia memoto pemandangan itu",
        "Dia foto pemandangan itu",
      ],
      answerIndex: 1,
      explanation: "Kata 'foto' diawali f, imbuhan me- luluh menjadi 'menfoto'.",
    },
    {
      question: "Kata yang termasuk kata kerja (verba) adalah…",
      options: ["cantik", "berlari", "sangat", "dan"],
      answerIndex: 1,
      explanation: "'Berlari' menyatakan tindakan, jadi termasuk verba.",
    },
    {
      question: "Gagasan utama sebuah paragraf disebut…",
      options: ["kesimpulan", "ide pokok", "argumen", "amanat"],
      answerIndex: 1,
      explanation: "Ide pokok adalah gagasan utama yang dijelaskan kalimat penjelas.",
    },
    {
      question: "'Bunga desa' pada kalimat 'Ia adalah bunga desa' termasuk majas…",
      options: ["personifikasi", "metafora", "hiperbola", "ironi"],
      answerIndex: 1,
      explanation: "Metafora membandingkan tanpa kata 'seperti': gadis cantik = bunga desa.",
    },
    {
      question: "Teks yang bertujuan meyakinkan pembaca disebut teks…",
      options: ["narasi", "deskripsi", "persuasi", "prosedur"],
      answerIndex: 2,
      explanation: "Teks persuasi berisi ajakan dan alasan untuk meyakinkan pembaca.",
    },
    {
      question: "Lawan kata (antonim) dari 'rajin' adalah…",
      options: ["pintar", "malas", "cepat", "kuat"],
      answerIndex: 1,
      explanation: "Antonim rajin adalah malas.",
    },
  ],
}

export function getFallbackQuestions(subject: string): QuizQuestion[] {
  const pool = BANK[subject] ?? BANK["Matematika"]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

/** Validasi soal dari API sebelum dirender (cegah crash/OOB) */
export function isValidQuizQuestion(q: unknown): q is QuizQuestion {
  if (typeof q !== "object" || q === null) return false
  const c = q as {
    question?: unknown
    options?: unknown
    answerIndex?: unknown
    explanation?: unknown
  }
  return (
    typeof c.question === "string" &&
    c.question.length > 0 &&
    Array.isArray(c.options) &&
    c.options.length === 4 &&
    c.options.every((o) => typeof o === "string") &&
    Number.isInteger(c.answerIndex) &&
    (c.answerIndex as number) >= 0 &&
    (c.answerIndex as number) < 4 &&
    typeof c.explanation === "string"
  )
}

export function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return [...questions].sort(() => Math.random() - 0.5)
}
