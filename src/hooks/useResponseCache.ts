const CACHE_MAX_SIZE = 50;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

type CacheEntry = {
  response: string;
  generatedImages?: string[];
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getCachedResponse(query: string): CacheEntry | null {
  const key = normalizeQuery(query);
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry;
}

export function setCachedResponse(
  query: string,
  response: string,
  generatedImages?: string[]
) {
  const key = normalizeQuery(query);

  // Evict oldest if at capacity
  if (cache.size >= CACHE_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(key, { response, generatedImages, timestamp: Date.now() });
}

export function clearResponseCache() {
  cache.clear();
}
