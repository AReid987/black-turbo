export interface CarrierGroup {
  name: string;
  lat: number;
  lng: number;
  flagship: string;
  type: string;
  country: string;
  escorts: string[];
  status: 'deployed' | 'in port' | 'training' | 'maintenance';
  region: string;
}

// Carrier strike groups — approximate positions based on public USNI/CSIS tracking

export const carrierGroups: CarrierGroup[] = [
  {
    name: 'CSG-12 / USS Gerald R. Ford',
    lat: 36.95, lng: -76.33,
    flagship: 'USS Gerald R. Ford (CVN-78)',
    type: 'Nuclear Aircraft Carrier',
    country: 'US',
    escorts: ['USS Normandy (CG-60)', 'USS Ramage (DDG-61)', 'USS McFaul (DDG-74)', 'USS Thomas Hudner (DDG-116)'],
    status: 'in port',
    region: 'Western Atlantic',
  },
  {
    name: 'CSG-2 / USS George Washington',
    lat: 35.28, lng: 139.67,
    flagship: 'USS George Washington (CVN-73)',
    type: 'Nuclear Aircraft Carrier',
    country: 'US',
    escorts: ['USS Robert Smalls (CG-62)', 'USS Higgins (DDG-76)', 'USS Shoup (DDG-86)'],
    status: 'deployed',
    region: 'Indo-Pacific',
  },
  {
    name: 'CSG-3 / USS Abraham Lincoln',
    lat: 32.7, lng: -117.2,
    flagship: 'USS Abraham Lincoln (CVN-72)',
    type: 'Nuclear Aircraft Carrier',
    country: 'US',
    escorts: ['USS Mobile Bay (CG-53)', 'USS Fitzgerald (DDG-62)', 'USS Gridley (DDG-101)'],
    status: 'training',
    region: 'Eastern Pacific',
  },
  {
    name: 'CSG-11 / USS Theodore Roosevelt',
    lat: 21.3, lng: -157.8,
    flagship: 'USS Theodore Roosevelt (CVN-71)',
    type: 'Nuclear Aircraft Carrier',
    country: 'US',
    escorts: ['USS Bunker Hill (CG-52)', 'USS Russell (DDG-59)', 'USS Paul Hamilton (DDG-60)'],
    status: 'deployed',
    region: 'Central Pacific',
  },
  {
    name: 'CSG-5 / USS Ronald Reagan',
    lat: 35.0, lng: 140.0,
    flagship: 'USS Ronald Reagan (CVN-76)',
    type: 'Nuclear Aircraft Carrier',
    country: 'US',
    escorts: ['USS Antietam (CG-54)', 'USS Benfold (DDG-65)', 'USS Barry (DDG-52)'],
    status: 'deployed',
    region: 'Western Pacific',
  },
  {
    name: 'CSG-8 / USS Harry S. Truman',
    lat: 36.0, lng: -5.0,
    flagship: 'USS Harry S. Truman (CVN-75)',
    type: 'Nuclear Aircraft Carrier',
    country: 'US',
    escorts: ['USS Gettysburg (CG-64)', 'USS Stout (DDG-55)', 'USS Jason Dunham (DDG-109)'],
    status: 'deployed',
    region: 'Mediterranean',
  },
  {
    name: 'HMS Queen Elizabeth CSG',
    lat: 50.8, lng: -1.1,
    flagship: 'HMS Queen Elizabeth (R08)',
    type: 'Aircraft Carrier',
    country: 'UK',
    escorts: ['HMS Defender (D36)', 'HMS Kent (F78)', 'RFA Tidespring (A136)'],
    status: 'in port',
    region: 'NATO',
  },
  {
    name: 'HMS Prince of Wales CSG',
    lat: 56.0, lng: -3.0,
    flagship: 'HMS Prince of Wales (R09)',
    type: 'Aircraft Carrier',
    country: 'UK',
    escorts: ['HMS Richmond (F239)', 'RFA Fort Victoria (A387)'],
    status: 'training',
    region: 'NATO',
  },
  {
    name: 'FS Charles de Gaulle',
    lat: 43.1, lng: 6.0,
    flagship: 'FS Charles de Gaulle (R91)',
    type: 'Nuclear Aircraft Carrier',
    country: 'FR',
    escorts: ['FS Forbin (D620)', 'FS Provence (D652)', 'FS La Fayette (F710)'],
    status: 'deployed',
    region: 'Mediterranean',
  },
  {
    name: 'CNS Shandong',
    lat: 18.0, lng: 114.0,
    flagship: 'CNS Shandong (17)',
    type: 'Aircraft Carrier',
    country: 'CN',
    escorts: ['CNS Nanchang (101)', 'CNS Hohhot (161)', 'CNS Chizhou (123)'],
    status: 'deployed',
    region: 'South China Sea',
  },
  {
    name: 'CNS Liaoning',
    lat: 38.9, lng: 121.6,
    flagship: 'CNS Liaoning (16)',
    type: 'Aircraft Carrier',
    country: 'CN',
    escorts: ['CNS Lhasa (102)', 'CNS Chengdu (120)', 'CNS Zhanjiang (165)'],
    status: 'in port',
    region: 'Bohai Sea',
  },
  {
    name: 'CNS Fujian',
    lat: 26.0, lng: 119.5,
    flagship: 'CNS Fujian (18)',
    type: 'Aircraft Carrier',
    country: 'CN',
    escorts: ['Type 055', 'Type 052D'],
    status: 'maintenance',
    region: 'East China Sea',
  },
  {
    name: 'INS Vikrant',
    lat: 9.9, lng: 76.2,
    flagship: 'INS Vikrant (R11)',
    type: 'Aircraft Carrier',
    country: 'IN',
    escorts: ['INS Kolkata (D63)', 'INS Kochi (D64)', 'INS Chennai (D65)'],
    status: 'training',
    region: 'Indian Ocean',
  },
  {
    name: 'INS Vikramaditya',
    lat: 15.3, lng: 73.0,
    flagship: 'INS Vikramaditya (R33)',
    type: 'Aircraft Carrier',
    country: 'IN',
    escorts: ['INS Talwar (F40)', 'INS Teg (F45)'],
    status: 'deployed',
    region: 'Arabian Sea',
  },
  {
    name: 'Admiral Kuznetsov',
    lat: 69.2, lng: 33.4,
    flagship: 'Admiral Kuznetsov (063)',
    type: 'Aircraft Carrier',
    country: 'RU',
    escorts: ['Pyotr Velikiy (099)', 'Marshal Ustinov (055)'],
    status: 'maintenance',
    region: 'Arctic',
  },
  {
    name: 'JS Izumo',
    lat: 33.5, lng: 129.8,
    flagship: 'JS Izumo (DDH-183)',
    type: 'Helicopter Destroyer',
    country: 'JP',
    escorts: ['JS Maya (DDG-179)', 'JS Asahi (DD-119)'],
    status: 'deployed',
    region: 'East China Sea',
  },
  {
    name: 'ROKS Marado',
    lat: 35.0, lng: 129.0,
    flagship: 'ROKS Marado (LPH-6112)',
    type: 'Amphibious Assault Ship',
    country: 'KR',
    escorts: ['ROKS Sejong the Great (DDG-991)'],
    status: 'training',
    region: 'Korean Peninsula',
  },
  {
    name: 'Cavour',
    lat: 40.8, lng: 14.3,
    flagship: 'Cavour (550)',
    type: 'Aircraft Carrier',
    country: 'IT',
    escorts: ['Caio Duilio (D554)', 'Virginio Fasan (F591)'],
    status: 'deployed',
    region: 'Mediterranean',
  },
  {
    name: 'Juan Carlos I',
    lat: 36.5, lng: -6.2,
    flagship: 'Juan Carlos I (L61)',
    type: 'Amphibious Assault Ship',
    country: 'ES',
    escorts: ['Álvaro de Bazán (F101)'],
    status: 'in port',
    region: 'NATO',
  },
  {
    name: 'HMAS Canberra',
    lat: -33.86, lng: 151.2,
    flagship: 'HMAS Canberra (L02)',
    type: 'Amphibious Assault Ship',
    country: 'AU',
    escorts: ['HMAS Hobart (DDG-39)', 'HMAS Warramunga (FFH-152)'],
    status: 'in port',
    region: 'Indo-Pacific',
  },
];

export function getCarrierColor(status: string): string {
  switch (status) {
    case 'deployed': return '#dc2626';
    case 'training': return '#f59e0b';
    case 'in port': return '#3b82f6';
    case 'maintenance': return '#64748b';
    default: return '#64748b';
  }
}
