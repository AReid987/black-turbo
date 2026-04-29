export interface ShodanHost {
  ip_str: string;
  latitude: number;
  longitude: number;
  city?: string;
  country_code?: string;
  org?: string;
  isp?: string;
  os?: string;
  ports: number[];
  hostnames: string[];
  product?: string;
  version?: string;
  vulns?: string[];
}

export interface ShodanSearchResult {
  total: number;
  matches: ShodanHost[];
}

const SHODAN_QUERIES = [
  'webcam',
  'ipcam',
  'dvr',
  'router',
  'printer',
  'industrial control system',
];

export async function searchShodan(query: string = 'webcam'): Promise<ShodanSearchResult> {
  const res = await fetch(`/api/proxy/shodan?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Shodan error: ${res.status}`);
  const data = await res.json();
  return {
    total: data.total || 0,
    matches: (data.matches || []).map((m: any) => ({
      ip_str: m.ip_str,
      latitude: m.location?.latitude || m.lat,
      longitude: m.location?.longitude || m.lon,
      city: m.location?.city,
      country_code: m.location?.country_code,
      org: m.org,
      isp: m.isp,
      os: m.os,
      ports: m.ports || [],
      hostnames: m.hostnames || [],
      product: m.product,
      version: m.version,
      vulns: m.vulns ? Object.keys(m.vulns) : undefined,
    })).filter((h: ShodanHost) => h.latitude && h.longitude),
  };
}

export function getShodanColor(ports: number[]): string {
  if (ports.includes(554) || ports.includes(80) || ports.includes(8080)) return '#f97316';
  if (ports.includes(21) || ports.includes(23)) return '#eab308';
  if (ports.includes(502) || ports.includes(44818)) return '#ef4444';
  return '#64748b';
}
