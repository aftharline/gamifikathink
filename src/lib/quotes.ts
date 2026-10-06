// ponytail: daftar statis, rotasi acak di komponen client (bukan render SSR)

export interface Quote {
  text: string
  source?: string
}

export const LOADING_QUOTES: Quote[] = [
  {
    text: "Otak manusia membentuk memori jangka panjang saat tidur, belajar sebelum tidur lebih melekat.",
  },
  {
    text: "Efek Protogen: informasi yang ditulis ulang dengan kata-kata sendiri mudah diingat 2x lipat.",
  },
  {
    text: "Gurita memiliki tiga jantung, dan dua di antaranya berhenti berdetak saat ia berenang.",
  },
  {
    text: "Cahaya Matahari yang kamu lihat berangkat dari inti Matahari puluhan ribu tahun lalu.",
  },
  {
    text: "Nol pertama dalam sejarah ditemukan matematikawan India, sebelum itu, nol dianggap tidak ada.",
  },
  {
    text: "Menurut Einstein, 'Jika kamu tidak bisa menjelaskan sesuatu secara sederhana, kamu belum memahaminya.'",
    source: "Albert Einstein",
  },
  {
    text: "Hiu sudah ada lebih awal dari pohon, mereka menyusuri laut sejak 400 juta tahun silam.",
  },
  {
    text: "Latihan soal singkat setiap hari lebih efektif daripada belajar marathon semalam sebelum ujian.",
  },
  {
    text: "Aristoteles mengajarkan bahwa kita adalah apa yang kita lakukan berulang-ulang. Keunggulan, maka, bukan tindakan melainkan kebiasaan.",
    source: "Aristoteles (parafrase Will Durant)",
  },
  {
    text: "Air panas bisa membeku lebih cepat daripada air dingin (Efek Mpemba), dan sains masih memperdebatkannya.",
  },
  {
    text: "Satu sendok tanah subur memuat lebih banyak makhluk hidup daripada jumlah manusia di Bumi.",
  },
  {
    text: "Ivanka: 'Kesalahan adalah bukti bahwa kamu sedang mencoba.' Setiap jawaban salah memperkuat ingatan yang benar.",
  },
  {
    text: "Tetesan air hujan jatuh dengan bentuk tidak seperti air mata, melainkan seperti kue bolu mini.",
  },
  {
    text: "Bahasa Indonesia menyerap ribuan kata dari Sanskerta, Arab, Portugis, dan Belanda: bahasa pencilan dunia.",
  },
  {
    text: "Otak memakai sekitar 20% energi tubuh padahal massanya hanya 2%, berpikir itu olahraga sejati.",
  },
  {
    text: "Madu yang ditemukan di makam Mesir kuno masih layak makan setelah 3.000 tahun.",
  },
  {
    text: "Buku pertama yang dicetak Gutenberg adalah Alkitab, sebelum itu, satu buku disalin tangan berbulan-bulan.",
  },
  {
    text: "Musik dengan tempo 60 BPM membantu konsentrasi karena sinkron dengan detak jantung saat santai.",
  },
  {
    text: "Neanderthal sudah menggambar di gua 60 ribu tahun lalu, seni lebih tua dari peradaban kota.",
  },
  {
    text: "Berpikir keras membuat kepala terasa sakit bukan metafora. Otak tidak punya saran rasa nyeri, tapi otot leher dan mata lelah ikut tegang.",
  },
]

export function randomQuote(): Quote {
  return LOADING_QUOTES[Math.floor(Math.random() * LOADING_QUOTES.length)]
}
