// In-memory limiter: works per server instance only. For production on Vercel use a shared store such as Upstash Redis.
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max requests per minute
const WINDOW_MS = 60 * 1000;

export function checkRateLimit(key: string): { success: boolean } {
  const nowTime = Date.now();
  
  // Clean up expired entries occasionally to prevent memory leaks
  if (Math.random() < 0.1) {
    for (const [k, v] of rateLimitCache.entries()) {
      if (v.resetAt < nowTime) {
        rateLimitCache.delete(k);
      }
    }
  }

  let limiter = rateLimitCache.get(key);
  
  if (!limiter || limiter.resetAt < nowTime) {
    limiter = { count: 1, resetAt: nowTime + WINDOW_MS };
  } else {
    limiter.count++;
  }
  
  rateLimitCache.set(key, limiter);
  return { success: limiter.count <= RATE_LIMIT };
}
