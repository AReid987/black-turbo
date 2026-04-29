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

// Hardcoded fallback cameras — verified working
const fallbackCameras: CctvCamera[] = [
  // Finland — verified working
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

let tflCache: CctvCamera[] | null = null;
let tflCacheTime = 0;

export async function fetchTflCameras(): Promise<CctvCamera[]> {
  // Cache for 5 minutes
  if (tflCache && Date.now() - tflCacheTime < 300000) {
    return tflCache;
  }

  try {
    const res = await fetch('https://api.tfl.gov.uk/Place/Type/JamCam');
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
        country: 'UK',
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

export async function getAllCameras(): Promise<CctvCamera[]> {
  const tfl = await fetchTflCameras();
  return [...fallbackCameras, ...tfl];
}

// Static export for initial render / SSR compatibility
export const cctvCameras = fallbackCameras;

export const cctvFeedsByCountry = cctvCameras.reduce((acc, cam) => {
  if (!acc[cam.country]) acc[cam.country] = [];
  acc[cam.country].push(cam);
  return acc;
}, {} as Record<string, CctvCamera[]>);

export const countryNames: Record<string, string> = {
  US: 'United States',
  UK: 'United Kingdom',
  ES: 'Spain',
  IS: 'Iceland',
  NO: 'Norway',
  FI: 'Finland',
  CH: 'Switzerland',
};
