export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('shadow_session')?.value

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No session found' },
        { status: 401 }
      )
    }

    const isValid = await validateSession(token)

    if (!isValid) {
      const response = NextResponse.json(
        { valid: false, error: 'Invalid or expired session' },
        { status: 401 }
      )
      response.cookies.delete('shadow_session')
      return response
    }

    return NextResponse.json({ valid: true })

  } catch (error) {
    console.error('Session validation error:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}