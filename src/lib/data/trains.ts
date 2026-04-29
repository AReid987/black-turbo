export interface Train {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  type: string;
  operator: string;
  route?: string;
  country: string;
}

// Real-time train data requires APIs like OpenStreetMap Overpass,
// Railway APIs (Amtrak, Deutsche Bahn, JR East), or GTFS-RT feeds.
// For demo, we show notable high-speed and freight trains worldwide.

export const trains: Train[] = [
  // Europe
  { id: 'eurostar-9014', name: 'Eurostar 9014', lat: 51.5, lng: -0.1, speed: 300, heading: 90, type: 'High-Speed Passenger', operator: 'Eurostar', route: 'London → Paris', country: 'UK' },
  { id: 'tgv-6204', name: 'TGV InOui 6204', lat: 48.8, lng: 2.3, speed: 320, heading: 180, type: 'High-Speed Passenger', operator: 'SNCF', route: 'Paris → Lyon', country: 'FR' },
  { id: 'ice-505', name: 'ICE 505', lat: 50.1, lng: 8.7, speed: 280, heading: 0, type: 'High-Speed Passenger', operator: 'DB', route: 'Frankfurt → Hamburg', country: 'DE' },
  { id: 'frecciarossa-9500', name: 'Frecciarossa 9500', lat: 41.9, lng: 12.5, speed: 300, heading: 270, type: 'High-Speed Passenger', operator: 'Trenitalia', route: 'Rome → Milan', country: 'IT' },
  { id: 'ave-0390', name: 'AVE 0390', lat: 40.4, lng: -3.7, speed: 310, heading: 270, type: 'High-Speed Passenger', operator: 'Renfe', route: 'Madrid → Barcelona', country: 'ES' },
  { id: 'thalys-9340', name: 'Thalys 9340', lat: 50.8, lng: 4.4, speed: 300, heading: 180, type: 'High-Speed Passenger', operator: 'Eurostar Group', route: 'Brussels → Amsterdam', country: 'BE' },
  { id: 'sapsan-152', name: 'Sapsan 152', lat: 59.9, lng: 30.3, speed: 250, heading: 135, type: 'High-Speed Passenger', operator: 'RZD', route: 'St. Petersburg → Moscow', country: 'RU' },

  // Asia
  { id: 'shinkansen-n700', name: 'Nozomi N700S', lat: 35.0, lng: 136.0, speed: 285, heading: 270, type: 'High-Speed Passenger', operator: 'JR Central', route: 'Tokyo → Osaka', country: 'JP' },
  { id: 'crh380a', name: 'CRH380A G1', lat: 31.2, lng: 121.5, speed: 350, heading: 0, type: 'High-Speed Passenger', operator: 'China Railway', route: 'Shanghai → Beijing', country: 'CN' },
  { id: 'ktx-305', name: 'KTX 305', lat: 37.5, lng: 127.0, speed: 305, heading: 180, type: 'High-Speed Passenger', operator: 'Korail', route: 'Seoul → Busan', country: 'KR' },
  { id: 'ntv-agv', name: 'Italo AGV 575', lat: 45.4, lng: 9.2, speed: 300, heading: 180, type: 'High-Speed Passenger', operator: 'NTV', route: 'Milan → Rome', country: 'IT' },

  // Americas
  { id: 'amtrak-acela', name: 'Acela Express 2150', lat: 40.7, lng: -74.0, speed: 240, heading: 45, type: 'High-Speed Passenger', operator: 'Amtrak', route: 'Washington DC → Boston', country: 'US' },
  { id: 'via-rail', name: 'VIA Rail 60', lat: 45.5, lng: -73.5, speed: 160, heading: 270, type: 'Passenger', operator: 'VIA Rail', route: 'Montreal → Toronto', country: 'CA' },
  { id: 'cp-rail', name: 'CP Rail 101', lat: 49.2, lng: -122.9, speed: 80, heading: 90, type: 'Freight', operator: 'Canadian Pacific', route: 'Vancouver → Calgary', country: 'CA' },
  { id: 'bnsf-7891', name: 'BNSF 7891', lat: 41.8, lng: -87.6, speed: 65, heading: 270, type: 'Freight', operator: 'BNSF Railway', route: 'Chicago → Los Angeles', country: 'US' },
  { id: 'union-pacific', name: 'UP 8444', lat: 37.7, lng: -122.4, speed: 55, heading: 0, type: 'Freight', operator: 'Union Pacific', route: 'Oakland → Salt Lake City', country: 'US' },

  // Freight global
  { id: 'trans-siberian', name: 'Trans-Siberian Freight', lat: 55.0, lng: 83.0, speed: 70, heading: 90, type: 'Freight', operator: 'RZD', route: 'Moscow → Vladivostok', country: 'RU' },
  { id: 'china-europe', name: 'China-Europe Freight', lat: 45.0, lng: 75.0, speed: 80, heading: 270, type: 'Freight', operator: 'China Railway', route: 'Xi\'an → Duisburg', country: 'CN' },
  { id: 'pilbara-ore', name: 'Pilbara Ore Train', lat: -22.0, lng: 118.0, speed: 60, heading: 270, type: 'Heavy Haul', operator: 'Rio Tinto', route: 'Newman → Port Hedland', country: 'AU' },
];

export function getTrainColor(type: string): string {
  if (type.includes('High-Speed')) return '#22c55e';
  if (type.includes('Passenger')) return '#3b82f6';
  if (type.includes('Freight')) return '#f59e0b';
  if (type.includes('Heavy Haul')) return '#dc2626';
  return '#64748b';
}
