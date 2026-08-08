/* Service Worker minimal para hacer la app instalable (PWA).
   Estrategia: offline-first para estáticos con versión en semilla;
   en fallback de navegación devuelve la página raíz. */
const CACHE = "tino-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(["/offline.html"]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Navegaciones: red a la red, offline → página raíz cacheada.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./", copy));
          return res;
        })
        .catch(() =>
          caches.match("./").then((m) => m || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // Estáticos: cache-first con actualización en segundo plano.
  e.respondWith(
    caches.match(req).then((hit) => {
      const next = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || next;
    })
  );
});