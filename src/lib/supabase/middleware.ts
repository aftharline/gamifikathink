import { NextResponse, type NextRequest } from "next/server"

export function updateSession(request: NextRequest) {
  // Auth check ditemporarily disabled — siapa pun bisa akses aplikasi
  // Saat auth diaktifkan lagi, panggil Supabase hanya untuk route yang perlu proteksi.
  // if (
  //   !user &&
  //   !request.nextUrl.pathname.startsWith("/login") &&
  //   !request.nextUrl.pathname.startsWith("/auth") &&
  //   !request.nextUrl.pathname.startsWith("/icons") &&
  //   !request.nextUrl.pathname.startsWith("/models") &&
  //   !request.nextUrl.pathname.endsWith(".glb") &&
  //   !request.nextUrl.pathname.endsWith(".usdz") &&
  //   request.nextUrl.pathname !== "/" &&
  //   request.nextUrl.pathname !== "/sw.js" &&
  //   request.nextUrl.pathname !== "/manifest.webmanifest"
  // ) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = "/login"
  //   return NextResponse.redirect(url)
  // }

  return NextResponse.next({ request })
}
