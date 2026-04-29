export interface FireHotspot {
  lat: number;
  lng: number;
  brightness: number;
  frp: number; // fire radiative power
  date: string;
}

export async function fetchFireHotspots(): Promise<FireHotspot[]> {
  try {
    // NASA FIRMS - NOAA-20 VIIRS 24h
    const res = await fetch(
      'https://firms.modaps.eosdis.nasa.gov/api/area/csv/V1/NOAA20_NRT/-180,-90,180,90/1/3442208f7747d9a24e27c059655fd7a7',
      { cache: 'no-store' }
    );
    if (!res.ok) throw new Error(`FIRMS error: ${res.status}`);
    const text = await res.text();
    const lines = text.trim().split('\n').slice(1); // skip header
    return lines.map(line => {
      const parts = line.split(',');
      return {
        lat: parseFloat(parts[0]),
        lng: parseFloat(parts[1]),
        brightness: parseFloat(parts[2]),
        frp: parseFloat(parts[11]) || 0,
        date: parts[5],
      };
    }).filter(f => !isNaN(f.lat) && !isNaN(f.lng));
  } catch (err) {
    console.error('Failed to fetch fire hotspots:', err);
    return [];
  }
}

export function getFrpColor(frp: number): string {
  if (frp > 50) return '#7f1d1d'; // dark red
  if (frp > 20) return '#dc2626'; // red
  if (frp > 10) return '#f97316'; // orange
  if (frp > 5) return '#eab308'; // yellow
  return '#facc15'; // light yellow
}
