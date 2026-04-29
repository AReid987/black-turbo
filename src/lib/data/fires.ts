export interface FireHotspot {
  lat: number;
  lng: number;
  intensity: number; // 1-10
  confidence: 'low' | 'nominal' | 'high';
  time: string;
  satellite: string;
}

// NASA FIRMS (Fire Information for Resource Management System)
// Free CSV API: https://firms.modaps.eosdis.nasa.gov/api/area/csv/
// In production, poll this endpoint. For demo, use realistic hotspots.

export async function fetchFireHotspots(): Promise<FireHotspot[]> {
  // Realistic active fire regions based on seasonal patterns
  return [
    // Amazon (Brazil)
    { lat: -8.0, lng: -55.0, intensity: 8, confidence: 'high', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: -7.5, lng: -54.5, intensity: 6, confidence: 'nominal', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: -8.2, lng: -56.0, intensity: 9, confidence: 'high', time: new Date().toISOString(), satellite: 'MODIS' },
    // Congo Basin
    { lat: -1.0, lng: 21.0, intensity: 7, confidence: 'high', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: -0.5, lng: 22.0, intensity: 5, confidence: 'nominal', time: new Date().toISOString(), satellite: 'MODIS' },
    // Siberia
    { lat: 62.0, lng: 129.0, intensity: 6, confidence: 'nominal', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: 61.5, lng: 130.0, intensity: 4, confidence: 'low', time: new Date().toISOString(), satellite: 'MODIS' },
    // Australia (seasonal)
    { lat: -25.0, lng: 131.0, intensity: 5, confidence: 'nominal', time: new Date().toISOString(), satellite: 'VIIRS' },
    // Indonesia
    { lat: 0.0, lng: 110.0, intensity: 7, confidence: 'high', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: -0.5, lng: 111.0, intensity: 6, confidence: 'nominal', time: new Date().toISOString(), satellite: 'MODIS' },
    // California
    { lat: 38.5, lng: -120.5, intensity: 8, confidence: 'high', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: 39.0, lng: -121.0, intensity: 5, confidence: 'nominal', time: new Date().toISOString(), satellite: 'MODIS' },
    // Greece/Mediterranean
    { lat: 38.0, lng: 23.5, intensity: 6, confidence: 'high', time: new Date().toISOString(), satellite: 'VIIRS' },
    // Canada
    { lat: 56.0, lng: -105.0, intensity: 7, confidence: 'high', time: new Date().toISOString(), satellite: 'VIIRS' },
    { lat: 55.5, lng: -106.0, intensity: 4, confidence: 'low', time: new Date().toISOString(), satellite: 'MODIS' },
    // India
    { lat: 21.0, lng: 79.0, intensity: 5, confidence: 'nominal', time: new Date().toISOString(), satellite: 'VIIRS' },
    // Angola
    { lat: -12.0, lng: 17.0, intensity: 6, confidence: 'nominal', time: new Date().toISOString(), satellite: 'MODIS' },
  ];
}

export function getFireColor(intensity: number): string {
  if (intensity >= 8) return '#dc2626';
  if (intensity >= 6) return '#f97316';
  if (intensity >= 4) return '#eab308';
  return '#f59e0b';
}

export function getFireSize(intensity: number): number {
  return Math.min(20, Math.max(6, intensity * 2));
}
