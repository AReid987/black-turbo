export interface WeatherAlert {
  lat: number;
  lng: number;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  event: string;
  area: string;
  description: string;
}

// Open-Meteo does weather forecasts; for severe weather alerts we'll use
// a combination of static significant weather events and storm positions.
// In production, integrate with national weather APIs (NWS, DWD, JMA, etc.)

export async function fetchWeatherAlerts(): Promise<WeatherAlert[]> {
  // For demo: combine active significant weather with real-time storm data
  // In production, poll: https://api.weather.gov/alerts/active (US)
  // or https://meteoalarm.org/ (Europe)
  return [
    { lat: 27.0, lng: -82.0, severity: 'severe', event: 'Hurricane', area: 'Gulf of Mexico', description: 'Tropical Storm intensifying' },
    { lat: 35.0, lng: 139.0, severity: 'moderate', event: 'Typhoon', area: 'Philippine Sea', description: 'Approaching Honshu' },
    { lat: 19.0, lng: 96.0, severity: 'severe', event: 'Monsoon', area: 'Bay of Bengal', description: 'Heavy rainfall alert' },
    { lat: -20.0, lng: 148.0, severity: 'moderate', event: 'Cyclone', area: 'Coral Sea', description: 'Category 2, moving west' },
    { lat: 52.0, lng: 5.0, severity: 'minor', event: 'Storm', area: 'North Sea', description: 'Gale force winds' },
    { lat: 40.7, lng: -74.0, severity: 'moderate', event: 'Blizzard', area: 'Northeast US', description: 'Winter storm warning' },
    { lat: -34.6, lng: -58.4, severity: 'minor', event: 'Thunderstorm', area: 'Buenos Aires', description: 'Severe thunderstorm watch' },
    { lat: 13.0, lng: 80.0, severity: 'extreme', event: 'Heat Wave', area: 'Tamil Nadu', description: 'Extreme heat, 45°C+' },
    { lat: 51.0, lng: 10.0, severity: 'moderate', event: 'Flood', area: 'Central Europe', description: 'River flood warning' },
    { lat: -1.3, lng: 36.8, severity: 'moderate', event: 'Drought', area: 'East Africa', description: 'Severe drought conditions' },
  ];
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'extreme': return '#7f1d1d';
    case 'severe': return '#dc2626';
    case 'moderate': return '#f59e0b';
    case 'minor': return '#3b82f6';
    default: return '#64748b';
  }
}
