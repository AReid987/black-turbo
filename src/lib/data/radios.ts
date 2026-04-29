export interface RadioStation {
  name: string;
  lat: number;
  lng: number;
  frequency: string;
  type: string;
  status: 'active' | 'intermittent' | 'offline';
  operator?: string;
}

// Notable KiwiSDR / Web SDR receivers and HF monitoring stations

export const radioStations: RadioStation[] = [
  { name: 'KiwiSDR VE3HOA', lat: 43.7, lng: -79.4, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Ontario, Canada' },
  { name: 'KiwiSDR KFS', lat: 37.5, lng: -122.5, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Half Moon Bay, CA' },
  { name: 'KiwiSDR N2YO', lat: 40.7, lng: -74.0, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'New Jersey, US' },
  { name: 'KiwiSDR G8JNJ', lat: 51.5, lng: -2.6, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Bristol, UK' },
  { name: 'KiwiSDR DF2JP', lat: 50.1, lng: 8.7, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Frankfurt, DE' },
  { name: 'KiwiSDR PA3DAT', lat: 52.1, lng: 5.1, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Utrecht, NL' },
  { name: 'KiwiSDR JA1GGV', lat: 35.7, lng: 139.7, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Tokyo, JP' },
  { name: 'KiwiSDR VK3KHZ', lat: -37.8, lng: 144.9, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Melbourne, AU' },
  { name: 'KiwiSDR ZS6KTS', lat: -26.2, lng: 28.0, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Johannesburg, ZA' },
  { name: 'KiwiSDR PY2BS', lat: -23.5, lng: -46.6, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'São Paulo, BR' },
  { name: 'Twente SDR', lat: 52.2, lng: 6.9, frequency: '0-30 MHz', type: 'WebSDR', status: 'active', operator: 'University of Twente, NL' },
  { name: 'University of Twente', lat: 52.2, lng: 6.9, frequency: '0-30 MHz', type: 'WebSDR', status: 'active', operator: 'NL' },
  { name: 'Flevo SDR', lat: 52.5, lng: 5.5, frequency: '0-30 MHz', type: 'WebSDR', status: 'active', operator: 'Flevoland, NL' },
  { name: 'Utah SDR', lat: 40.2, lng: -111.6, frequency: '0-30 MHz', type: 'WebSDR', status: 'active', operator: 'Utah, US' },
  { name: 'Tamar Valley SDR', lat: -41.2, lng: 146.8, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Tasmania, AU' },
  { name: 'Cornwall SDR', lat: 50.2, lng: -5.3, frequency: '0-30 MHz', type: 'KiwiSDR', status: 'active', operator: 'Cornwall, UK' },
  { name: 'HAARP', lat: 62.4, lng: -145.2, frequency: '2.8-10 MHz', type: 'Ionospheric Research', status: 'intermittent', operator: 'UAF / DARPA' },
  { name: 'JORN', lat: -23.0, lng: 134.0, frequency: 'HF', type: 'Over-the-Horizon Radar', status: 'active', operator: 'RAAF' },
  { name: 'Duga-3 (Chernobyl-2)', lat: 51.3, lng: 30.1, frequency: '4-30 MHz', type: 'OTH Radar (Abandoned)', status: 'offline', operator: 'Former USSR' },
  { name: 'Container Radar', lat: 54.0, lng: 36.0, frequency: 'HF', type: 'OTH Radar', status: 'active', operator: 'Russia' },
  { name: 'Nostradamus', lat: 47.0, lng: -2.0, frequency: 'HF', type: 'OTH Radar', status: 'active', operator: 'France' },
];

export function getRadioColor(type: string, status: string): string {
  if (status === 'offline') return '#374151';
  if (type.includes('Radar')) return '#ef4444';
  if (type.includes('Research')) return '#a855f7';
  if (type.includes('KiwiSDR')) return '#22c55e';
  if (type.includes('WebSDR')) return '#3b82f6';
  return '#64748b';
}
