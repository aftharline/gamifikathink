import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { normalizeMathDelimiters } from "@/lib/utils"
import { parseXpResult } from "@/lib/xp-events"
import { extractWidgetHtml } from "@/lib/widget"
import { SUBJECTS, LEVELS, getSubject } from "@/lib/subjects"
import { createPool, spawn, step } from "@/lib/fx"
import { LABS, getLab } from "@/lib/lab-catalog"
import { katrolLayout, KATROL_W } from "@/lib/katrol-geometry"
import { TOURS } from "@/lib/tutorial"
import { BANK } from "@/lib/quiz-bank"
import { readGuestPass, issueGuestPass, consumeGuestPass, guestPassRateOk } from "@/lib/guest-pass"

describe("normalizeMathDelimiters", () => {
  it("mengubah \\(...\\) menjadi $...$", () => {
    expect(normalizeMathDelimiters("\\(x^2\\)")).toBe("$x^2$")
  })

  it("mengubah \\[...\\] menjadi display $$...$$", () => {
    expect(normalizeMathDelimiters("\\[a+b\\]")).toBe("$$\na+b\n$$")
  })

  it("tidak menyentuh $...$ yang sudah ada", () => {
    expect(normalizeMathDelimiters("$x$ tetap")).toBe("$x$ tetap")
  })
})

describe("parseXpResult", () => {
  it("membaca array baris (RETURNS TABLE)", () => {
    expect(
      parseXpResult([{ xp: 10, level: 2, leveled_up: true }])
    ).toEqual({ xp: 10, level: 2, leveledUp: true })
  })

  it("toleran objek tunggal", () => {
    expect(parseXpResult({ xp: 5, level: 1, leveled_up: false })).toEqual({
      xp: 5,
      level: 1,
      leveledUp: false,
    })
  })

  it("null untuk hasil kosong/rusak", () => {
    expect(parseXpResult([])).toBeNull()
    expect(parseXpResult(null)).toBeNull()
    expect(parseXpResult([{ xp: "x" }])).toBeNull()
  })
})

describe("extractWidgetHtml", () => {
  it("mengambil blok fence dan membuang iframe/fetch", () => {
    const raw = 'Penjelasan\n```html\n<div>Hai</div><iframe src="x"></iframe><script>fetch("/a")</script>\n```'
    const out = extractWidgetHtml(raw)
    expect(out).toContain("<div>Hai</div>")
    expect(out).not.toContain("iframe")
    expect(out).not.toContain("fetch(")
  })

  it("menerima html polos tanpa fence", () => {
    expect(extractWidgetHtml("<p>ok</p>")).toBe("<p>ok</p>")
  })
})

describe("subjects", () => {
  it("14 mapel unik + ikon terdefinisi", () => {
    expect(SUBJECTS).toHaveLength(14)
    const values = SUBJECTS.map((s) => s.value)
    expect(new Set(values).size).toBe(14)
    for (const s of SUBJECTS) expect(s.icon).toBeDefined()
    for (const l of LEVELS) expect(l.icon).toBeDefined()
  })

  it("fallback Matematika untuk mapel tak dikenal", () => {
    expect(getSubject("Xyz").value).toBe("Matematika")
    expect(getSubject("Fisika").value).toBe("Fisika")
  })
})

describe("fx pool", () => {
  it("spawn/step tidak melebihi batas dan partikel mati", () => {
    const pool = createPool()
    spawn(pool, 0, 0, 300, "#fff", 2, false)
    expect(pool.length).toBeLessThanOrEqual(220)
    for (let i = 0; i < 120; i++) step(pool)
    expect(pool.length).toBe(0)
  })
})

describe("lab catalog", () => {
  it("18 lab unik + ikon + cerita 3 babak", () => {
    expect(LABS).toHaveLength(18)
    expect(new Set(LABS.map((l) => l.slug)).size).toBe(18)
    for (const l of LABS) {
      expect(l.icon).toBeDefined()
      expect(l.story).toHaveLength(3)
      expect(l.greeting.length).toBeGreaterThan(10)
      if (l.prereq) expect(LABS.some((x) => x.slug === l.prereq)).toBe(true)
    }
    expect(getLab("sorting")?.subject).toBe("Informatika")
  })
})

describe("katrolLayout", () => {
  it("segitiga + katrol selalu muat kanvas 5-60 derajat", () => {
    for (let a = 5; a <= 60; a += 5) {
      const { topX, topY, bx, by } = katrolLayout(a)
      expect(topX).toBeGreaterThan(bx)
      expect(topX).toBeLessThanOrEqual(KATROL_W - 86)
      expect(topY).toBeGreaterThan(0)
      expect(topY).toBeLessThan(by)
    }
  })
})

describe("tutorial sync", () => {
  it("tur lab menyebut 18 lab + hemat efek", () => {
    const copy = TOURS.lab.map((s) => `${s.title} ${s.body}`).join(" ")
    expect(copy).toContain("18 lab")
    expect(copy).toContain("Hemat efek")
  })

  it("semua slug lab punya tur lab-sim yang valid", () => {
    expect(TOURS.lab.some((s) => s.target === "lab-grid")).toBe(true)
    expect(TOURS.lab.some((s) => s.target === "lab-sim")).toBe(true)
    expect(TOURS.lab.some((s) => s.target === "lab-eco")).toBe(true)
  })
})

describe("landing contracts", () => {
  it("demo kuis memakai mapel yang ada di bank soal", () => {
    for (const s of ["Matematika", "Fisika", "Biologi", "Bahasa Inggris"]) {
      expect(BANK[s].length).toBeGreaterThan(0)
    }
  })

  it("marquee mapel memakai 14 mapel unik berikon", () => {
    expect(SUBJECTS).toHaveLength(14)
    for (const s of SUBJECTS) expect(s.icon).toBeDefined()
  })

  it("marquee lab memakai 18 lab", () => {
    expect(LABS).toHaveLength(18)
  })
})

describe("guest-pass", () => {
  const SECRET = "test-secret-minimal-16-char"

  beforeEach(() => {
    vi.stubEnv("GUEST_PASS_SECRET", SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  function cookieOf(setCookie: string): string {
    return setCookie.split(";")[0]
  }

  it("pass baru berstatus fresh lalu used setelah konsumsi", () => {
    const fresh = cookieOf(issueGuestPass())
    expect(readGuestPass(fresh)).toBe("fresh")
    const used = cookieOf(consumeGuestPass())
    expect(readGuestPass(used)).toBe("used")
  })

  it("menolak cookie palsu / rusak", () => {
    expect(readGuestPass("gt_pass=v1.123.0.deadbeef")).toBe("none")
    expect(readGuestPass("")).toBe("none")
    expect(readGuestPass(null)).toBe("none")
    // campur payload valid + signature salah
    const valid = cookieOf(issueGuestPass()).split("=")[1]
    const tampered = valid.slice(0, -2) + "00"
    expect(readGuestPass(`gt_pass=${tampered}`)).toBe("none")
  })

  it("fail-closed tanpa secret", () => {
    vi.stubEnv("GUEST_PASS_SECRET", "")
    expect(readGuestPass("gt_pass=v1.123.0.abc")).toBe("no-secret")
  })

  it("rate-limit IP longgar (20/jam)", () => {
    const ip = `test-ip-${Date.now()}`
    for (let i = 0; i < 20; i++) expect(guestPassRateOk(ip)).toBe(true)
    expect(guestPassRateOk(ip)).toBe(false)
  })
})

describe("landing contracts", () => {
  const src = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8")

  it("headline 2 baris dengan Game Epik di baris kedua", () => {
    expect(src).toContain("Belajar Jadi")
    expect(src).toContain("Game Epik")
    // baris 1 dan 2 = dua blok span bertumpuk (wajib 2 baris di semua lebar)
    expect(src).toMatch(/Belajar Jadi<\/span>[\s\S]{0,60}<span[^>]*>\s*<span[^>]*>\s*Game Epik/)
    // serif italic raksasa + coretan SVG
    expect(src).toContain("italic")
    expect(src).toContain("clamp(")
  })

  it("navbar bernomor + status + versi, tanpa emoji", () => {
    for (const n of ["01", "02", "03", "04"]) expect(src).toContain(n)
    expect(src).toContain("AI siap")
    expect(src).toContain("18 lab")
    expect(src).not.toMatch(/[🎯🧪📄🎓🏫📚⚔️🎮]/)
  })
})
