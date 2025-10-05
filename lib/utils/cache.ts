import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedis() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.warn('REDIS_URL not set, falling back to in-memory cache.');
    return null;
  }

  redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: false,
  });

  return redis;
}

const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

export async function getOrSet<T>(key: string, ttl: number, valueFactory: () => Promise<T>): Promise<T> {
  const redisClient = getRedis();

  if (redisClient) {
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
    const value = await valueFactory();
    await redisClient.setex(key, ttl, JSON.stringify(value));
    return value;
  }

  const cached = memoryCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.value as T;
  }

  const value = await valueFactory();
  memoryCache.set(key, { value, expiresAt: now + ttl * 1000 });
  return value;
}
