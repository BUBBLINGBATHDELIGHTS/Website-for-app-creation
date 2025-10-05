import LRU from 'lru-cache';

const cache = new LRU({
  max: 500,
  ttl: 1000 * 60 * 5
});

export function cached(key, fn) {
  return async function cachedHandler(req, res, next) {
    try {
      const cacheKey = typeof key === 'function' ? key(req) : key;
      if (cache.has(cacheKey)) {
        return res.json(cache.get(cacheKey));
      }
      const result = await fn(req, res, next);
      cache.set(cacheKey, result);
      if (!res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };
}

export function getCache() {
  return cache;
}
