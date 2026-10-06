import type { LucideIcon } from "lucide-react"
import {
  Crosshair, Clock3, Atom, TrendingUp, Microscope, Brain,
  Pizza, Cog, FlaskConical, Leaf, CloudRainWind, SpellCheck,
  Store, Map as MapIcon, ScrollText, Shield, Magnet, ArrowDownWideNarrow,
} from "lucide-react"

export interface LabEntry {
  slug: string
  title: string
  subject: string
  desc: string
  icon: LucideIcon
  prereq?: string
  greeting: string
  story: [string, string, string]
}

export const LABS: LabEntry[] = [
  { slug: "proyektil", title: "Meriam Proyektil", subject: "Fisika", desc: "Atur sudut dan kecepatan, lihat parabola dan jarak tempuh.", icon: Crosshair,
    greeting: "Aku Robo! Bantu aku menembak tepat ke target sejauh mungkin.",
    story: ["Misi: tembakkan meriam pertamamu", "Konflik: gravitasi planet berubah-ubah", "Bos: pecahkan rekor jarak terjauhmu"] },
  { slug: "bandul", title: "Bandul 3D", subject: "Fisika", desc: "Ubah panjang tali dan gravitasi, ukur periode live.", icon: Clock3, prereq: "proyektil",
    greeting: "Bandulku berhenti! Cari tahu rahasia periodenya bersamaku.",
    story: ["Misi: ayunkan bandul pertama", "Konflik: bandingkan Bumi melawan Bulan", "Bos: tebak periode tanpa melihat jawaban"] },
  { slug: "h2o", title: "Molekul H2O 3D", subject: "Kimia", desc: "Putar molekul, geser sudut ikatan 90-120 derajat.", icon: Atom,
    greeting: "Kenalan dengan molekul paling penting di Bumi: air!",
    story: ["Misi: kenali atom O dan H", "Konflik: pasangan elektron bebas menekan sudut", "Bos: bandingkan dengan CO2 yang lurus"] },
  { slug: "grafik", title: "Grafik Fungsi", subject: "Matematika", desc: "Geser a/b/c, lihat parabola plus akar dan puncak.", icon: TrendingUp,
    greeting: "Parabola liar ini butuh dijinakkan. Geser dan amati!",
    story: ["Misi: gambar parabola pertamamu", "Konflik: diskriminan mengubah jumlah akar", "Bos: buktikan Pythagoras 3-4-5"] },
  { slug: "sel", title: "Sel Tumbuhan", subject: "Biologi", desc: "Klik organel, pelajari fungsi plus kuis.", icon: Microscope, prereq: "grafik",
    greeting: "Selamat datang di dalam daun! Ayo kelilingi organelnya.",
    story: ["Misi: kunjungi 5 organel", "Konflik: tebak nama yang disembunyikan", "Bos: kuis 3 soal beruntun"] },
  { slug: "otak-visual", title: "Otak Visual", subject: "Umum", desc: "Stroop warna, reflek tap, memori pola grid.", icon: Brain,
    greeting: "Latihan untuk otak kilatmu. Mulai dari yang paling seru!",
    story: ["Misi: selesaikan 10 ronde Stroop", "Konflik: kejar reflek di bawah 400 ms", "Bos: taklukkan pola level 6"] },
  { slug: "pecahan", title: "Pizza Pecahan", subject: "Matematika", desc: "Geser pembilang penyebut, potong pizza dan bandingkan.", icon: Pizza,
    greeting: "Lapar? Kita potong pizza sambil belajar pecahan!",
    story: ["Misi: potong pizza pertamamu", "Konflik: bandingkan dua pecahan", "Bos: samakan penyebut tanpa kalkulator"] },
  { slug: "katrol", title: "Katrol & Bidang Miring", subject: "Fisika", desc: "Geser sudut dan massa, lihat gaya dan percepatan live.", icon: Cog,
    greeting: "Bantu angkat beban berat dengan fisika sederhana!",
    story: ["Misi: angkat beban pertama", "Konflik: sudut makin curam, gaya membesar", "Bos: cari sudut termudah mengangkat"] },
  { slug: "ph-mixer", title: "Lab pH Mixer", subject: "Kimia", desc: "Teteskan asam dan basa, warna dan angka pH berubah live.", icon: FlaskConical,
    greeting: "Racik ramuanmu! Hati-hati, pH bisa melonjak.",
    story: ["Misi: buat larutan netral pH 7", "Konflik: tetes berlebih mengubah segalanya", "Bos: tebak sifat dari warnanya"] },
  { slug: "rantai-makanan", title: "Rantai Makanan", subject: "Biologi", desc: "Susun produsen ke predator, simulasikan populasinya.", icon: Leaf,
    greeting: "Ekosistem butuh keseimbangan. Susun rantainya!",
    story: ["Misi: susun rantai 4 tingkat", "Konflik: predator hilang, apa yang terjadi?", "Bos: selamatkan populasi 20 musim"] },
  { slug: "word-drop", title: "Word Drop", subject: "Bahasa Inggris", desc: "Tangkap kata yang jatuh sesuai kategorinya.", icon: CloudRainWind,
    greeting: "Kata-kata berjatuhan! Tangkap yang benar saja.",
    story: ["Misi: tangkap 5 kata hewan", "Konflik: kata makin cepat jatuh", "Bos: raih kombo x5 tanpa salah"] },
  { slug: "imbuhan", title: "Imbuhan Lab", subject: "Bahasa Indonesia", desc: "Tempel me- di- ke- ke kata dasar, lihat peluluhan.", icon: SpellCheck,
    greeting: "Sihir imbuhan mengubah kata! Coba tempelkan.",
    story: ["Misi: ubah 3 kata kerja", "Konflik: huruf luluh saat bertemu me-", "Bos: kuis 5 kata tanpa salah"] },
  { slug: "pasar", title: "Pasar Mini", subject: "Ekonomi", desc: "Geser supply demand, titik ekuilibrium dan harga bergerak.", icon: Store,
    greeting: "Selamat datang di pasarku! Atur harga biar laris.",
    story: ["Misi: temukan harga seimbang", "Konflik: permintaan melonjak tiba-tiba", "Bos: ramalkan harga 3 skenario"] },
  { slug: "peta-lapisan", title: "Peta Lapisan", subject: "Geografi", desc: "Nyalakan lapisan curah hujan suhu vegetasi di peta.", icon: MapIcon,
    greeting: "Indonesia dari atas! Nyalakan lapisannya satu per satu.",
    story: ["Misi: nyalakan 3 lapisan", "Konflik: cocokkan pola hujan dan hutan", "Bos: tebak provinsi dari polanya"] },
  { slug: "timeline", title: "Timeline Sejarah", subject: "Sejarah", desc: "Geser abad, kartu peristiwa dan peta ikut berubah.", icon: ScrollText,
    greeting: "Mesin waktu siap! Kita melompat antar abad.",
    story: ["Misi: kunjungi 3 abad", "Konflik: urutkan peristiwa yang acak", "Bos: kuis kilat 5 peristiwa"] },
  { slug: "garuda", title: "Garuda Pancasila", subject: "PPKn", desc: "Klik tiap sila, pelajari contoh dan ikut kuis.", icon: Shield,
    greeting: "Lima sila, satu Indonesia. Hafalkan bersamaku!",
    story: ["Misi: kunjungi 5 sila", "Konflik: bedakan contoh yang mirip", "Bos: kuis 5 sila tanpa salah"] },
  { slug: "magnet", title: "Magnet Lab", subject: "IPA", desc: "Dekatkan kutub, serbuk besi dan kompas bereaksi.", icon: Magnet,
    greeting: "Mainkan gaya tak terlihat: magnet!",
    story: ["Misi: temukan kutub yang tolak-menolak", "Konflik: jarak mengubah kekuatan", "Bos: susun 3 magnet agar seimbang"] },
  { slug: "sorting", title: "Sorting Visual", subject: "Informatika", desc: "Lihat algoritma mengurutkan balok langkah demi langkah.", icon: ArrowDownWideNarrow,
    greeting: "Komputer mengurut dengan langkah pasti. Ikuti jejaknya!",
    story: ["Misi: urutkan 6 balok", "Konflik: bandingkan bubble vs selection", "Bos: tebak langkah berikutnya"] },
]

export function getLab(slug: string): LabEntry | undefined {
  return LABS.find((l) => l.slug === slug)
}
