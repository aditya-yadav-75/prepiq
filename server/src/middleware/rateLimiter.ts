import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

/**
 * Lightweight, in-memory sliding window rate limiter middleware
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const store = new Map<string, RateLimitRecord>();

  // Periodically sweep expired records to prevent unbounded memory growth
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter(ts => now - ts < options.windowMs);
      if (record.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  
  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const key = options.keyGenerator 
      ? options.keyGenerator(req) 
      : ((req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || req.socket.remoteAddress || 'unknown-client');

    const now = Date.now();
    const record = store.get(key) || { timestamps: [] };

    // Prune events outside current sliding window
    record.timestamps = record.timestamps.filter(ts => now - ts < options.windowMs);

    if (record.timestamps.length >= options.maxRequests) {
      const oldest = record.timestamps[0];
      const retryAfterSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        error: options.message || 'Too many requests. Please try again later.',
        retry_after_seconds: retryAfterSeconds
      });
    }

    record.timestamps.push(now);
    store.set(key, record);
    next();
  };
}

// 20 requests per 15 minutes for sensitive authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 25,
  message: 'Too many authentication attempts from this IP. Please wait a few minutes before trying again.'
});

// 30 AI generations or prompt comparisons per 10 minutes
export const generationRateLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  maxRequests: 35,
  message: 'AI exam generation rate limit reached. Please wait a few minutes before submitting new generation jobs.'
});
