import CryptoJS from 'crypto-js'
import { validateCode } from './inviteCodes'

// Prefer non-prefixed env vars (server-only) since validation now happens in API routes.
// Fallback to NEXT_PUBLIC_ variants for backward compatibility.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'default-32-character-encryption-key-'
const SECRET_KEY = process.env.SECRET_KEY || process.env.NEXT_PUBLIC_SECRET_KEY || 'default-secret-key-change-in-production'

// Hash the key for comparison (never store plain text keys)
export function hashKey(key: string): string {
  return CryptoJS.SHA256(key + SECRET_KEY).toString()
}

// Validate a key against the stored secret
export async function validateKey(key: string): Promise<boolean> {
  try {
    if (constantTimeCompare(key, SECRET_KEY)) {
      return true
    }
    return validateCode(key)
  } catch (error) {
    console.error('Key validation error:', error)
    return false
  }
}

// Verify admin token (e.g. bearer tokens for administrative APIs)
export function verifyAdminToken(token: string): boolean {
  try {
    if (!token) return false
    return constantTimeCompare(token, SECRET_KEY)
  } catch (error) {
    return false
  }
}

// Constant-time comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

// Create a secure session token
export async function createSession(key: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const timestamp = Date.now()
    const duration = parseInt(process.env.SESSION_DURATION || '3600000') // 1 hour default
    const sessionData = {
      keyHash: hashKey(key),
      timestamp,
      expiry: timestamp + duration
    }

    // Encrypt the session data
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(sessionData),
      ENCRYPTION_KEY
    ).toString()

    return {
      success: true,
      token: encrypted
    }
  } catch (error) {
    console.error('Session creation error:', error)
    return {
      success: false,
      error: 'Failed to create session'
    }
  }
}

// Validate a session token
export async function validateSession(token: string): Promise<boolean> {
  try {
    const decrypted = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY)
    const sessionData = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))

    // Check if session has expired
    if (Date.now() > sessionData.expiry) {
      return false
    }

    return true
  } catch (error) {
    console.error('Session validation error:', error)
    return false
  }
}

// Extract session data (for debugging/admin purposes)
export function getSessionData(token: string) {
  try {
    const decrypted = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY)
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8))
  } catch (error) {
    return null
  }
}

// ------------------------------------------------------------------
// Client-side ONLY helpers (safe to import from components)
// ------------------------------------------------------------------

// Rate limiting helper (stores attempts in localStorage with timestamp)
export function checkRateLimit(): { allowed: boolean; remainingAttempts: number } {
  if (typeof window === 'undefined') {
    // Server-side: always allow (rate limiting handled server-side in API route)
    return { allowed: true, remainingAttempts: 5 }
  }

  const maxAttempts = 5
  const windowMs = 15 * 60 * 1000 // 15 minutes

  const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]')
  const now = Date.now()

  // Filter out attempts outside the time window
  const recentAttempts = attempts.filter((attempt: number) => now - attempt < windowMs)

  if (recentAttempts.length >= maxAttempts) {
    return {
      allowed: false,
      remainingAttempts: 0
    }
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - recentAttempts.length
  }
}

// Record an authentication attempt
export function recordAttempt(): void {
  if (typeof window === 'undefined') return

  const attempts = JSON.parse(localStorage.getItem('auth_attempts') || '[]')
  attempts.push(Date.now())

  // Clean up old attempts (older than 24 hours)
  const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
  const recentAttempts = attempts.filter((attempt: number) => attempt > dayAgo)

  localStorage.setItem('auth_attempts', JSON.stringify(recentAttempts))
}

// Clear all attempts (for testing or admin reset)
export function clearAttempts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_attempts')
}
