const rateLimitCache = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max requests per minute
const WINDOW_MS = 60 * 1000;

export function checkRateLimit(ip: string): boolean {
  const nowTime = Date.now();
  let limiter = rateLimitCache.get(ip);
  
  if (!limiter || limiter.resetAt < nowTime) {
    limiter = { count: 1, resetAt: nowTime + WINDOW_MS };
  } else {
    limiter.count++;
  }
  
  rateLimitCache.set(ip, limiter);
  return limiter.count <= RATE_LIMIT;
}
