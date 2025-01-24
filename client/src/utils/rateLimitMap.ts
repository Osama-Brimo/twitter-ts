interface TokenBucket {
  tokens: number;
  lastRefill: number;
}
// Simple client-side rate limiting
export const isRateLimited = (
  key: string,
  MAX_TOKENS = 3,
  REFILL_RATE = 2,
  REFILL_INTERVAL = 5000,
): boolean => {
  const rateLimitMap = new Map<string, TokenBucket>();

  const now = Date.now();
  let bucket = rateLimitMap.get(key);

  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    rateLimitMap.set(key, bucket);
  }

  // Refill tokens
  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / REFILL_INTERVAL) * REFILL_RATE;
  bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  // Check if action is allowed
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return false; // Not rate limited
  }

  return true; // Rate limited
};
