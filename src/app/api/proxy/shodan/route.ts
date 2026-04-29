import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Shodan API key not configured' }, { status: 500 });
  }

  try {
    const url = `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}&limit=100`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Shodan error: ${res.status}`);
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Shodan proxy error:', err);
    return NextResponse.json({ error: 'Shodan request failed' }, { status: 502 });
  }
}
