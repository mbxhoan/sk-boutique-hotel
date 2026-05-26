const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string, opts: { limit: number; windowMs: number }) {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + opts.windowMs });
    return { limited: false, remaining: opts.limit - 1 };
  }

  if (entry.count >= opts.limit) {
    return { limited: true, remaining: 0 };
  }

  entry.count++;
  return { limited: false, remaining: opts.limit - entry.count };
}
