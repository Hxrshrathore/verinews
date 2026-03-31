interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Simple in-memory rate limiter
 * @param ip IP address of the requester
 * @param limit Number of requests allowed
 * @param windowMs Time window in milliseconds
 * @returns { success: boolean, remaining: number, reset: number }
 */
export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000) {
  const now = Date.now();
  
  if (!store[ip] || now > store[ip].resetTime) {
    store[ip] = {
      count: 0,
      resetTime: now + windowMs,
    };
  }
  
  store[ip].count++;
  
  return {
    success: store[ip].count <= limit,
    remaining: Math.max(0, limit - store[ip].count),
    reset: store[ip].resetTime,
  };
}
