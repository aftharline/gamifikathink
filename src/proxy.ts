import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Refresh sesi Supabase tiap request. Mode opsional: TIDAK redirect paksa,
// tamu tetap bisa main; penyimpanan (XP/riwayat) aktif hanya saat login.
export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  // Lewati aset statis agar ringan
  const p = request.nextUrl.pathname
  if (
    p.startsWith("/_next") ||
    p.startsWith("/icons") ||
    p.startsWith("/models") ||
    p.endsWith(".glb") ||
    p.endsWith(".usdz") ||
    p === "/sw.js" ||
    p === "/manifest.webmanifest" ||
    p === "/favicon.ico"
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh sesi (mtoken kedaluwarsa diperbarui di cookie respons)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
