export interface ArHotspot {
  id: string
  position: string // "x y z" dalam meter, mis. "0.5 0 0"
  normal: string // "x y z", mis. "1 0 0"
  title: string
  body: string
}

export interface ArQuizItem {
  question: string
  options: string[]
  answerIndex: number
  explanation: string
}

export interface ArModelLicense {
  author: string
  name: string
  /** Opsional — dikosongkan untuk aset milik sendiri (tautan sumber disembunyikan). */
  url?: string
}

export type ArAssetPlaceholder = "glb" | "usdz" | "poster"

export interface ArModel {
  id: string
  subject: "Matematika" | "Fisika" | "Kimia" | "Bahasa Inggris" | "Boss" | "Special"
  title: string
  description: string
  glb: string // "/models/<id>/model.glb"
  /** Opsional — kosongkan bila belum ada USDZ asli (jangan pakai duplikat
   *  model lain: Quick Look akan menampilkan model yang salah). */
  usdz?: string // "/models/<id>/model.usdz"
  poster: string
  license: ArModelLicense
  /** Daftar aset yang masih sementara dan wajib diganti (lihat AR_PLAN.md §3). */
  placeholderAssets?: ArAssetPlaceholder[]
  animations?: string[]
  /** Tunda pemuatan GLB sampai pengguna mengetuk poster. Cocok untuk model besar. */
  deferLoad?: boolean
  /**
   * Putar animasi otomatis saat model dibuka. Default true.
   * Matikan (false) bila animasi menggerakkan model kuat-kuat sehingga
   * hotspot presisi hanya valid di pose diam (mis. dragon).
   */
  autoplay?: boolean
  /**
   * Framing kamera awal (opsional, format atribut model-viewer).
   * Isi bila bounding box model tidak proporsional sehingga auto-frame
   * bawaan membuat subjek utama tampak terlalu kecil (mis. Ryuri:
   * segmen rambut & ekor menjuntai ±35 m ke bawah, karakter utama
   * 1,3 m hanya ~4% viewport bila di-fit penuh).
   */
  cameraTarget?: string // mis. "0m 0.8m 0m"
  cameraOrbit?: string // mis. "0deg 75deg 2.8m"
  fieldOfView?: string // mis. "30deg"
  minCameraOrbit?: string // mis. "auto auto 1m"
  maxCameraOrbit?: string // mis. "auto auto 25m"
  hotspots: ArHotspot[]
  quiz: ArQuizItem[]
  xp: { open: number; hotspotsAll: number; quiz: number }
}

const DEFAULT_XP = { open: 10, hotspotsAll: 15, quiz: 20 }

export const AR_MODELS: ArModel[] = [
  {
    id: "kubus-prisma",
    subject: "Matematika",
    title: "Kubus Rubik 3×3",
    description:
      "Kubus Rubik dengan potongan kuning yang beterbangan. Putar modelnya, kenali sisi, rusuk, dan titik sudutnya, lalu tempatkan di mejamu lewat AR.",
    glb: "/models/kubus-prisma/model-v2.glb",
    usdz: "/models/kubus-prisma/model-v2.usdz",
    poster: "/models/kubus-prisma/poster-v2.png",
    license: {
      author: "Aset pribadi GamifikaThink",
      name: "Milik internal — bukan untuk distribusi ulang",
    },
    animations: ["Animation"],
    hotspots: [
      // Badan rubik statis di tengah (0.08, 1.16, 6.42), sisi 2.24 —
      // panel kuning yang beterbangan diabaikan. Terverifikasi screenshot.
      {
        id: "sisi",
        position: "0.08 1.16 7.57",
        normal: "0 0 1",
        title: "Sisi",
        body: "Sisi depan rubik ini berisi 9 facelet merah 3×3. Kubus punya 6 sisi — hafalkan polanya!",
      },
      {
        id: "rusuk",
        position: "0.08 2.301 7.561",
        normal: "0 1 1",
        title: "Rusuk",
        body: "Rusuk atas-depan tempat dua sisi bertemu. Kubus punya 12 rusuk sama panjang.",
      },
      {
        id: "titik-sudut",
        position: "1.22 2.30 7.56",
        normal: "1 1 1",
        title: "Titik Sudut",
        body: "Potongan sudut punya 3 warna sekaligus. Kubus punya 8 titik sudut.",
      },
    ],
    quiz: [
      {
        question: "Berapa jumlah sisi kubus?",
        options: ["4", "6", "8", "12"],
        answerIndex: 1,
        explanation: "Kubus punya 6 sisi persegi yang kongruen.",
      },
      {
        question: "Volume kubus dengan rusuk 3 cm adalah…",
        options: ["9 cm³", "18 cm³", "27 cm³", "36 cm³"],
        answerIndex: 2,
        explanation: "Volume = rusuk³ = 3 × 3 × 3 = 27 cm³.",
      },
    ],
    xp: DEFAULT_XP,
  },
  {
    id: "grammar-dragon",
    subject: "Boss",
    title: "Grammar Dragon",
    description:
      "Boss penunggu kata-kata. Jelajahi kepak sayapnya dalam 3D (tekan Putar untuk melihat gerakannya), lalu hadirkan ia di kamarmu lewat AR.",
    glb: "/models/grammar-dragon/model-v2.glb",
    usdz: "/models/grammar-dragon/model-v2.usdz",
    poster: "/models/grammar-dragon/poster-v2.png",
    license: {
      author: "Aset pribadi GamifikaThink",
      name: "Milik internal — bukan untuk distribusi ulang",
    },
    animations: ["Take 001"],
    // Model diskala ×0.001 + diangkat agar pas AR; hotspot diposisikan di
    // pose diam (autoplay mati default — lihat bawah) karena animasinya
    // menggerakkan seluruh badan. Jangkar WAJIB di udara luar permukaan:
    // model-viewer menyembunyikan hotspot yang tertanam di dalam mesh.
    // Terverifikasi screenshot per label.
    autoplay: false,
    hotspots: [
      {
        id: "kepala",
        position: "0.1 1.57 1.15",
        normal: "0 0 1",
        title: "Kepala (Head)",
        body: "Vocab: head — kepala. Moncongnya menghadap ke depan, siap menyemburkan grammar fire.",
      },
      {
        id: "badan",
        position: "0 1.6 1.2",
        normal: "0 0 1",
        title: "Badan (Body)",
        body: "Vocab: body — badan. Punggungnya kokoh menopang sepasang sayap raksasa.",
      },
      {
        id: "sayap",
        position: "0.9 1.63 0.3",
        normal: "0.3 0.2 1",
        title: "Sayap (Wing)",
        body: "Vocab: wing — sayap. Bentangannya hampir 2 meter — cocok untuk serangan udara.",
      },
    ],
    quiz: [
      {
        question: 'Bahasa Inggris dari "sayap" adalah…',
        options: ["head", "body", "tail", "wing"],
        answerIndex: 3,
        explanation: "Wing = sayap. Head = kepala, body = badan, tail = ekor.",
      },
      {
        question: "Which sentence is correct?",
        options: [
          "The dragon run fast.",
          "The dragon runs fast.",
          "The dragon running fast.",
          "The dragon runned fast.",
        ],
        answerIndex: 1,
        explanation:
          "Subjek tunggal (the dragon) + present simple → verb + s: runs.",
      },
    ],
    xp: DEFAULT_XP,
  },
  {
    id: "molekul-h2o",
    subject: "Kimia",
    title: "Molekul Air (H₂O)",
    description:
      "Struktur ikatan kovalen molekul air. Terdiri dari 1 atom Oksigen (merah) dan 2 atom Hidrogen (putih) dengan sudut ikatan 104.5°.",
    glb: "/models/molekul-h2o/model-v2.glb",
    usdz: "/models/molekul-h2o/model-v2.usdz",
    poster: "/models/molekul-h2o/poster-v2.png",
    license: {
      author: "GamifikaThink 3D Lab",
      name: "CC-BY 4.0",
    },
    hotspots: [
      {
        id: "atom-oksigen",
        position: "0 0 0",
        normal: "0 1 0",
        title: "Atom Oksigen (O)",
        body: "Atom Oksigen berada di pusat molekul dengan keelektronegatifan tinggi yang menarik elektron ikatan.",
      },
      {
        id: "atom-hidrogen",
        position: "0.6 0.5 0",
        normal: "1 1 0",
        title: "Atom Hidrogen (H)",
        body: "Dua atom hidrogen terikat pada atom oksigen membentuk struktur molekul polar.",
      },
      {
        id: "sudut-ikatan",
        position: "0 0.4 0",
        normal: "0 1 0",
        title: "Sudut Ikatan (104.5°)",
        body: "Sudut antara dua ikatan O-H adalah 104.5° akibat dorongan pasangan elektron bebas Oksigen.",
      },
    ],
    quiz: [
      {
        question: "Berapa sudut ikatan molekul air (H₂O)?",
        options: ["90°", "104.5°", "120°", "180°"],
        answerIndex: 1,
        explanation: "Sudut ikatan molekul air secara eksperimental adalah 104.5°.",
      },
      {
        question: "Unsur penyusun molekul air adalah…",
        options: [
          "1 Oksigen & 1 Hidrogen",
          "2 Oksigen & 1 Hidrogen",
          "1 Oksigen & 2 Hidrogen",
          "2 Oksigen & 2 Hidrogen",
        ],
        answerIndex: 2,
        explanation: "H₂O terdiri dari 2 atom Hidrogen (H) dan 1 atom Oksigen (O).",
      },
    ],
    xp: DEFAULT_XP,
  },
  {
    id: "magnet-batang",
    subject: "Fisika",
    title: "Magnet Batang & Garis Gaya",
    description:
      "Magnet batang dengan kutub Utara (merah) dan Selatan (biru), diliputi visualisasi garis medan magnetik 3D.",
    glb: "/models/magnet-batang/model-v2.glb",
    usdz: "/models/magnet-batang/model-v2.usdz",
    poster: "/models/magnet-batang/poster-v2.png",
    license: {
      author: "GamifikaThink 3D Lab",
      name: "CC-BY 4.0",
    },
    hotspots: [
      {
        id: "kutub-utara",
        position: "0 0 0.4",
        normal: "0 0 1",
        title: "Kutub Utara (N / North)",
        body: "Garis gaya magnetik keluar dari Kutub Utara dan menuju ke Kutub Selatan.",
      },
      {
        id: "kutub-selatan",
        position: "0 0 -0.4",
        normal: "0 0 -1",
        title: "Kutub Selatan (S / South)",
        body: "Garis gaya magnetik masuk kembali ke Kutub Selatan membentuk loop tertutup.",
      },
      {
        id: "garis-gaya",
        position: "0 0.8 0",
        normal: "0 1 0",
        title: "Medan Magnet (Magnetic Field)",
        body: "Wilayah di sekitar magnet di mana gaya magnetik masih bekerja.",
      },
    ],
    quiz: [
      {
        question: "Arah garis medan magnet di luar magnet adalah…",
        options: [
          "Dari Kutub Selatan ke Utara",
          "Dari Kutub Utara ke Selatan",
          "Memancar ke segala arah",
          "Melingkar tanpa arah",
        ],
        answerIndex: 1,
        explanation: "Di luar magnet, garis medan magnet selalu keluar dari Kutub Utara menuju Kutub Selatan.",
      },
      {
        question: "Dua kutub magnet yang senama jika didekatkan akan…",
        options: ["Tolak-menolak", "Tarik-menarik", "Berdiam diri", "Meleleh"],
        answerIndex: 0,
        explanation: "Kutub sejenis (U-U atau S-S) tolak-menolak, sedangkan kutub berlawanan tarik-menarik.",
      },
    ],
    xp: DEFAULT_XP,
  },
  {
    id: "bandul",
    subject: "Fisika",
    title: "Bandul Sederhana (Pendulum)",
    description:
      "Model bandul mekanika klasik. Terdiri dari tiang penyangga, tali pengantung, dan beban bola kuningan.",
    glb: "/models/bandul/model-v2.glb",
    usdz: "/models/bandul/model-v2.usdz",
    poster: "/models/bandul/poster-v2.png",
    license: {
      author: "GamifikaThink 3D Lab",
      name: "CC-BY 4.0",
    },
    hotspots: [
      {
        id: "titik-gantung",
        position: "0 1.2 0",
        normal: "0 1 0",
        title: "Titik Gantung",
        body: "Poros tempat tali bandul terikat secara bebas tanpa gesekan berlebih.",
      },
      {
        id: "tali",
        position: "0 0.7 0",
        normal: "1 0 0",
        title: "Panjang Tali (l)",
        body: "Periode ayunan bandul dipengaruhi oleh panjang tali dan percepatan gravitasi bumi.",
      },
      {
        id: "beban",
        position: "0 0.2 0",
        normal: "0 -1 0",
        title: "Beban Bandul (m)",
        body: "Bebal bola logam yang berayun periodik melewati titik kesetimbangan.",
      },
    ],
    quiz: [
      {
        question: "Faktor yang mempengaruhi periode ayunan bandul sederhana adalah…",
        options: [
          "Massa beban & panjang tali",
          "Panjang tali & gravitasi",
          "Warna bola & temperatur",
          "Bahan tali & massa beban",
        ],
        answerIndex: 1,
        explanation: "Periode T = 2π√(l/g) — hanya dipengaruhi oleh panjang tali (l) dan gravitasi (g).",
      },
      {
        question: "Satu getaran penuh pada bandul adalah gerakan…",
        options: [
          "Dari titik awal ke titik setimbang",
          "Dari simpangan kanan ke simpangan kiri",
          "Kembali lagi ke titik awal semula",
          "Hanya gerakan turun saja",
        ],
        answerIndex: 2,
        explanation: "Satu getaran didefinisikan sebagai gerak bolak-balik hingga kembali ke posisi awal.",
      },
    ],
    xp: DEFAULT_XP,
  },
  {
    id: "castle",
    subject: "Bahasa Inggris",
    title: "English Vocab Castle",
    description:
      "Kastil edukasi bahasa Inggris. Pelajari kosakata tempat dan bagian arsitektur kastil dalam Bahasa Inggris secara interaktif.",
    glb: "/models/castle/model-v2.glb",
    usdz: "/models/castle/model-v2.usdz",
    poster: "/models/castle/poster-v2.png",
    license: {
      author: "GamifikaThink 3D Lab",
      name: "CC-BY 4.0",
    },
    hotspots: [
      {
        id: "main-tower",
        position: "0 1.2 0",
        normal: "0 1 0",
        title: "Keep / Main Tower",
        body: "Vocab: Keep — Menara utama benteng yang paling kokoh dan menjadi tempat perlindungan terakhir.",
      },
      {
        id: "corner-tower",
        position: "0.6 1.6 0.6",
        normal: "1 1 1",
        title: "Turret / Watchtower",
        body: "Vocab: Turret — Menara pengawas di sudut benteng untuk memantau kedatangan musuh.",
      },
      {
        id: "gatehouse",
        position: "0 0.25 0.55",
        normal: "0 0 1",
        title: "Gatehouse / Main Gate",
        body: "Vocab: Gatehouse — Gerbang masuk utama kastil yang dilengkapi jembatan angkat.",
      },
    ],
    quiz: [
      {
        question: 'Bahasa Inggris dari "menara pengawas" di benteng/kastil adalah…',
        options: ["Window", "Roof", "Turret", "Bridge"],
        answerIndex: 2,
        explanation: "Turret = menara kecil/pengawas di sudut benteng.",
      },
      {
        question: "What is the primary function of a Castle Keep?",
        options: [
          "To store water",
          "Main fortified tower for defense",
          "A place to park cars",
          "A swimming pool",
        ],
        answerIndex: 1,
        explanation: "The Keep is the central, strongly fortified tower of a medieval castle.",
      },
    ],
    xp: DEFAULT_XP,
  },
  {
    id: "ryuri",
    subject: "Special",
    title: "Ryuri — Spirit Companion",
    description:
      "Karakter pendamping magis Ryuri. Karakter 1,3 m difokuskan otomatis oleh kamera (segmen rambut & ekor aset mentah menjuntai jauh ke bawah — zoom out untuk melihat utuh), lalu tempatkan ia di sisimu lewat Kamera AR Web.",
    glb: "/models/ryuri/model-v3.glb",
    // USDZ asli belum ada — file lama adalah duplikat kubus (dihapus).
    // Sengaja dikosongkan agar Quick Look tidak menampilkan model yang salah.
    poster: "/models/ryuri/poster-v2.svg",
    license: {
      author: "Aset pribadi GamifikaThink",
      name: "Milik internal — Special Release",
    },
    placeholderAssets: ["usdz", "poster"],
    // Urutan sesuai isi GLB; default Idle_Static (6 channel, pose diam ringan).
    // autoplay:false seperti dragon — klip Idle/Run (645 channel) berisiko
    // root-motion menggeser framing + hotspot hanya valid di pose diam.
    animations: ["Idle_Static", "Idle", "Run", "T_Pose"],
    autoplay: false,
    deferLoad: true,
    // Framing eksplisit ke karakter utama (kepala Y≈1,1–1,3; badan Y≈0–1,1).
    // Tanpa ini auto-frame mem-fit bbox 36 m sehingga karakter tak terlihat.
    // Terverifikasi visual via screenshot headless (2026-09-17).
    cameraTarget: "0m 1m 0m",
    cameraOrbit: "0deg 72deg 7m",
    fieldOfView: "40deg",
    minCameraOrbit: "auto auto 1.5m",
    maxCameraOrbit: "auto auto 40m",
    hotspots: [
      {
        id: "karakter",
        position: "0 1.15 0.12",
        normal: "0 0 1",
        title: "Ryuri Spirit",
        body: "Karakter pendamping magis dengan kekuatan mistis dan animasi dinamis. Wajah & tanduk berada di sekitar titik ini.",
      },
      {
        id: "aura",
        position: "0 0.6 0.5",
        normal: "0 0.2 1",
        title: "Aura Magis",
        body: "Perisai energi misterius yang mengelilingi karakter Ryuri. Titik ini melayang di depan badan agar tidak tertanam di mesh.",
      },
    ],
    quiz: [
      {
        question: "Apa peran karakter Ryuri di GamifikaThink AR Lab?",
        options: [
          "Special Spirit Companion",
          "Boss Matematika",
          "Kalkulator Fisika",
          "Kastil Vocab",
        ],
        answerIndex: 0,
        explanation: "Ryuri adalah Special Spirit Companion (karakter pendamping spesial).",
      },
      {
        question: "Berapa jumlah pose animasi yang dimiliki oleh Ryuri?",
        options: ["1 pose", "2 pose", "4 pose", "8 pose"],
        answerIndex: 2,
        explanation: "Ryuri memiliki 4 pose animasi: Idle, Idle_Static, Run, dan T_Pose.",
      },
    ],
    xp: DEFAULT_XP,
  },
]

export function getArModel(id: string): ArModel | undefined {
  return AR_MODELS.find((m) => m.id === id)
}

export function getRelatedModels(subject: string): ArModel[] {
  return AR_MODELS.filter((m) => m.subject === subject)
}

export const AR_SUBJECTS = [
  "Matematika",
  "Fisika",
  "Kimia",
  "Bahasa Inggris",
  "Boss",
  "Special",
] as const
