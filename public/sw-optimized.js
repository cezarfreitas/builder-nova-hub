const CACHE_NAME = 'ecko-lp-v1';
const STATIC_CACHE = 'ecko-static-v1';
const DYNAMIC_CACHE = 'ecko-dynamic-v1';

// Critical resources to cache immediately
const CRITICAL_URLS = [
  '/',
  '/assets/index.js',
  '/assets/index.css',
  '/favicon.svg',
  '/fonts/inter-var.woff2'
];

// Resources to cache on demand
const CACHE_PATTERNS = [
  /^\/assets\//,
  /^\/uploads\//,
  /^\/api\/settings/,
  /\.(?:js|css|woff2|png|jpg|jpeg|svg|webp)$/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /^\/api\/leads/,
  /^\/api\/analytics/,
  /^\/admin/
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache critical resources
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Service Worker: Caching critical resources');
        return cache.addAll(CRITICAL_URLS.map(url => new Request(url, { cache: 'reload' })));
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== CACHE_NAME
            )
            .map(cacheName => {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for admin and API endpoints
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirst(request);
    }
    
    // Cache-first strategy for static assets
    if (CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirst(request);
    }
    
    // Stale-while-revalidate for HTML pages
    if (request.headers.get('Accept')?.includes('text/html')) {
      return await staleWhileRevalidate(request);
    }
    
    // Default to network for everything else
    return await fetch(request);
    
  } catch (error) {
    console.error('🚨 Service Worker: Fetch error:', error);
    
    // Return offline fallback for HTML requests
    if (request.headers.get('Accept')?.includes('text/html')) {
      const cache = await caches.open(STATIC_CACHE);
      return await cache.match('/') || new Response('Offline', { status: 503 });
    }
    
    throw error;
  }
}

// Cache-first strategy
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Serve from cache and update in background
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // Not in cache, fetch and cache
  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

// Network-first strategy
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Start fetch in background
  const fetchPromise = fetch(request).then(response => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await fetchPromise;
}

// Update cache in background
function updateCacheInBackground(request) {
  fetch(request).then(response => {
    if (response.ok) {
      caches.open(STATIC_CACHE).then(cache => {
        cache.put(request, response);
      });
    }
  }).catch(() => {
    // Fail silently for background updates
  });
}

// Handle cache quota exceeded
self.addEventListener('error', event => {
  if (event.error && event.error.name === 'QuotaExceededError') {
    console.warn('🚨 Service Worker: Cache quota exceeded, cleaning old entries');
    cleanOldCacheEntries();
  }
});

// Clean old cache entries when quota is exceeded
async function cleanOldCacheEntries() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const keys = await cache.keys();
  
  // Remove oldest 50% of entries
  const keysToDelete = keys.slice(0, Math.floor(keys.length * 0.5));
  
  await Promise.all(
    keysToDelete.map(key => cache.delete(key))
  );
  
  console.log(`🧹 Service Worker: Cleaned ${keysToDelete.length} old cache entries`);
}

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_METRICS') {
    // Log performance metrics from client
    console.log('📊 Performance metrics:', event.data.metrics);
  }
});

console.log('✅ Service Worker: Optimized service worker loaded');
