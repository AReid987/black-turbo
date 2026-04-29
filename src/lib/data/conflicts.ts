export interface ConflictZone {
  name: string;
  lat: number;
  lng: number;
  intensity: 'low' | 'moderate' | 'high' | 'critical';
  type: string;
  description: string;
  casualties?: string;
  since: string;
}

export const conflictZones: ConflictZone[] = [
  {
    name: 'Gaza Strip',
    lat: 31.5,
    lng: 34.47,
    intensity: 'critical',
    type: 'Armed Conflict',
    description: 'Ongoing Israel-Hamas war',
    casualties: 'High',
    since: 'Oct 2023',
  },
  {
    name: 'Eastern Ukraine',
    lat: 48.0,
    lng: 37.8,
    intensity: 'critical',
    type: 'War',
    description: 'Russia-Ukraine full-scale war',
    casualties: 'Very High',
    since: 'Feb 2022',
  },
  {
    name: 'Sudan',
    lat: 15.5,
    lng: 32.5,
    intensity: 'critical',
    type: 'Civil War',
    description: 'SAF vs RSF conflict',
    casualties: 'Very High',
    since: 'Apr 2023',
  },
  {
    name: 'Ethiopia (Tigray)',
    lat: 14.0,
    lng: 38.0,
    intensity: 'high',
    type: 'Civil Conflict',
    description: 'Post-conflict stabilization ongoing',
    casualties: 'Very High',
    since: 'Nov 2020',
  },
  {
    name: 'Myanmar',
    lat: 21.0,
    lng: 96.0,
    intensity: 'high',
    type: 'Civil War',
    description: 'Military junta vs resistance',
    casualties: 'High',
    since: 'Feb 2021',
  },
  {
    name: 'Syria',
    lat: 35.0,
    lng: 38.0,
    intensity: 'high',
    type: 'Civil War',
    description: 'Multiple factions, Turkish involvement',
    casualties: 'Very High',
    since: 'Mar 2011',
  },
  {
    name: 'Yemen',
    lat: 15.0,
    lng: 48.0,
    intensity: 'high',
    type: 'Civil War',
    description: 'Houthi-Saudi coalition conflict',
    casualties: 'Very High',
    since: 'Sep 2014',
  },
  {
    name: 'Mali',
    lat: 17.0,
    lng: -4.0,
    intensity: 'high',
    type: 'Insurgency',
    description: 'JNIM and affiliates active',
    casualties: 'High',
    since: '2012',
  },
  {
    name: 'DRC (East)',
    lat: -1.7,
    lng: 29.0,
    intensity: 'high',
    type: 'Insurgency',
    description: 'M23 and armed groups in Kivu',
    casualties: 'High',
    since: 'Ongoing',
  },
  {
    name: 'Somalia',
    lat: 2.0,
    lng: 45.0,
    intensity: 'moderate',
    type: 'Insurgency',
    description: 'Al-Shabaab operations',
    casualties: 'High',
    since: '2006',
  },
  {
    name: 'Afghanistan',
    lat: 33.0,
    lng: 66.0,
    intensity: 'moderate',
    type: 'Insurgency',
    description: 'Resistance to Taliban rule',
    casualties: 'Moderate',
    since: 'Aug 2021',
  },
  {
    name: 'Nagorno-Karabakh',
    lat: 39.8,
    lng: 46.8,
    intensity: 'moderate',
    type: 'Territorial Conflict',
    description: 'Azerbaijan-Armenia tensions',
    casualties: 'Moderate',
    since: 'Sep 2023',
  },
  {
    name: 'Kashmir',
    lat: 34.0,
    lng: 76.0,
    intensity: 'moderate',
    type: 'Territorial Dispute',
    description: 'India-Pakistan tensions',
    casualties: 'Low-Moderate',
    since: '1947',
  },
  {
    name: 'South China Sea',
    lat: 12.0,
    lng: 115.0,
    intensity: 'low',
    type: 'Territorial Dispute',
    description: 'Maritime territorial disputes',
    casualties: 'Low',
    since: 'Ongoing',
  },
  {
    name: 'Western Sahara',
    lat: 24.0,
    lng: -13.0,
    intensity: 'low',
    type: 'Territorial Dispute',
    description: 'Polisario-Morocco tensions',
    casualties: 'Low',
    since: '1975',
  },
];

export function getConflictColor(intensity: string): string {
  switch (intensity) {
    case 'critical': return '#dc2626';
    case 'high': return '#f97316';
    case 'moderate': return '#eab308';
    case 'low': return '#64748b';
    default: return '#64748b';
  }
}

export function getConflictSize(intensity: string): number {
  switch (intensity) {
    case 'critical': return 16;
    case 'high': return 12;
    case 'moderate': return 10;
    case 'low': return 8;
    default: return 8;
  }
}
