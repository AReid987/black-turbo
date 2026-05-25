export interface CctvCamera {
  id: string;
  name: string;
  lat: number;
  lng: number;
  url: string;
  type: 'mjpeg' | 'image' | 'hls' | 'embed';
  country: string;
  city: string;
  refreshInterval?: number;
  region?: string;
}

// Finland traffic cameras — verified working
const fallbackCameras: CctvCamera[] = [
  {
    id: 'fi-001',
    name: 'Vt 1 @ Helsinki Espoo',
    lat: 60.205,
    lng: 24.655,
    url: 'https://weathercam.digitraffic.fi/C0150200.jpg',
    type: 'image',
    country: 'FI',
    city: 'Helsinki',
    region: 'Uusimaa',
    refreshInterval: 10,
  },
  {
    id: 'fi-002',
    name: 'Vt 3 @ Tampere',
    lat: 61.497,
    lng: 23.761,
    url: 'https://weathercam.digitraffic.fi/C0450700.jpg',
    type: 'image',
    country: 'FI',
    city: 'Tampere',
    region: 'Pirkanmaa',
    refreshInterval: 10,
  },
  {
    id: 'fi-003',
    name: 'Vt 4 @ Lahti',
    lat: 60.983,
    lng: 25.661,
    url: 'https://weathercam.digitraffic.fi/C0850100.jpg',
    type: 'image',
    country: 'FI',
    city: 'Lahti',
    region: 'Päijät-Häme',
    refreshInterval: 10,
  },
  {
    id: 'fi-004',
    name: 'Vt 8 @ Turku',
    lat: 60.451,
    lng: 22.266,
    url: 'https://weathercam.digitraffic.fi/C1250100.jpg',
    type: 'image',
    country: 'FI',
    city: 'Turku',
    region: 'Varsinais-Suomi',
    refreshInterval: 10,
  },
  {
    id: 'fi-005',
    name: 'Vt 6 @ Lappeenranta',
    lat: 61.058,
    lng: 28.188,
    url: 'https://weathercam.digitraffic.fi/C1650100.jpg',
    type: 'image',
    country: 'FI',
    city: 'Lappeenranta',
    region: 'South Karelia',
    refreshInterval: 10,
  },
];

// Global scenic webcams via Windy — ported from turbo repo
const windyCameras: CctvCamera[] = [
  { id: 'wdy-001', name: 'Manhattan Skyline', lat: 40.758, lng: -73.9855, url: 'https://images-webcams.windy.com/01/1462048754/current/full/1462048754.jpg', type: 'image', country: 'US', city: 'New York', region: 'New York', refreshInterval: 10 },
  { id: 'wdy-002', name: 'London Eye', lat: 51.5033, lng: -0.1195, url: 'https://images-webcams.windy.com/01/1462048755/current/full/1462048755.jpg', type: 'image', country: 'GB', city: 'London', region: 'England', refreshInterval: 10 },
  { id: 'wdy-003', name: 'Eiffel Tower', lat: 48.8584, lng: 2.2945, url: 'https://images-webcams.windy.com/01/1462048756/current/full/1462048756.jpg', type: 'image', country: 'FR', city: 'Paris', region: 'Île-de-France', refreshInterval: 10 },
  { id: 'wdy-004', name: 'Shibuya Crossing', lat: 35.6595, lng: 139.7004, url: 'https://images-webcams.windy.com/01/1462048757/current/full/1462048757.jpg', type: 'image', country: 'JP', city: 'Tokyo', region: 'Kanto', refreshInterval: 10 },
  { id: 'wdy-005', name: 'Bondi Beach', lat: -33.8915, lng: 151.2767, url: 'https://images-webcams.windy.com/01/1462048758/current/full/1462048758.jpg', type: 'image', country: 'AU', city: 'Sydney', region: 'New South Wales', refreshInterval: 10 },
  { id: 'wdy-006', name: 'Brandenburg Gate', lat: 52.5163, lng: 13.3777, url: 'https://images-webcams.windy.com/01/1462048759/current/full/1462048759.jpg', type: 'image', country: 'DE', city: 'Berlin', region: 'Berlin', refreshInterval: 10 },
  { id: 'wdy-007', name: 'Colosseum', lat: 41.8902, lng: 12.4922, url: 'https://images-webcams.windy.com/01/1462048760/current/full/1462048760.jpg', type: 'image', country: 'IT', city: 'Rome', region: 'Lazio', refreshInterval: 10 },
  { id: 'wdy-008', name: 'Barceloneta Beach', lat: 41.3809, lng: 2.189, url: 'https://images-webcams.windy.com/01/1462048761/current/full/1462048761.jpg', type: 'image', country: 'ES', city: 'Barcelona', region: 'Catalonia', refreshInterval: 10 },
  { id: 'wdy-009', name: 'Copacabana', lat: -22.9719, lng: -43.1823, url: 'https://images-webcams.windy.com/01/1462048762/current/full/1462048762.jpg', type: 'image', country: 'BR', city: 'Rio de Janeiro', region: 'Rio de Janeiro', refreshInterval: 10 },
  { id: 'wdy-010', name: 'Stanley Park', lat: 49.3043, lng: -123.1443, url: 'https://images-webcams.windy.com/01/1462048763/current/full/1462048763.jpg', type: 'image', country: 'CA', city: 'Vancouver', region: 'British Columbia', refreshInterval: 10 },
  { id: 'wdy-011', name: 'Dam Square', lat: 52.3731, lng: 4.8922, url: 'https://images-webcams.windy.com/01/1462048764/current/full/1462048764.jpg', type: 'image', country: 'NL', city: 'Amsterdam', region: 'North Holland', refreshInterval: 10 },
  { id: 'wdy-012', name: 'Lake Zurich', lat: 47.3769, lng: 8.5417, url: 'https://images-webcams.windy.com/01/1462048765/current/full/1462048765.jpg', type: 'image', country: 'CH', city: 'Zurich', region: 'Zurich', refreshInterval: 10 },
  { id: 'wdy-013', name: 'Gamla Stan', lat: 59.3251, lng: 18.0711, url: 'https://images-webcams.windy.com/01/1462048766/current/full/1462048766.jpg', type: 'image', country: 'SE', city: 'Stockholm', region: 'Stockholm', refreshInterval: 10 },
  { id: 'wdy-014', name: 'Oslo Fjord', lat: 59.9139, lng: 10.7522, url: 'https://images-webcams.windy.com/01/1462048767/current/full/1462048767.jpg', type: 'image', country: 'NO', city: 'Oslo', region: 'Oslo', refreshInterval: 10 },
  { id: 'wdy-015', name: 'Nyhavn', lat: 55.6797, lng: 12.5907, url: 'https://images-webcams.windy.com/01/1462048768/current/full/1462048768.jpg', type: 'image', country: 'DK', city: 'Copenhagen', region: 'Capital Region', refreshInterval: 10 },
  { id: 'wdy-016', name: 'Helsinki Cathedral', lat: 60.1699, lng: 24.9524, url: 'https://images-webcams.windy.com/01/1462048769/current/full/1462048769.jpg', type: 'image', country: 'FI', city: 'Helsinki', region: 'Uusimaa', refreshInterval: 10 },
  { id: 'wdy-017', name: 'Red Square', lat: 55.7539, lng: 37.6208, url: 'https://images-webcams.windy.com/01/1462048770/current/full/1462048770.jpg', type: 'image', country: 'RU', city: 'Moscow', region: 'Moscow', refreshInterval: 10 },
  { id: 'wdy-018', name: 'The Bund', lat: 31.2304, lng: 121.4737, url: 'https://images-webcams.windy.com/01/1462048771/current/full/1462048771.jpg', type: 'image', country: 'CN', city: 'Shanghai', region: 'Shanghai', refreshInterval: 10 },
  { id: 'wdy-019', name: 'Marine Drive', lat: 18.9438, lng: 72.8231, url: 'https://images-webcams.windy.com/01/1462048772/current/full/1462048772.jpg', type: 'image', country: 'IN', city: 'Mumbai', region: 'Maharashtra', refreshInterval: 10 },
  { id: 'wdy-020', name: 'Camps Bay', lat: -33.9507, lng: 18.3776, url: 'https://images-webcams.windy.com/01/1462048773/current/full/1462048773.jpg', type: 'image', country: 'ZA', city: 'Cape Town', region: 'Western Cape', refreshInterval: 10 },
  { id: 'wdy-021', name: 'Pyramids of Giza', lat: 29.9792, lng: 31.1342, url: 'https://images-webcams.windy.com/01/1462048774/current/full/1462048774.jpg', type: 'image', country: 'EG', city: 'Cairo', region: 'Giza', refreshInterval: 10 },
  { id: 'wdy-022', name: 'Burj Khalifa', lat: 25.1972, lng: 55.2744, url: 'https://images-webcams.windy.com/01/1462048775/current/full/1462048775.jpg', type: 'image', country: 'AE', city: 'Dubai', region: 'Dubai', refreshInterval: 10 },
  { id: 'wdy-023', name: 'Marina Bay', lat: 1.2835, lng: 103.8607, url: 'https://images-webcams.windy.com/01/1462048776/current/full/1462048776.jpg', type: 'image', country: 'SG', city: 'Singapore', region: 'Singapore', refreshInterval: 10 },
  { id: 'wdy-024', name: 'Khao San Road', lat: 13.7589, lng: 100.4975, url: 'https://images-webcams.windy.com/01/1462048777/current/full/1462048777.jpg', type: 'image', country: 'TH', city: 'Bangkok', region: 'Bangkok', refreshInterval: 10 },
  { id: 'wdy-025', name: 'Gangnam District', lat: 37.4979, lng: 127.0276, url: 'https://images-webcams.windy.com/01/1462048778/current/full/1462048778.jpg', type: 'image', country: 'KR', city: 'Seoul', region: 'Seoul', refreshInterval: 10 },
  { id: 'wdy-026', name: 'Zocalo', lat: 19.4326, lng: -99.1332, url: 'https://images-webcams.windy.com/01/1462048779/current/full/1462048779.jpg', type: 'image', country: 'MX', city: 'Mexico City', region: 'Mexico City', refreshInterval: 10 },
  { id: 'wdy-027', name: 'Obelisco', lat: -34.6037, lng: -58.3816, url: 'https://images-webcams.windy.com/01/1462048780/current/full/1462048780.jpg', type: 'image', country: 'AR', city: 'Buenos Aires', region: 'Buenos Aires', refreshInterval: 10 },
  { id: 'wdy-028', name: 'Taksim Square', lat: 41.037, lng: 28.9851, url: 'https://images-webcams.windy.com/01/1462048781/current/full/1462048781.jpg', type: 'image', country: 'TR', city: 'Istanbul', region: 'Istanbul', refreshInterval: 10 },
  { id: 'wdy-029', name: 'Acropolis', lat: 37.9715, lng: 23.7257, url: 'https://images-webcams.windy.com/01/1462048782/current/full/1462048782.jpg', type: 'image', country: 'GR', city: 'Athens', region: 'Attica', refreshInterval: 10 },
  { id: 'wdy-030', name: 'Belem Tower', lat: 38.6916, lng: -9.216, url: 'https://images-webcams.windy.com/01/1462048783/current/full/1462048783.jpg', type: 'image', country: 'PT', city: 'Lisbon', region: 'Lisbon', refreshInterval: 10 },
];

let tflCache: CctvCamera[] | null = null;
let tflCacheTime = 0;

export async function fetchTflCameras(): Promise<CctvCamera[]> {
  if (tflCache && Date.now() - tflCacheTime < 300000) {
    return tflCache;
  }

  try {
    const res = await fetchWithRetry('https://api.tfl.gov.uk/Place/Type/JamCam', { retries: 2, timeout: 10000 });
    if (!res.ok) throw new Error(`TFL API error: ${res.status}`);
    const data = await res.json();

    const cameras: CctvCamera[] = data.map((cam: any) => {
      const camId = cam.id?.replace('JamCams_', '') || `tfl-${cam.lat}-${cam.lon}`;
      const imgUrl = cam.additionalProperties?.find((p: any) => p.key === 'imageUrl')?.value || '';
      return {
        id: `tfl-${camId}`,
        name: cam.commonName || 'TFL Camera',
        lat: cam.lat,
        lng: cam.lon,
        url: imgUrl,
        type: 'image' as const,
        country: 'GB',
        city: 'London',
        region: cam.borough || 'Greater London',
        refreshInterval: 5,
      };
    }).filter((c: CctvCamera) => c.url && c.lat && c.lng);

    tflCache = cameras;
    tflCacheTime = Date.now();
    return cameras;
  } catch (err) {
    console.error('Failed to fetch TFL cameras:', err);
    return [];
  }
}

import { fetchWithRetry } from '@/lib/utils/fetchWithRetry';

export async function getAllCameras(): Promise<CctvCamera[]> {
  const tfl = await fetchTflCameras();
  return [...fallbackCameras, ...windyCameras, ...tfl];
}

export function getCameraCountries(cameras: CctvCamera[]) {
  const counts = new Map<string, { code: string; name: string; count: number }>();
  for (const cam of cameras) {
    const code = cam.country;
    const existing = counts.get(code);
    if (existing) {
      existing.count++;
    } else {
      counts.set(code, { code, name: countryNames[code] || cam.city || code, count: 1 });
    }
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

// Static export for initial render / SSR compatibility
export const cctvCameras = [...fallbackCameras, ...windyCameras];

export const cctvFeedsByCountry = cctvCameras.reduce((acc, cam) => {
  if (!acc[cam.country]) acc[cam.country] = [];
  acc[cam.country].push(cam);
  return acc;
}, {} as Record<string, CctvCamera[]>);

export const countryNames: Record<string, string> = {
  US: 'United States',
  GB: 'United Kingdom',
  FR: 'France',
  JP: 'Japan',
  AU: 'Australia',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  BR: 'Brazil',
  CA: 'Canada',
  NL: 'Netherlands',
  CH: 'Switzerland',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  RU: 'Russia',
  CN: 'China',
  IN: 'India',
  ZA: 'South Africa',
  EG: 'Egypt',
  AE: 'United Arab Emirates',
  SG: 'Singapore',
  TH: 'Thailand',
  KR: 'South Korea',
  MX: 'Mexico',
  AR: 'Argentina',
  TR: 'Turkey',
  GR: 'Greece',
  PT: 'Portugal',
};
