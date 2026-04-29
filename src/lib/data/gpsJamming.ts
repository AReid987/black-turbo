export interface GpsJammingZone {
  lat: number;
  lng: number;
  radius: number; // km
  intensity: 'low' | 'moderate' | 'high' | 'severe';
  source: string;
  description: string;
  since?: string;
}

// GPS jamming/spoofing incidents based on public reports and aviation warnings
// Sources: GPSJam.org, NOTAMs, aviation forums, academic research

export const gpsJammingZones: GpsJammingZone[] = [
  {
    lat: 55.0, lng: 38.0, radius: 250, intensity: 'severe',
    source: 'Moscow Region',
    description: 'Persistent GPS jamming around Moscow VOR/DME. Aircraft report GNSS loss.',
    since: 'Ongoing',
  },
  {
    lat: 59.9, lng: 30.3, radius: 150, intensity: 'high',
    source: 'St. Petersburg',
    description: 'GPS spoofing reported by maritime traffic in Gulf of Finland.',
    since: 'Ongoing',
  },
  {
    lat: 35.5, lng: 51.0, radius: 200, intensity: 'high',
    source: 'Tehran Region',
    description: 'Iranian GPS jamming around capital. Aviation NOTAMs active.',
    since: 'Ongoing',
  },
  {
    lat: 33.3, lng: 44.4, radius: 180, intensity: 'severe',
    source: 'Baghdad',
    description: 'Military GPS jamming in central Iraq. Commercial aviation affected.',
    since: 'Ongoing',
  },
  {
    lat: 31.5, lng: 34.5, radius: 120, intensity: 'high',
    source: 'Gaza/Israel Border',
    description: 'Electronic warfare activity. GPS unreliable in southern Israel.',
    since: 'Oct 2023',
  },
  {
    lat: 36.0, lng: 128.0, radius: 100, intensity: 'moderate',
    source: 'Korean DMZ',
    description: 'North Korean GPS jamming directed south. Sporadic incidents.',
    since: 'Ongoing',
  },
  {
    lat: 24.5, lng: 54.0, radius: 80, intensity: 'moderate',
    source: 'Abu Dhabi/Dubai',
    description: 'GPS spoofing suspected near UAE ports. Maritime reports.',
    since: '2019',
  },
  {
    lat: 57.0, lng: 24.0, radius: 200, intensity: 'high',
    source: 'Kaliningrad',
    description: 'Extensive GPS jamming from Russian exclave. Baltic states affected.',
    since: 'Ongoing',
  },
  {
    lat: 64.0, lng: 16.0, radius: 300, intensity: 'moderate',
    source: 'Northern Norway',
    description: 'Russian electronic warfare exercises cause GPS denial.',
    since: 'Periodic',
  },
  {
    lat: 22.0, lng: 78.0, radius: 150, intensity: 'low',
    source: 'Central India',
    description: 'Suspected military testing of GPS denial systems.',
    since: 'Periodic',
  },
  {
    lat: 39.0, lng: -77.0, radius: 50, intensity: 'low',
    source: 'Washington DC',
    description: 'Presidential TFR includes GPS jamming. Periodic during VIP movement.',
    since: 'Ongoing',
  },
  {
    lat: 51.5, lng: -0.1, radius: 40, intensity: 'low',
    source: 'London',
    description: 'GPS jamming during state events and high-security operations.',
    since: 'Ongoing',
  },
  {
    lat: 48.8, lng: 2.3, radius: 40, intensity: 'low',
    source: 'Paris',
    description: 'Olympics/major events trigger temporary GPS denial zones.',
    since: 'Event-based',
  },
  {
    lat: 45.0, lng: 33.0, radius: 250, intensity: 'severe',
    source: 'Crimea/Black Sea',
    description: 'Intense electronic warfare. Maritime and aviation GPS severely degraded.',
    since: '2014',
  },
  {
    lat: 37.0, lng: 35.0, radius: 100, intensity: 'moderate',
    source: 'Eastern Mediterranean',
    description: 'GPS spoofing affecting Cyprus and Lebanon airspace.',
    since: 'Ongoing',
  },
];

export function getJammingColor(intensity: string): string {
  switch (intensity) {
    case 'severe': return '#7f1d1d';
    case 'high': return '#dc2626';
    case 'moderate': return '#f59e0b';
    case 'low': return '#eab308';
    default: return '#64748b';
  }
}
