// Service Worker — Permet d'installer le jeu sur téléphone et d'y jouer 100% hors-ligne !

const CACHE_NAME = "dichou-space-marine-v7";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/data.js",
  "./js/audio.js",
  "./js/questions.js",
  "./js/storage.js",
  "./js/app.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/images/armor_1.jpg",
  "./assets/images/armor_2.jpg",
  "./assets/images/armor_3.jpg",
  "./assets/images/armor_4.jpg",
  "./assets/images/armor_5.jpg",
  "./assets/images/monster_grot.jpg",
  "./assets/images/monster_nurgling.jpg",
  "./assets/images/monster_termagant.jpg",
  "./assets/images/monster_ork_boy.jpg",
  "./assets/images/monster_necron.jpg",
  "./assets/images/monster_squig.svg",
  "./assets/images/monster_chaos_marine.svg",
  "./assets/images/monster_ork_boss.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = event.request.url;
  if (url.includes("firebasedatabase.app") || url.includes("firebaseio.com")) {
    return;
  }

  // Network-First pour HTML / JS / CSS afin d'avoir toujours les mises à jour immédiatement
  const isCode =
    event.request.mode === "navigate" ||
    url.endsWith(".html") ||
    url.endsWith(".js") ||
    url.endsWith(".css") ||
    url.endsWith(".webmanifest");

  if (isCode) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Cache-First pour les images (rapide & hors-ligne)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === "basic") {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
