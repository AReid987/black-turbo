export interface InternetOutage {
  lat: number;
  lng: number;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  region: string;
  country: string;
  affected: string;
  cause: string;
  since: string;
}

// Internet outage events based on public reports (Cloudflare Radar, NetBlocks, IODA)

export const internetOutages: InternetOutage[] = [
  {
    lat: 33.5, lng: 36.3, severity: 'critical',
    region: 'Damascus', country: 'Syria',
    affected: 'National backbone',
    cause: 'Power grid collapse + conflict',
    since: 'Ongoing',
  },
  {
    lat: 33.3, lng: 44.4, severity: 'major',
    region: 'Baghdad', country: 'Iraq',
    affected: 'Multiple ISPs',
    cause: 'Infrastructure damage',
    since: 'Periodic',
  },
  {
    lat: 15.0, lng: 48.0, severity: 'major',
    region: 'Sanaa', country: 'Yemen',
    affected: 'National',
    cause: 'Fuel shortage + airstrikes',
    since: 'Ongoing',
  },
  {
    lat: 19.0, lng: 96.0, severity: 'major',
    region: 'Myanmar', country: 'MM',
    affected: 'Regional shutdowns',
    cause: 'Military-ordered blackouts',
    since: '2021',
  },
  {
    lat: 15.5, lng: 32.5, severity: 'critical',
    region: 'Khartoum', country: 'Sudan',
    affected: 'Near-total outage',
    cause: 'Civil war infrastructure damage',
    since: 'Apr 2023',
  },
  {
    lat: 31.5, lng: 34.5, severity: 'major',
    region: 'Gaza Strip', country: 'PS',
    affected: 'Total telecommunications',
    cause: 'War / infrastructure destruction',
    since: 'Oct 2023',
  },
  {
    lat: -1.0, lng: 21.0, severity: 'moderate',
    region: 'Eastern DRC', country: 'CD',
    affected: 'Regional ISPs',
    cause: 'Conflict zone infrastructure',
    since: 'Ongoing',
  },
  {
    lat: 9.0, lng: 38.0, severity: 'moderate',
    region: 'Addis Ababa', country: 'ET',
    affected: 'Social media blocks',
    cause: 'Government-ordered restrictions',
    since: 'Periodic',
  },
  {
    lat: 41.0, lng: 29.0, severity: 'moderate',
    region: 'Istanbul', country: 'TR',
    affected: 'Social media throttling',
    cause: 'Government restrictions during events',
    since: 'Periodic',
  },
  {
    lat: 35.7, lng: 51.4, severity: 'major',
    region: 'Tehran', country: 'IR',
    affected: 'International bandwidth',
    cause: 'Government-ordered shutdowns',
    since: 'Periodic',
  },
  {
    lat: 48.0, lng: 37.8, severity: 'moderate',
    region: 'Eastern Ukraine', country: 'UA',
    affected: 'Regional ISPs',
    cause: 'War damage / power outages',
    since: 'Feb 2022',
  },
  {
    lat: 64.0, lng: 16.0, severity: 'minor',
    region: 'Northern Sweden', country: 'SE',
    affected: 'Local fiber',
    cause: 'Sabotage (Baltic Sea cable cuts)',
    since: 'Nov 2024',
  },
  {
    lat: 20.0, lng: 78.0, severity: 'minor',
    region: 'Jammu & Kashmir', country: 'IN',
    affected: 'Mobile internet',
    cause: 'Security-related shutdowns',
    since: 'Periodic',
  },
  {
    lat: -12.0, lng: -77.0, severity: 'moderate',
    region: 'Lima', country: 'PE',
    affected: 'National backbone',
    cause: 'Submarine cable fault',
    since: 'Aug 2024',
  },
  {
    lat: 4.0, lng: -72.0, severity: 'minor',
    region: 'Amazonas', country: 'BR',
    affected: 'Rural connectivity',
    cause: 'Fiber cut in remote area',
    since: 'Periodic',
  },
];

export function getOutageColor(severity: string): string {
  switch (severity) {
    case 'critical': return '#7f1d1d';
    case 'major': return '#dc2626';
    case 'moderate': return '#f59e0b';
    case 'minor': return '#eab308';
    default: return '#64748b';
  }
}
