import { fetchWithRetry } from '@/lib/utils/fetchWithRetry';
import { getCache, setCache } from '@/lib/utils/dataCache';

export interface CommercialFlight {
  callsign: string;
  lat: number;
  lng: number;
  altitude: number;
  speed: number;
  heading: number;
  origin?: string;
  destination?: string;
  aircraft?: string;
  airline?: string;
}

// Using adsb.lol with bounding boxes for global coverage
// In production, use a backend service to aggregate from multiple ADS-B exchanges

const WORLD_BBOXES = [
  { name: 'NA-West', minLat: 25, maxLat: 55, minLon: -130, maxLon: -85 },
  { name: 'NA-East', minLat: 25, maxLat: 55, minLon: -85, maxLon: -55 },
  { name: 'Europe', minLat: 35, maxLat: 70, minLon: -15, maxLon: 40 },
  { name: 'Asia-East', minLat: 20, maxLat: 50, minLon: 100, maxLon: 150 },
  { name: 'Asia-South', minLat: 5, maxLat: 35, minLon: 65, maxLon: 110 },
  { name: 'Oceania', minLat: -40, maxLat: -10, minLon: 110, maxLon: 180 },
  { name: 'SA', minLat: -35, maxLat: 10, minLon: -85, maxLon: -35 },
  { name: 'Africa', minLat: -35, maxLat: 35, minLon: -20, maxLon: 55 },
];

export async function fetchCommercialFlights(): Promise<CommercialFlight[]> {
  const allFlights: CommercialFlight[] = [];

  // Try to fetch from adsb.lol for a few key regions
  // Rate-limit friendly: only fetch 3 regions per call
  const regions = WORLD_BBOXES.slice(0, 3);

  for (const region of regions) {
    try {
      const url = `https://api.adsb.lol/v2/lat/${(region.minLat + region.maxLat) / 2}/lon/${(region.minLon + region.maxLon) / 2}/dist/500`;
      const res = await fetchWithRetry(url, { cache: 'no-store', retries: 1, timeout: 5000 });
      if (!res.ok) continue;
      const data = await res.json();

      const flights = (data.ac || [])
        .filter((ac: any) => ac.flight && ac.flight.trim())
        .map((ac: any) => ({
          callsign: ac.flight?.trim() || ac.hex,
          lat: ac.lat,
          lng: ac.lon,
          altitude: ac.alt_baro || 0,
          speed: ac.gs || 0,
          heading: ac.track || 0,
          origin: ac.departure || ac.origin,
          destination: ac.arrival || ac.destination,
          aircraft: ac.t,
          airline: getAirlineFromCallsign(ac.flight?.trim()),
        }))
        .filter((f: CommercialFlight) => f.lat && f.lng && f.altitude > 1000);

      allFlights.push(...flights);
    } catch (e) {
      // Silently skip failed regions
    }
  }

  // Cache successful results
  if (allFlights.length > 0) {
    setCache('commercial_flights', allFlights.slice(0, 150));
  }

  // If API fails entirely, return cached or sample data
  if (allFlights.length === 0) {
    return getCache<CommercialFlight[]>('commercial_flights') || getSampleFlights();
  }

  return allFlights.slice(0, 150);
}

function getAirlineFromCallsign(callsign: string): string | undefined {
  const prefix = callsign?.substring(0, 3).toUpperCase();
  const airlines: Record<string, string> = {
    'AAL': 'American Airlines', 'UAL': 'United Airlines', 'DAL': 'Delta Air Lines',
    'BAW': 'British Airways', 'DLH': 'Lufthansa', 'AFR': 'Air France',
    'KLM': 'KLM Royal Dutch', 'UAE': 'Emirates', 'ETD': 'Etihad',
    'QTR': 'Qatar Airways', 'CPA': 'Cathay Pacific', 'JAL': 'Japan Airlines',
    'ANA': 'ANA', 'SIA': 'Singapore Airlines', 'QFA': 'Qantas',
    'ACA': 'Air Canada', 'AFL': 'Aeroflot', 'CES': 'China Eastern',
    'CSN': 'China Southern', 'CCA': 'Air China', 'KAL': 'Korean Air',
    'THA': 'Thai Airways', 'MAL': 'Malaysia Airlines', 'VIR': 'Virgin Atlantic',
    'EZY': 'easyJet', 'RYR': 'Ryanair', 'SWA': 'Southwest Airlines',
    'JBU': 'JetBlue', 'FFT': 'Frontier', 'ASA': 'Alaska Airlines',
    'VOZ': 'Virgin Australia', 'LAN': 'LATAM', 'AVA': 'Avianca',
    'AMX': 'Aeromexico', 'IBE': 'Iberia', 'AZA': 'ITA Airways',
    'SWR': 'Swiss', 'SAS': 'SAS', 'FIN': 'Finnair',
    'TAP': 'TAP Portugal', 'LOT': 'LOT Polish', 'AUA': 'Austrian Airlines',
    'ELY': 'El Al', 'ISR': 'Israir', 'WZZ': 'Wizz Air',
  };
  return airlines[prefix];
}

function getSampleFlights(): CommercialFlight[] {
  return [
    { callsign: 'BAW284', lat: 51.47, lng: -0.46, altitude: 34000, speed: 520, heading: 270, origin: 'LHR', destination: 'JFK', aircraft: 'B77W', airline: 'British Airways' },
    { callsign: 'UAL931', lat: 53.0, lng: -40.0, altitude: 36000, speed: 490, heading: 270, origin: 'LHR', destination: 'SFO', aircraft: 'B789', airline: 'United Airlines' },
    { callsign: 'AFR066', lat: 49.0, lng: -10.0, altitude: 38000, speed: 510, heading: 270, origin: 'CDG', destination: 'LAX', aircraft: 'A388', airline: 'Air France' },
    { callsign: 'DLH400', lat: 50.0, lng: -30.0, altitude: 35000, speed: 500, heading: 270, origin: 'FRA', destination: 'JFK', aircraft: 'B748', airline: 'Lufthansa' },
    { callsign: 'UAE201', lat: 25.25, lng: 55.36, altitude: 32000, speed: 480, heading: 90, origin: 'DXB', destination: 'JFK', aircraft: 'A388', airline: 'Emirates' },
    { callsign: 'QTR800', lat: 25.28, lng: 51.6, altitude: 33000, speed: 490, heading: 45, origin: 'DOH', destination: 'NRT', aircraft: 'A35K', airline: 'Qatar Airways' },
    { callsign: 'SIA321', lat: 1.35, lng: 103.99, altitude: 37000, speed: 505, heading: 315, origin: 'SIN', destination: 'LHR', aircraft: 'A359', airline: 'Singapore Airlines' },
    { callsign: 'CPA251', lat: 22.3, lng: 113.9, altitude: 34000, speed: 495, heading: 270, origin: 'HKG', destination: 'LHR', aircraft: 'A35K', airline: 'Cathay Pacific' },
    { callsign: 'JAL006', lat: 35.5, lng: 140.0, altitude: 38000, speed: 515, heading: 45, origin: 'NRT', destination: 'JFK', aircraft: 'B77W', airline: 'Japan Airlines' },
    { callsign: 'ANA104', lat: 35.7, lng: 139.7, altitude: 36000, speed: 500, heading: 315, origin: 'NRT', destination: 'LHR', aircraft: 'B789', airline: 'ANA' },
    { callsign: 'QFA009', lat: -33.9, lng: 151.2, altitude: 39000, speed: 520, heading: 270, origin: 'SYD', destination: 'LHR', aircraft: 'A388', airline: 'Qantas' },
    { callsign: 'AAL100', lat: 40.6, lng: -73.7, altitude: 33000, speed: 485, heading: 90, origin: 'JFK', destination: 'LHR', aircraft: 'B77W', airline: 'American Airlines' },
    { callsign: 'DAL200', lat: 33.6, lng: -84.4, altitude: 35000, speed: 495, heading: 45, origin: 'ATL', destination: 'CDG', aircraft: 'A339', airline: 'Delta Air Lines' },
    { callsign: 'ACA850', lat: 43.6, lng: -79.6, altitude: 36000, speed: 500, heading: 270, origin: 'YYZ', destination: 'LHR', aircraft: 'B789', airline: 'Air Canada' },
    { callsign: 'KLM641', lat: 52.3, lng: 4.7, altitude: 34000, speed: 490, heading: 270, origin: 'AMS', destination: 'JFK', aircraft: 'B77W', airline: 'KLM Royal Dutch' },
    { callsign: 'SWA1847', lat: 32.7, lng: -117.2, altitude: 28000, speed: 430, heading: 90, origin: 'SAN', destination: 'LAS', aircraft: 'B738', airline: 'Southwest Airlines' },
    { callsign: 'EZY1234', lat: 51.5, lng: -0.1, altitude: 25000, speed: 400, heading: 180, origin: 'LGW', destination: 'BCN', aircraft: 'A320', airline: 'easyJet' },
    { callsign: 'RYR4567', lat: 53.4, lng: -6.3, altitude: 32000, speed: 440, heading: 135, origin: 'DUB', destination: 'AGP', aircraft: 'B738', airline: 'Ryanair' },
    { callsign: 'CES588', lat: 31.2, lng: 121.8, altitude: 35000, speed: 495, heading: 45, origin: 'PVG', destination: 'JFK', aircraft: 'B77W', airline: 'China Eastern' },
    { callsign: 'KAL086', lat: 37.4, lng: 126.4, altitude: 37000, speed: 510, heading: 45, origin: 'ICN', destination: 'JFK', aircraft: 'A388', airline: 'Korean Air' },
    { callsign: 'THA910', lat: 13.6, lng: 100.6, altitude: 34000, speed: 490, heading: 315, origin: 'BKK', destination: 'LHR', aircraft: 'A359', airline: 'Thai Airways' },
    { callsign: 'ELY001', lat: 32.0, lng: 34.8, altitude: 33000, speed: 485, heading: 315, origin: 'TLV', destination: 'JFK', aircraft: 'B789', airline: 'El Al' },
    { callsign: 'AFL150', lat: 55.9, lng: 37.4, altitude: 36000, speed: 500, heading: 270, origin: 'SVO', destination: 'JFK', aircraft: 'A333', airline: 'Aeroflot' },
    { callsign: 'LAN600', lat: -33.4, lng: -70.8, altitude: 34000, speed: 490, heading: 180, origin: 'SCL', destination: 'SYD', aircraft: 'B789', airline: 'LATAM' },
  ];
}
