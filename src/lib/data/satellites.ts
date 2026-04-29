export interface Satellite {
  name: string;
  noradId: number;
  lat: number;
  lng: number;
  altitude: number; // km
  type: string;
  operator: string;
  launchYear: number;
}

// Notable satellites — positions are illustrative (approximate orbital paths)
// In production, use CelesTrak or N2YO API for real-time TLE propagation

export const satellites: Satellite[] = [
  { name: 'ISS (ZARYA)', noradId: 25544, lat: 51.6, lng: -15.0, altitude: 420, type: 'Space Station', operator: 'NASA/Roscosmos/ESA/JAXA/CSA', launchYear: 1998 },
  { name: 'TIANGONG', noradId: 48274, lat: 42.0, lng: 75.0, altitude: 390, type: 'Space Station', operator: 'CNSA', launchYear: 2021 },
  { name: 'HST', noradId: 20580, lat: 28.5, lng: -80.0, altitude: 540, type: 'Telescope', operator: 'NASA/ESA', launchYear: 1990 },
  { name: 'NOAA-20', noradId: 43013, lat: 60.0, lng: 30.0, altitude: 824, type: 'Weather', operator: 'NOAA', launchYear: 2017 },
  { name: 'Sentinel-1A', noradId: 39634, lat: -5.0, lng: 40.0, altitude: 693, type: 'SAR', operator: 'ESA', launchYear: 2014 },
  { name: 'Sentinel-2A', noradId: 40697, lat: 15.0, lng: -60.0, altitude: 786, type: 'Optical', operator: 'ESA', launchYear: 2015 },
  { name: 'Landsat-9', noradId: 49260, lat: -20.0, lng: 120.0, altitude: 705, type: 'Optical', operator: 'NASA/USGS', launchYear: 2021 },
  { name: 'WorldView-3', noradId: 40115, lat: 35.0, lng: -120.0, altitude: 617, type: 'Optical', operator: 'Maxar', launchYear: 2014 },
  { name: 'Starlink-1007', noradId: 44713, lat: 53.0, lng: 10.0, altitude: 550, type: 'Communications', operator: 'SpaceX', launchYear: 2019 },
  { name: 'Starlink-1008', noradId: 44714, lat: 53.0, lng: 100.0, altitude: 550, type: 'Communications', operator: 'SpaceX', launchYear: 2019 },
  { name: 'Starlink-1011', noradId: 44718, lat: 53.0, lng: 190.0, altitude: 550, type: 'Communications', operator: 'SpaceX', launchYear: 2019 },
  { name: 'Starlink-1012', noradId: 44719, lat: 53.0, lng: 280.0, altitude: 550, type: 'Communications', operator: 'SpaceX', launchYear: 2019 },
  { name: 'OneWeb-0001', noradId: 45131, lat: 87.9, lng: 0.0, altitude: 1200, type: 'Communications', operator: 'Eutelsat OneWeb', launchYear: 2019 },
  { name: 'GPS BIIR-2', noradId: 25933, lat: 55.0, lng: -100.0, altitude: 20200, type: 'Navigation', operator: 'US Space Force', launchYear: 1999 },
  { name: 'GPS BIIF-1', noradId: 36585, lat: 55.0, lng: 80.0, altitude: 20200, type: 'Navigation', operator: 'US Space Force', launchYear: 2010 },
  { name: 'GLONASS-M', noradId: 40315, lat: 64.8, lng: 45.0, altitude: 19100, type: 'Navigation', operator: 'Roscosmos', launchYear: 2014 },
  { name: 'Galileo-FOC FM1', noradId: 40128, lat: 56.0, lng: 170.0, altitude: 23222, type: 'Navigation', operator: 'ESA', launchYear: 2014 },
  { name: 'BeiDou-3 M1', noradId: 43207, lat: 55.0, lng: -170.0, altitude: 21500, type: 'Navigation', operator: 'CNSA', launchYear: 2018 },
  { name: 'SBIRS GEO-2', noradId: 41394, lat: 0.0, lng: -80.0, altitude: 35786, type: 'Early Warning', operator: 'US Space Force', launchYear: 2013 },
  { name: 'AEHF-1', noradId: 36516, lat: 0.0, lng: 100.0, altitude: 35786, type: 'Military Comms', operator: 'US Space Force', launchYear: 2010 },
  { name: 'MERIDIAN 9', noradId: 57175, lat: 63.0, lng: 80.0, altitude: 40000, type: 'Military Comms', operator: 'Russian MoD', launchYear: 2023 },
  { name: 'Yaogan-41', noradId: 58177, lat: 0.0, lng: 110.0, altitude: 35786, type: 'SIGINT', operator: 'PLA', launchYear: 2024 },
  { name: 'KH-11 USA-224', noradId: 37348, lat: 38.0, lng: -70.0, altitude: 260, type: 'Reconnaissance', operator: 'NRO', launchYear: 2011 },
  { name: 'ZHUHAI-1 01', noradId: 42982, lat: 43.0, lng: 130.0, altitude: 500, type: 'Optical', operator: 'CNSA', launchYear: 2017 },
];

export function getSatelliteColor(type: string): string {
  if (type.includes('Space Station')) return '#22c55e';
  if (type.includes('Communications')) return '#3b82f6';
  if (type.includes('Navigation')) return '#a855f7';
  if (type.includes('Military') || type.includes('SIGINT') || type.includes('Reconnaissance') || type.includes('Early Warning')) return '#ef4444';
  if (type.includes('Optical') || type.includes('SAR') || type.includes('Telescope')) return '#eab308';
  if (type.includes('Weather')) return '#06b6d4';
  return '#64748b';
}
