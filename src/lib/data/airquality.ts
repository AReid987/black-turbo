import { fetchWithRetry } from '@/lib/utils/fetchWithRetry';
import { getCache, setCache } from '@/lib/utils/dataCache';

export interface AirQualityStation {
  id: string;
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  pm25?: number;
  pm10?: number;
  no2?: number;
  o3?: number;
  lastUpdated?: string;
}

export async function fetchAirQuality(): Promise<AirQualityStation[]> {
  try {
    // OpenAQ v2 - latest measurements
    const res = await fetchWithRetry(
      'https://api.openaq.org/v2/latest?limit=500&parameter=pm25&order_by=value&sort=desc',
      { cache: 'no-store', retries: 1, timeout: 8000 }
    );
    if (!res.ok) throw new Error(`OpenAQ error: ${res.status}`);
    const data = await res.json();

    const result = (data.results || []).map((r: any) => ({
      id: r.location,
      lat: r.coordinates?.latitude,
      lng: r.coordinates?.longitude,
      city: r.city,
      country: r.country,
      pm25: r.measurements?.find((m: any) => m.parameter === 'pm25')?.value,
      pm10: r.measurements?.find((m: any) => m.parameter === 'pm10')?.value,
      no2: r.measurements?.find((m: any) => m.parameter === 'no2')?.value,
      o3: r.measurements?.find((m: any) => m.parameter === 'o3')?.value,
      lastUpdated: r.measurements?.[0]?.lastUpdated,
    })).filter((s: AirQualityStation) => s.lat && s.lng && s.pm25 !== undefined);
    setCache('air_quality', result);
    return result;
  } catch (err) {
    console.error('Failed to fetch air quality:', err);
    return getCache<AirQualityStation[]>('air_quality') || [];
  }
}

export function getAqiColor(pm25: number): string {
  if (pm25 > 250) return '#7f1d1d'; // Hazardous
  if (pm25 > 150) return '#a855f7'; // Very unhealthy
  if (pm25 > 100) return '#dc2626'; // Unhealthy
  if (pm25 > 50) return '#f97316'; // Unhealthy for sensitive
  if (pm25 > 25) return '#eab308'; // Moderate
  return '#22c55e'; // Good
}

export function getAqiLabel(pm25: number): string {
  if (pm25 > 250) return 'HAZARDOUS';
  if (pm25 > 150) return 'VERY UNHEALTHY';
  if (pm25 > 100) return 'UNHEALTHY';
  if (pm25 > 50) return 'SENSITIVE';
  if (pm25 > 25) return 'MODERATE';
  return 'GOOD';
}
