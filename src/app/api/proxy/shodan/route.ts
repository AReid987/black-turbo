import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Sample Shodan data for demo purposes when API key lacks search access
const SAMPLE_HOSTS = [
  { ip_str: '192.168.1.100', latitude: 51.5074, longitude: -0.1278, city: 'London', country_code: 'GB', org: 'BT Group', isp: 'BT', os: 'Linux', ports: [80, 554, 8080], hostnames: ['cam1.bt.net'], product: 'DVR', version: 'V4.02', vulns: ['CVE-2018-9995'] },
  { ip_str: '203.0.113.45', latitude: 35.6762, longitude: 139.6503, city: 'Tokyo', country_code: 'JP', org: 'NTT', isp: 'NTT Communications', os: null, ports: [80, 443], hostnames: ['router.ntt.jp'], product: 'Apache', version: '2.4.41' },
  { ip_str: '198.51.100.22', latitude: 40.7128, longitude: -74.006, city: 'New York', country_code: 'US', org: 'Verizon', isp: 'Verizon Fios', os: 'Windows', ports: [3389, 445], hostnames: ['desktop.verizon.net'], product: 'Microsoft RDP', version: '10.0', vulns: ['CVE-2019-0708'] },
  { ip_str: '185.199.108.153', latitude: 52.5200, longitude: 13.4050, city: 'Berlin', country_code: 'DE', org: 'Hetzner', isp: 'Hetzner Online', os: 'Linux', ports: [22, 80, 443], hostnames: ['server.hetzner.de'], product: 'nginx', version: '1.18.0' },
  { ip_str: '104.16.86.22', latitude: 37.7749, longitude: -122.4194, city: 'San Francisco', country_code: 'US', org: 'Cloudflare', isp: 'Cloudflare', os: null, ports: [80, 443], hostnames: ['cf-sf.cloudflare.com'], product: 'cloudflare', version: null },
  { ip_str: '8.8.8.8', latitude: 37.3860, longitude: -122.0838, city: 'Mountain View', country_code: 'US', org: 'Google', isp: 'Google LLC', os: null, ports: [53], hostnames: ['dns.google'], product: 'DNS', version: null },
  { ip_str: '1.1.1.1', latitude: -33.8688, longitude: 151.2093, city: 'Sydney', country_code: 'AU', org: 'Cloudflare', isp: 'Cloudflare', os: null, ports: [53, 853], hostnames: ['one.one.one.one'], product: 'DNS-over-TLS', version: null },
  { ip_str: '91.198.174.192', latitude: 52.2297, longitude: 21.0122, city: 'Warsaw', country_code: 'PL', org: 'Wikimedia', isp: 'Wikimedia Foundation', os: 'Linux', ports: [80, 443], hostnames: ['wikipedia.org'], product: 'Varnish', version: '6.0' },
  { ip_str: '151.101.1.140', latitude: 45.5017, longitude: -73.5673, city: 'Montreal', country_code: 'CA', org: 'Fastly', isp: 'Fastly', os: null, ports: [80, 443], hostnames: ['reddit.map.fastly.net'], product: 'Varnish', version: '7.0' },
  { ip_str: '140.82.121.4', latitude: 37.3541, longitude: -121.9552, city: 'San Jose', country_code: 'US', org: 'GitHub', isp: 'GitHub Inc', os: 'Linux', ports: [22, 443], hostnames: ['github.com'], product: 'GitHub', version: null, vulns: [] },
];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.SHODAN_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      total: SAMPLE_HOSTS.length,
      matches: SAMPLE_HOSTS,
      note: 'Using demo data — add SHODAN_API_KEY for real results',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  }

  try {
    const url = `https://api.shodan.io/shodan/host/search?key=${apiKey}&query=${encodeURIComponent(query)}&limit=100`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      const errBody = await res.text();
      // If Shodan rejects due to membership, return sample data
      if (errBody.includes('membership') || errBody.includes('Requires membership')) {
        return NextResponse.json({
          total: SAMPLE_HOSTS.length,
          matches: SAMPLE_HOSTS,
          note: 'Using demo data — Shodan search requires paid membership',
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache',
          },
        });
      }
      throw new Error(`Shodan error: ${res.status} — ${errBody}`);
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err: any) {
    console.error('Shodan proxy error:', err.message || err);
    // Graceful fallback with sample data
    return NextResponse.json({
      total: SAMPLE_HOSTS.length,
      matches: SAMPLE_HOSTS,
      note: 'Using demo data — Shodan API error: ' + (err.message || 'unknown'),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
