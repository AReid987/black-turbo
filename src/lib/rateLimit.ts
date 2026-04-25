// Simple server-side rate limiter (in-memory).
// For production/serverless, swap this for Redis or a persistent store.

type AttemptRecord = {
  count: number
  firstAttempt: number
}

const attempts = new Map<string, AttemptRecord>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getClientIdentifier(req: Request): string {
  // Use X-Forwarded-For if behind a proxy, otherwise use a generic key.
  // For simplicity in this app we rate-limit broadly by IP when available.
  const forwarded = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim()
  return forwarded || 'anonymous'
}

export function checkServerRateLimit(req: Request): { allowed: boolean; remainingAttempts: number } {
  const id = getClientIdentifier(req)
  const now = Date.now()
  const record = attempts.get(id)

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  if (now - record.firstAttempt > WINDOW_MS) {
    // Window expired, reset
    attempts.delete(id)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingAttempts: 0 }
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.count }
}

export function recordServerAttempt(req: Request): void {
  const id = getClientIdentifier(req)
  const now = Date.now()
  const record = attempts.get(id)

  if (!record || now - record.firstAttempt > WINDOW_MS) {
    attempts.set(id, { count: 1, firstAttempt: now })
  } else {
    record.count += 1
  }
}
