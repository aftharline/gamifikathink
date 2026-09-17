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
}

const BANK: Record<string, QuizQuestion[]> = {
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
}

export function getFallbackQuestions(subject: string): QuizQuestion[] {
  const pool = BANK[subject] ?? BANK["Matematika"]
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 5)
}

export function shuffleQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return [...questions].sort(() => Math.random() - 0.5)
}
