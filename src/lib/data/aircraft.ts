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

import { fetchWithRetry } from '@/lib/utils/fetchWithRetry';
import { getCache, setCache } from '@/lib/utils/dataCache';

export async function fetchMilitaryAircraft(): Promise<Aircraft[]> {
  try {
    const res = await fetchWithRetry('https://api.adsb.lol/v2/mil', { cache: 'no-store', retries: 2, timeout: 8000 });
    const data = await res.json();

    const result = (data.ac || []).map((ac: any) => ({
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
    setCache('military_aircraft', result);
    return result;
  } catch (err) {
    console.error('Failed to fetch aircraft:', err);
    return getCache<Aircraft[]>('military_aircraft') || [];
  }
}
