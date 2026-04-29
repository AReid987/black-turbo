import { fetchWithRetry } from '@/lib/utils/fetchWithRetry';
import { getCache, setCache } from '@/lib/utils/dataCache';

export interface EarthquakeFeature {
  id: string;
  lat: number;
  lng: number;
  magnitude: number;
  place: string;
  time: number;
  depth: number;
  url: string;
}

export async function fetchEarthquakes(): Promise<EarthquakeFeature[]> {
  try {
    const res = await fetchWithRetry(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson',
      { cache: 'no-store', retries: 1, timeout: 8000 }
    );
    if (!res.ok) throw new Error(`USGS error: ${res.status}`);
    const data = await res.json();

    const result = data.features.map((f: any) => ({
      id: f.id,
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      depth: f.properties.depth,
      url: f.properties.url,
    }));
    setCache('earthquakes', result);
    return result;
  } catch (err) {
    console.error('Failed to fetch earthquakes:', err);
    return getCache<EarthquakeFeature[]>('earthquakes') || [];
  }
}

export function getMagnitudeColor(mag: number): string {
  if (mag >= 6) return '#ef4444'; // red-500
  if (mag >= 5) return '#f97316'; // orange-500
  if (mag >= 4) return '#eab308'; // yellow-500
  if (mag >= 3) return '#22c55e'; // green-500
  return '#6b7280'; // gray-500
}

export function getMagnitudeSize(mag: number): number {
  return Math.max(6, mag * 4);
}
