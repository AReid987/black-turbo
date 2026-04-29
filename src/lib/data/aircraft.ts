export interface Aircraft {
  hex: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  callsign?: string;
  type?: string;
  category?: string;
}

export async function fetchMilitaryAircraft(): Promise<Aircraft[]> {
  try {
    const res = await fetch('https://api.adsb.lol/v2/mil', { cache: 'no-store' });
    if (!res.ok) throw new Error(`adsb.lol error: ${res.status}`);
    const data = await res.json();

    return (data.ac || []).map((ac: any) => ({
      hex: ac.hex,
      lat: ac.lat,
      lng: ac.lon,
      altitude: ac.alt_baro || 0,
      speed: ac.gs || 0,
      heading: ac.track || 0,
      callsign: ac.flight?.trim() || ac.hex,
      type: ac.t,
      category: ac.category,
    })).filter((ac: Aircraft) => ac.lat && ac.lng);
  } catch (err) {
    console.error('Failed to fetch aircraft:', err);
    return [];
  }
}
