import { NextRequest, NextResponse } from 'next/server'
import { validateKey, createSession } from '@/lib/auth'
import { checkServerRateLimit, recordServerAttempt } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json()

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Check rate limiting (server-side)
    const rateLimit = checkServerRateLimit(request)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Record this attempt
    recordServerAttempt(request)

    // Validate the key
    const isValid = await validateKey(key)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid key', remainingAttempts: rateLimit.remainingAttempts - 1 },
        { status: 401 }
      )
    }

    // Create session
    const session = await createSession(key)

    if (!session.success) {
      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    // Return success with token (set as cookie)
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful'
    })

    // Set secure cookie
    response.cookies.set('shadow_session', session.token || '', {
      httpOnly: false, // allow client-side logout; set to true in production if you add a /api/auth/logout endpoint
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 hour
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Auth validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
