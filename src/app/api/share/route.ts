import { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

function code6(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const title = typeof body.title === "string" ? body.title.slice(0, 100) : "Paket belajar"
    const payload = body.payload ?? {}
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const code = code6()
    const { error } = await supabase.from("shared_packs").insert({
      owner_id: user?.id ?? null, title, payload, code,
    })
    if (error) throw error
    return Response.json({ code })
  } catch {
    return Response.json({ code: null, message: "Gagal share. Jalankan supabase-astra.sql dulu." }, { status: 500 })
  }
}
