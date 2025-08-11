/**
 * Service Worker for Kamlease - Performance and Caching Optimization
 */

const CACHE_NAME = 'kamlease-v1'
const STATIC_CACHE = 'kamlease-static-v1'
const DYNAMIC_CACHE = 'kamlease-dynamic-v1'
const API_CACHE = 'kamlease-api-v1'

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/fonts/inter/Inter-VariableFont_opsz,wght.ttf',
  '/assets/fonts/space-grotesk/SpaceGrotesk-VariableFont_wght.ttf',
  '/assets/logos/Logo couleur.svg',
  '/assets/logos/Logo White for black background.svg',
  '/favicon.svg'
]

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only'
}

// Route patterns and their strategies
const ROUTE_STRATEGIES = [
  {
    pattern: /\.(js|css|woff2?|png|jpg|jpeg|svg|ico)$/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cacheName: STATIC_CACHE,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    maxEntries: 100
  },
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: API_CACHE,
    maxAge: 5 * 60 * 1000, // 5 minutes
    maxEntries: 50
  },
  {
    pattern: /\.(html|htm)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cacheName: DYNAMIC_CACHE,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxEntries: 20
  }
]

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  const url = new URL(event.request.url)
  const strategy = getStrategyForRequest(event.request)

  if (strategy) {
    event.respondWith(handleRequest(event.request, strategy))
  }
})

/**
 * Get caching strategy for a request
 */
function getStrategyForRequest(request) {
  const url = new URL(request.url)
  
  for (const route of ROUTE_STRATEGIES) {
    if (route.pattern.test(url.pathname) || route.pattern.test(url.href)) {
      return route
    }
  }
  
  // Default strategy for unmatched requests
  return {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cacheName: DYNAMIC_CACHE,
    maxAge: 60 * 60 * 1000, // 1 hour
    maxEntries: 30
  }
}

/**
 * Handle request based on caching strategy
 */
async function handleRequest(request, strategyConfig) {
  const { strategy, cacheName, maxAge, maxEntries } = strategyConfig

  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName, maxAge, maxEntries)
    
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName, maxAge, maxEntries)
    
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName, maxAge, maxEntries)
    
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request)
    
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request)
    
    default:
      return networkFirst(request, cacheName, maxAge, maxEntries)
  }
}

/**
 * Cache First strategy
 */
async function cacheFirst(request, cacheName, maxAge, maxEntries) {
  try {
    const cache = await caches.open(cacheName)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      await cleanupCache(cache, maxEntries)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache First strategy failed:', error)
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Network error', { status: 408 })
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request, cacheName, maxAge, maxEntries) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      await cleanupCache(cache, maxEntries)
      await cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Network First strategy failed:', error)
    const cachedResponse = await caches.match(request)
    return cachedResponse || new Response('Network error', { status: 408 })
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request, cacheName, maxAge, maxEntries) {
  const cache = await caches.open(cacheName)
  const cachedResponse = await cache.match(request)
  
  // Fetch in background to update cache
  const fetchPromise = fetch(request).then(async (networkResponse) => {
    if (networkResponse.ok) {
      await cleanupCache(cache, maxEntries)
      await cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch((error) => {
    console.error('Background fetch failed:', error)
  })
  
  // Return cached response immediately if available
  if (cachedResponse && !isExpired(cachedResponse, maxAge)) {
    return cachedResponse
  }
  
  // Wait for network response if no cache or expired
  return fetchPromise
}

/**
 * Check if cached response is expired
 */
function isExpired(response, maxAge) {
  if (!maxAge) return false
  
  const dateHeader = response.headers.get('date')
  if (!dateHeader) return false
  
  const responseDate = new Date(dateHeader)
  const now = new Date()
  
  return (now.getTime() - responseDate.getTime()) > maxAge
}

/**
 * Clean up cache to respect maxEntries limit
 */
async function cleanupCache(cache, maxEntries) {
  if (!maxEntries) return
  
  const requests = await cache.keys()
  
  if (requests.length >= maxEntries) {
    // Remove oldest entries (simple FIFO)
    const entriesToRemove = requests.slice(0, requests.length - maxEntries + 1)
    await Promise.all(entriesToRemove.map(request => cache.delete(request)))
  }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Implement background sync logic here
  console.log('Service Worker: Background sync triggered')
}

/**
 * Push notification handler
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: data.data || {}
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

/**
 * Notification click handler
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  )
})

/**
 * Message handler for communication with main thread
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats)
    })
  }
})

/**
 * Get cache statistics
 */
async function getCacheStats() {
  const cacheNames = await caches.keys()
  let totalSize = 0
  let totalEntries = 0
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    totalEntries += requests.length
    
    // Estimate size (rough approximation)
    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const responseClone = response.clone()
        const buffer = await responseClone.arrayBuffer()
        totalSize += buffer.byteLength
      }
    }
  }
  
  return {
    totalSize,
    totalEntries,
    cacheNames: cacheNames.length
  }
}

console.log('Service Worker: Loaded')