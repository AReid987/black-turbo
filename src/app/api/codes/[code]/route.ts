import { NextRequest, NextResponse } from 'next/server';
import { revokeCode } from '@/lib/inviteCodes';
import { verifyAdminToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;

    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const existed = revokeCode(code);
    return NextResponse.json({ revoked: existed });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
