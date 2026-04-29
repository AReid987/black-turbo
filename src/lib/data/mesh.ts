export interface MeshNode {
  name: string;
  lat: number;
  lng: number;
  type: string;
  network: string;
  status: 'online' | 'intermittent' | 'offline';
  protocol: string;
  range?: number; // km
}

// Mesh network and APRS nodes — Mix of real mesh networks and illustrative nodes

export const meshNodes: MeshNode[] = [
  // Meshtastic / LoRa
  { name: 'SF-Mesh-01', lat: 37.77, lng: -122.41, type: 'Meshtastic Repeater', network: 'BayAreaMesh', status: 'online', protocol: 'LoRa 915MHz', range: 10 },
  { name: 'NYC-Mesh-Hub', lat: 40.71, lng: -74.00, type: 'Mesh Hub', network: 'NYC Mesh', status: 'online', protocol: '802.11s + LoRa', range: 5 },
  { name: 'BER-Mesh-42', lat: 52.52, lng: 13.40, type: 'Freifunk Node', network: 'Berlin Freifunk', status: 'online', protocol: 'Batman-adv', range: 3 },
  { name: 'LON-Mesh-07', lat: 51.50, lng: -0.08, type: 'Mesh Gateway', network: 'London Mesh', status: 'online', protocol: 'LoRa', range: 8 },
  { name: 'TYO-Mesh-12', lat: 35.68, lng: 139.76, type: 'Meshtastic Node', network: 'TokyoMesh', status: 'online', protocol: 'LoRa 920MHz', range: 7 },
  { name: 'SYD-Mesh-03', lat: -33.86, lng: 151.20, type: 'Mesh Repeater', network: 'SydneyMesh', status: 'online', protocol: 'LoRa 915MHz', range: 9 },
  { name: 'AMS-Mesh-09', lat: 52.36, lng: 4.90, type: 'Freifunk Supernode', network: 'Amsterdam Mesh', status: 'online', protocol: 'Batman-adv', range: 5 },
  { name: 'PAR-Mesh-11', lat: 48.85, lng: 2.35, type: 'Mesh Gateway', network: 'Paris Mesh', status: 'intermittent', protocol: 'LoRa', range: 6 },

  // APRS / Amateur Radio
  { name: 'APRS-W6ABC', lat: 34.05, lng: -118.24, type: 'APRS Digipeater', network: 'APRS-IS', status: 'online', protocol: 'AX.25 144.39MHz', range: 80 },
  { name: 'APRS-KB2VXA', lat: 40.71, lng: -74.00, type: 'APRS IGate', network: 'APRS-IS', status: 'online', protocol: 'AX.25 144.39MHz', range: 60 },
  { name: 'APRS-DB0FHN', lat: 52.52, lng: 13.40, type: 'APRS Digipeater', network: 'APRS-IS', status: 'online', protocol: 'AX.25 144.80MHz', range: 70 },
  { name: 'APRS-JP1YKI', lat: 35.68, lng: 139.76, type: 'APRS IGate', network: 'APRS-IS', status: 'online', protocol: 'AX.25 144.64MHz', range: 50 },
  { name: 'APRS-VK2RHR', lat: -33.86, lng: 151.20, type: 'APRS Digipeater', network: 'APRS-IS', status: 'online', protocol: 'AX.25 145.175MHz', range: 65 },
  { name: 'APRS-ZS6STN', lat: -26.20, lng: 28.04, type: 'APRS IGate', network: 'APRS-IS', status: 'online', protocol: 'AX.25 144.80MHz', range: 55 },

  // Disaster response / humanitarian
  { name: 'Haiti-Emergency', lat: 18.59, lng: -72.31, type: 'Emergency Mesh', network: 'InRelief', status: 'intermittent', protocol: 'Serval + LoRa', range: 4 },
  { name: 'Ukraine-Mesh-Kyiv', lat: 50.45, lng: 30.52, type: 'Emergency Mesh', network: 'Ukraine Mesh', status: 'online', protocol: 'Meshtastic', range: 6 },
  { name: 'Ukraine-Mesh-Lviv', lat: 49.84, lng: 24.02, type: 'Emergency Mesh', network: 'Ukraine Mesh', status: 'online', protocol: 'Meshtastic', range: 5 },
  { name: 'Turkey-Emergency', lat: 37.0, lng: 35.3, type: 'Emergency Mesh', network: 'AFAD', status: 'offline', protocol: 'LoRa', range: 3 },

  // Satellite-linked ground stations
  { name: 'Starlink-GW-AK', lat: 64.8, lng: -147.7, type: 'Starlink Gateway', network: 'SpaceX', status: 'online', protocol: 'Ka-band', range: 800 },
  { name: 'Starlink-GW-NZ', lat: -41.3, lng: 174.7, type: 'Starlink Gateway', network: 'SpaceX', status: 'online', protocol: 'Ka-band', range: 800 },
  { name: 'OneWeb-GW-NO', lat: 70.0, lng: 25.0, type: 'OneWeb Gateway', network: 'Eutelsat OneWeb', status: 'online', protocol: 'Ka-band', range: 1200 },

  // goTenna / tactical mesh
  { name: 'goTenna-DC', lat: 38.9, lng: -77.0, type: 'goTenna Pro', network: 'Federal', status: 'online', protocol: 'MHF 900MHz', range: 6 },
  { name: 'goTenna-NYC', lat: 40.71, lng: -74.00, type: 'goTenna Mesh', network: 'NYC Mesh', status: 'online', protocol: 'MHF 900MHz', range: 4 },
];

export function getMeshColor(type: string, status: string): string {
  if (status === 'offline') return '#374151';
  if (type.includes('Emergency')) return '#ef4444';
  if (type.includes('Starlink') || type.includes('OneWeb')) return '#3b82f6';
  if (type.includes('APRS')) return '#22c55e';
  if (type.includes('Freifunk') || type.includes('Mesh')) return '#a855f7';
  if (type.includes('goTenna')) return '#f59e0b';
  return '#64748b';
}
