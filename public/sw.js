/* GAMIFIKATHINK Service Worker — offline dasar (app shell) */
const CACHE = "gamifikathink-v2"
const APP_SHELL = [
  "/",
  "/logo.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE && k !== "gamifikathink-models-v2")
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

function isApiRequest(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("supabase")
  )
}

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isApiRequest(url)) return // network-only untuk API/auth

  // Navigasi: network-first, fallback ke cache "/" saat offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((cache) => cache.put(request, copy))
          return res
        })
        .catch(() =>
          caches.match(request).then((hit) => hit || caches.match("/"))
        )
    )
    return
  }

  // Model 3D AR: cache-first terpisah (jangan masuk APP_SHELL karena besar).
  // Scene Viewer / Quick Look fetch langsung ke server, bukan via SW.
  if (
    url.pathname.startsWith("/models/") ||
    url.pathname.endsWith(".glb") ||
    url.pathname.endsWith(".usdz")
  ) {
    event.respondWith(
      caches.open("gamifikathink-models-v2").then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((res) => {
              if (res.ok) cache.put(request, res.clone())
              return res
            })
        )
      )
    )
    return
  }

  // Aset statis: stale-while-revalidate
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.match(/\.(svg|png|ico|css|js|woff2?)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone()
              caches.open(CACHE).then((cache) => cache.put(request, copy))
            }
            return res
          })
          .catch(() => cached)
        return cached || network
      })
    )
  }
})
