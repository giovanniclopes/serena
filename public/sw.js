const CACHE_VERSION = "2.0.1";
const CACHE_NAME = `serena-v${CACHE_VERSION}`;

const DYNAMIC_CACHE = "serena-dynamic-v1";

const STATIC_CACHE = "serena-static-v1";

const staticAssets = [
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon.svg",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker instalando...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Cacheando assets estáticos");
      return cache.addAll(staticAssets);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker ativando...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("Removendo cache antigo:", cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    url.pathname.includes("/assets/") &&
    (url.pathname.endsWith(".js") || url.pathname.endsWith(".css"))
  ) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            const cacheTime = response.headers.get("sw-cache-time");
            if (cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000) {
              return response;
            }
          }

          return fetch(request).then((fetchResponse) => {
            if (fetchResponse.ok) {
              const responseToCache = fetchResponse.clone();
              const currentTime = Date.now();
              responseToCache.headers.set(
                "sw-cache-time",
                currentTime.toString()
              );
              cache.put(request, responseToCache);
            }
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  if (staticAssets.some((asset) => url.pathname === asset)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request);
      })
    );
    return;
  }

  if (request.destination === "document") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (!response.ok) {
            return caches.match("/");
          }
          return response;
        })
        .catch(() => {
          return caches.match("/");
        })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
