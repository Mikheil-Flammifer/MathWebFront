// Migration worker for clients that installed the former PWA worker.
//
// It intentionally has no fetch handler: all requests go to the network.
// Its only purpose is to remove caches that may contain authenticated API
// responses, then let the application unregister it on the next page load.
const LEGACY_CACHE_PREFIX = 'mathweb-'

async function removeLegacyCaches() {
  const keys = await caches.keys()
  await Promise.all(
    keys
      .filter((key) => key.startsWith(LEGACY_CACHE_PREFIX))
      .map((key) => caches.delete(key))
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(removeLegacyCaches().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(removeLegacyCaches().then(() => self.clients.claim()))
})