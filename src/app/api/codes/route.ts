import { NextRequest, NextResponse } from 'next/server';
import { createCode, listCodes } from '@/lib/inviteCodes';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code, expires_at } = createCode(body.label || '');
    return NextResponse.json({ code, label: body.label || '', expires_at });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ codes: listCodes() });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
