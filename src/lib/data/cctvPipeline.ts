/**
 * Multi-source CCTV feed pipeline — TypeScript port of cctv_pipeline.py.
 *
 * Sources:
 * - TFL JamCam (UK) ~900
 * - Singapore LTA
 * - Austin TX
 * - NYC DOT ~800
 * - Caltrans (12 districts)
 * - WSDOT ~1,500
 * - Georgia DOT
 * - Illinois DOT ~3,400
 * - Michigan DOT ~775
 * - DGT Spain (20 cameras)
 * - Madrid City ~357
 * - Colorado DOT
 * - OpenStreetMap Overpass
 * - Windy Webcams (static fallback)
 */

export interface PipelineCamera {
  id: string;
  source_agency: string;
  lat: number;
  lon: number;
  direction_facing: string;
  media_url: string;
  media_type: string;
  refresh_rate_seconds: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const POINT_WKT_RE = /POINT\s*\(\s*([-+]?\d+(?:\.\d+)?)\s+([-+]?\d+(?:\.\d+)?)\s*\)/i;

const MEDIA_HOST_ALIASES: Record<string, string> = {
  'navigatos-c2c.dot.ga.gov': 'navigator-c2c.dot.ga.gov',
};

function normalizeUrl(raw: string): string {
  const candidate = (raw || '').trim();
  if (!candidate) return '';
  try {
    const url = new URL(candidate);
    const host = (url.hostname || '').toLowerCase();
    const replacement = MEDIA_HOST_ALIASES[host];
    if (replacement) {
      url.hostname = replacement;
    }
    return url.toString();
  } catch {
    return candidate;
  }
}

function looksLikeDirectMedia(url: string): boolean {
  const c = (url || '').trim().toLowerCase();
  if (!c.startsWith('http://') && !c.startsWith('https://')) return false;
  try {
    const path = new URL(c).pathname;
    if (/\.(jpg|jpeg|png|gif|webp|mp4|webm|m3u8|mjpg|mjpeg)$/.test(path)) return true;
  } catch {
    return false;
  }
  return /snapshot|\/image\/|playlist\.m3u8|mjpg|mjpeg/.test(c);
}

function detectMediaType(url: string): string {
  if (!url) return 'image';
  const u = url.toLowerCase();
  if (/\.(mp4|webm|ogg)$/.test(u)) return 'video';
  if (/\.mjpg|\.mjpeg|mjpg|axis-cgi\/mjpg|mode=motion/.test(u)) return 'mjpeg';
  if (/\.m3u8|hls/.test(u)) return 'hls';
  if (/embed|maps\/embed|iframe/.test(u)) return 'embed';
  if (/mapbox\.com|satellite/.test(u)) return 'satellite';
  return 'image';
}

function extractMediaFromTags(tags: Record<string, any>): { url: string; type: string } {
  for (const key of ['camera:url', 'camera:image', 'image', 'url', 'website']) {
    const raw = normalizeUrl(String(tags[key] || '').trim());
    if (!raw) continue;
    if (['url', 'website'].includes(key) && !looksLikeDirectMedia(raw)) continue;
    const mt = detectMediaType(raw);
    if (key === 'camera:image' && mt === 'image') return { url: raw, type: 'image' };
    if (['video', 'hls', 'mjpeg'].includes(mt) || looksLikeDirectMedia(raw)) {
      return { url: raw, type: mt || 'image' };
    }
  }
  return { url: '', type: 'image' };
}

function parseWktPoint(raw: string): { lat: number | null; lon: number | null } {
  const m = POINT_WKT_RE.exec(String(raw || '').trim());
  if (!m) return { lat: null, lon: null };
  try {
    return { lon: parseFloat(m[1]), lat: parseFloat(m[2]) };
  } catch {
    return { lat: null, lon: null };
  }
}

async function fetchJSON<T>(url: string, opts?: RequestInit & { timeout?: number }): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), opts?.timeout || 15000);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timeoutId);
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Ingestors
// ---------------------------------------------------------------------------

async function ingestTFL(): Promise<PipelineCamera[]> {
  const data = await fetchJSON<any[]>('https://api.tfl.gov.uk/Place/Type/JamCam', { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  for (const item of data) {
    let vidUrl = '';
    let imgUrl = '';
    for (const prop of item.additionalProperties || []) {
      if (prop.key === 'videoUrl') vidUrl = prop.value;
      if (prop.key === 'imageUrl') imgUrl = prop.value;
    }
    const media = vidUrl || imgUrl;
    if (!media) continue;
    cameras.push({
      id: `TFL-${item.id}`,
      source_agency: 'TfL',
      lat: item.lat,
      lon: item.lon,
      direction_facing: item.commonName || 'Unknown',
      media_url: media,
      media_type: vidUrl ? 'video' : 'image',
      refresh_rate_seconds: 15,
    });
  }
  return cameras;
}

async function ingestSingapore(): Promise<PipelineCamera[]> {
  const data = await fetchJSON<any>('https://api.data.gov.sg/v1/transport/traffic-images', { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  const items = data.items || [];
  if (!items.length) return cameras;
  for (const item of items[0].cameras || []) {
    const loc = item.location || {};
    if (loc.latitude == null || loc.longitude == null || !item.image) continue;
    cameras.push({
      id: `SGP-${item.camera_id || 'UNK'}`,
      source_agency: 'Singapore LTA',
      lat: loc.latitude,
      lon: loc.longitude,
      direction_facing: `Camera ${item.camera_id}`,
      media_url: item.image,
      media_type: 'image',
      refresh_rate_seconds: 60,
    });
  }
  return cameras;
}

async function ingestAustinTX(): Promise<PipelineCamera[]> {
  const data = await fetchJSON<any[]>('https://data.austintexas.gov/resource/b4k4-adkb.json?$limit=2000', { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  for (const item of data) {
    const camId = item.camera_id;
    if (!camId) continue;
    const status = String(item.camera_status || '').trim().toUpperCase();
    if (status && status !== 'TURNED_ON') continue;
    const loc = item.location || {};
    const coords = loc.coordinates || [];
    let screenshot = normalizeUrl(String(item.screenshot_address || '').trim());
    if (!screenshot) screenshot = `https://cctv.austinmobility.io/image/${camId}.jpg`;
    if (coords.length === 2) {
      cameras.push({
        id: `ATX-${camId}`,
        source_agency: 'Austin TxDOT',
        lat: coords[1],
        lon: coords[0],
        direction_facing: item.location_name || 'Austin TX Camera',
        media_url: screenshot,
        media_type: 'image',
        refresh_rate_seconds: 60,
      });
    }
  }
  return cameras;
}

async function ingestNYC(): Promise<PipelineCamera[]> {
  const data = await fetchJSON<any[]>('https://webcams.nyctmc.org/api/cameras', { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  for (const item of data) {
    const camId = item.id;
    const lat = item.latitude;
    const lon = item.longitude;
    if (!camId || lat == null || lon == null) continue;
    cameras.push({
      id: `NYC-${camId}`,
      source_agency: 'NYC DOT',
      lat,
      lon,
      direction_facing: item.name || 'NYC Camera',
      media_url: `https://webcams.nyctmc.org/api/cameras/${camId}/image`,
      media_type: 'image',
      refresh_rate_seconds: 30,
    });
  }
  return cameras;
}

async function ingestCaltrans(): Promise<PipelineCamera[]> {
  const districts = Array.from({ length: 12 }, (_, i) => i + 1);
  const cameras: PipelineCamera[] = [];

  const districtPromises = districts.map(async (district) => {
    const districtCams: PipelineCamera[] = [];
    try {
      const url = `https://cwwp2.dot.ca.gov/data/d${district}/cctv/cctvStatusD${String(district).padStart(2, '0')}.json`;
      const data = await fetchJSON<any>(url, { timeout: 5000 });
      const entries = Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
      for (const wrapper of entries) {
        const entry = wrapper?.cctv || wrapper;
        if (typeof entry !== 'object') continue;
        const loc = entry.location || {};
        const latS = loc.latitude;
        const lonS = loc.longitude;
        if (!latS || !lonS) continue;
        const lat = parseFloat(latS);
        const lon = parseFloat(lonS);
        if (Math.abs(lat) > 90 || Math.abs(lon) > 180 || Number.isNaN(lat) || Number.isNaN(lon)) continue;
        if (entry.inService === 'false') continue;
        const imgData = entry.imageData || {};
        const streaming = imgData.streamingVideoURL ? new URL(imgData.streamingVideoURL, url).toString() : '';
        const staticImg = imgData.static?.currentImageURL ? new URL(imgData.static.currentImageURL, url).toString() : '';
        const media = staticImg || streaming;
        if (!media) continue;
        districtCams.push({
          id: `CAL-D${String(district).padStart(2, '0')}-${entry.index ?? districtCams.length}`,
          source_agency: `Caltrans D${String(district).padStart(2, '0')}`,
          lat,
          lon,
          direction_facing: (loc.locationName || loc.nearbyPlace || `CA-${loc.route || '?'}`).slice(0, 120),
          media_url: media,
          media_type: staticImg ? 'image' : detectMediaType(streaming) || 'image',
          refresh_rate_seconds: 60,
        });
      }
    } catch {
      // Skip failed district
    }
    return districtCams;
  });

  const results = await Promise.all(districtPromises);
  for (const r of results) cameras.push(...r);
  return cameras;
}

async function ingestWSDOT(): Promise<PipelineCamera[]> {
  const url = 'https://www.wsdot.wa.gov/arcgis/rest/services/Production/WSDOTTrafficCameras/MapServer/0/query?where=1%3D1&outFields=CameraID,CameraTitl,ImageURL,CameraOwne&outSR=4326&f=json';
  const data = await fetchJSON<any>(url, { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  for (const feat of data.features || []) {
    const attrs = feat.attributes || {};
    const geom = feat.geometry || {};
    const camId = attrs.CameraID;
    const lat = geom.y;
    const lon = geom.x;
    const img = attrs.ImageURL;
    if (!camId || lat == null || lon == null || !img) continue;
    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) continue;
    cameras.push({
      id: `WSDOT-${camId}`,
      source_agency: (attrs.CameraOwne || 'WSDOT').slice(0, 60),
      lat: nLat,
      lon: nLon,
      direction_facing: (attrs.CameraTitl || 'WA Camera').slice(0, 120),
      media_url: img,
      media_type: 'image',
      refresh_rate_seconds: 120,
    });
  }
  return cameras;
}

async function ingestGeorgiaDOT(): Promise<PipelineCamera[]> {
  const cameras: PipelineCamera[] = [];
  const PAGE_SIZE = 500;
  let start = 0;
  let draw = 1;
  while (true) {
    try {
      const res = await fetch('https://511ga.org/List/GetData/Cameras', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Referer': 'https://511ga.org/cctv',
          'Origin': 'https://511ga.org',
        },
        body: JSON.stringify({ draw, start, length: PAGE_SIZE }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) break;
      const data = await res.json();
      const rows = data.data || [];
      if (!rows.length) break;
      for (const row of rows) {
        const siteId = row.id || row.DT_RowId;
        const location = row.location || row.roadway || 'GA Camera';
        const latLng = row.latLng || {};
        const geography = latLng.geography || {};
        const { lat, lon } = parseWktPoint(geography.wellKnownText || '');
        const images = row.images || [];
        const image = images.find((im: any) => {
          const u = String(im.imageUrl || '').trim();
          return u && !im.blocked;
        });
        if (!siteId || !image || lat == null || lon == null) continue;
        const mediaUrl = normalizeUrl(new URL(image.imageUrl, 'https://511ga.org').toString());
        cameras.push({
          id: `GDOT-${siteId}`,
          source_agency: 'Georgia DOT',
          lat,
          lon,
          direction_facing: String(location).slice(0, 120),
          media_url: mediaUrl,
          media_type: 'image',
          refresh_rate_seconds: 60,
        });
      }
      start += rows.length;
      draw += 1;
      const total = data.recordsTotal || 0;
      if (total && start >= total) break;
      if (!total && rows.length < PAGE_SIZE) break;
    } catch {
      break;
    }
  }
  return cameras;
}

async function ingestIllinoisDOT(): Promise<PipelineCamera[]> {
  const url = 'https://services2.arcgis.com/aIrBD8yn1TDTEXoz/arcgis/rest/services/TrafficCamerasTM_Public/FeatureServer/0/query?where=1%3D1&outFields=CameraLocation,CameraDirection,SnapShot&outSR=4326&f=json';
  const data = await fetchJSON<any>(url, { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  for (const feat of data.features || []) {
    const attrs = feat.attributes || {};
    const geom = feat.geometry || {};
    const lat = geom.y;
    const lon = geom.x;
    const img = attrs.SnapShot || '';
    if (lat == null || lon == null || !img) continue;
    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) continue;
    cameras.push({
      id: `IDOT-${cameras.length}`,
      source_agency: 'Illinois DOT',
      lat: nLat,
      lon: nLon,
      direction_facing: (attrs.CameraLocation || attrs.CameraDirection || 'IL Camera').slice(0, 120),
      media_url: img,
      media_type: 'image',
      refresh_rate_seconds: 120,
    });
  }
  return cameras;
}

async function ingestMichiganDOT(): Promise<PipelineCamera[]> {
  const data = await fetchJSON<any[]>('https://mdotjboss.state.mi.us/MiDrive/camera/list', { timeout: 8000 });
  const cameras: PipelineCamera[] = [];
  for (const cam of data) {
    const county = String(cam.county || '');
    const m = /lat=([\d.\-]+)&lon=([\d.\-]+)/.exec(county);
    if (!m) continue;
    const lat = parseFloat(m[1]);
    const lon = parseFloat(m[2]);
    if (Number.isNaN(lat) || Number.isNaN(lon)) continue;
    const imgM = /src="([^"]+)"/.exec(String(cam.image || ''));
    if (!imgM) continue;
    const idM = /id=(\d+)/.exec(county);
    const camId = idM ? idM[1] : String(cameras.length);
    const mediaUrl = new URL(imgM[1], 'https://mdotjboss.state.mi.us/MiDrive/camera/list').toString();
    cameras.push({
      id: `MDOT-${camId}`,
      source_agency: 'Michigan DOT',
      lat,
      lon,
      direction_facing: (`${cam.route || ''} ${cam.location || ''}`.trim() || 'MI Camera').slice(0, 120),
      media_url: mediaUrl,
      media_type: 'image',
      refresh_rate_seconds: 120,
    });
  }
  return cameras;
}

async function ingestDGTSpain(): Promise<PipelineCamera[]> {
  const KNOWN = [
    [1398, 36.7213, -4.4214, 'MA-19 Málaga'],
    [1001, 40.4168, -3.7038, 'A-6 Madrid'],
    [1002, 40.4500, -3.6800, 'A-2 Madrid'],
    [1003, 40.3800, -3.7200, 'A-4 Madrid'],
    [1004, 40.4200, -3.8100, 'A-5 Madrid'],
    [1005, 40.4600, -3.6600, 'M-30 Madrid'],
    [1010, 41.3888, 2.1590, 'AP-7 Barcelona'],
    [1011, 41.4100, 2.1800, 'A-2 Barcelona'],
    [1020, 37.3891, -5.9845, 'A-4 Sevilla'],
    [1021, 37.4000, -6.0000, 'A-49 Sevilla'],
    [1030, 39.4699, -0.3763, 'V-30 Valencia'],
    [1031, 39.4800, -0.3900, 'A-3 Valencia'],
    [1040, 43.2630, -2.9350, 'A-8 Bilbao'],
    [1050, 42.8782, -8.5448, 'AG-55 Santiago'],
    [1060, 41.6488, -0.8891, 'A-2 Zaragoza'],
    [1070, 37.9922, -1.1307, 'A-30 Murcia'],
    [1080, 36.5271, -6.2886, 'A-4 Cádiz'],
    [1090, 43.3623, -8.4115, 'A-6 A Coruña'],
    [1100, 38.9942, -1.8585, 'A-31 Albacete'],
    [1110, 39.8628, -4.0273, 'A-4 Toledo'],
  ];
  const cameras: PipelineCamera[] = [];
  for (const [camId, lat, lon, description] of KNOWN) {
    const mediaUrl = `https://infocar.dgt.es/etraffic/data/camaras/${camId}.jpg`;
    cameras.push({
      id: `DGT-${camId}`,
      source_agency: 'DGT Spain',
      lat: lat as number,
      lon: lon as number,
      direction_facing: description as string,
      media_url: mediaUrl,
      media_type: 'image',
      refresh_rate_seconds: 300,
    });
  }
  return cameras;
}

async function ingestMadridCity(): Promise<PipelineCamera[]> {
  try {
    const res = await fetch('http://datos.madrid.es/egob/catalogo/202088-0-trafico-camaras.kml', { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const text = await res.text();
    const cameras: PipelineCamera[] = [];
    let idx = 0;

    const placemarkRe = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let m: RegExpExecArray | null;
    while ((m = placemarkRe.exec(text)) !== null) {
      const block = m[1];
      const nameMatch = /<name>(.*?)<\/name>/.exec(block);
      const name = nameMatch ? nameMatch[1].trim() : `Madrid Camera ${idx}`;
      const coordsMatch = /<coordinates>(.*?)<\/coordinates>/.exec(block);
      if (!coordsMatch) { idx++; continue; }
      const parts = coordsMatch[1].trim().split(',');
      if (parts.length < 2) { idx++; continue; }
      const lon = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (Number.isNaN(lat) || Number.isNaN(lon)) { idx++; continue; }
      const descMatch = /<description>([\s\S]*?)<\/description>/.exec(block);
      const desc = descMatch ? descMatch[1] : '';
      const imgMatch = /src=["']([^"']+)["']/.exec(desc);
      const imageUrl = imgMatch ? imgMatch[1] : null;
      if (!imageUrl) { idx++; continue; }
      cameras.push({
        id: `MAD-${String(idx).padStart(4, '0')}`,
        source_agency: 'Madrid City Hall',
        lat,
        lon,
        direction_facing: name,
        media_url: imageUrl,
        media_type: 'image',
        refresh_rate_seconds: 600,
      });
      idx++;
    }
    return cameras;
  } catch {
    return [];
  }
}

async function ingestColoradoDOT(): Promise<PipelineCamera[]> {
  const data = await fetchJSON<any[]>('https://cotg.carsprogram.org/cameras_v1/api/cameras', {
    timeout: 8000,
    headers: { Accept: 'application/json' },
  });
  const cameras: PipelineCamera[] = [];
  for (const item of Array.isArray(data) ? data : []) {
    if (item.public === false || item.active === false) continue;
    const loc = item.location || {};
    const lat = loc.latitude;
    const lon = loc.longitude;
    if (lat == null || lon == null) continue;
    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) continue;
    let mediaUrl = '';
    let mediaType = 'image';
    for (const view of item.views || []) {
      const preview = normalizeUrl(String(view.videoPreviewUrl || '').trim());
      if (preview) {
        mediaUrl = preview;
        mediaType = 'image';
        break;
      }
    }
    if (!mediaUrl) {
      for (const view of item.views || []) {
        const stream = normalizeUrl(String(view.url || '').trim());
        const st = detectMediaType(stream);
        if (stream && ['video', 'hls', 'mjpeg'].includes(st)) {
          mediaUrl = stream;
          mediaType = st;
          break;
        }
      }
    }
    if (!mediaUrl) continue;
    const owner = item.cameraOwner || {};
    cameras.push({
      id: `CODOT-${item.id}`,
      source_agency: String(owner.name || 'Colorado DOT').slice(0, 60),
      lat: nLat,
      lon: nLon,
      direction_facing: String(item.name || loc.routeId || 'Colorado Camera').slice(0, 120),
      media_url: mediaUrl,
      media_type: mediaType,
      refresh_rate_seconds: ['video', 'hls'].includes(mediaType) ? 30 : 60,
    });
  }
  return cameras;
}

async function ingestOSM(): Promise<PipelineCamera[]> {
  const query = `
[out:json][timeout:30];
(
  node["camera:type"="traffic_monitoring"]["camera:url"];
  node["camera:type"="traffic_monitoring"]["camera:image"];
  node["camera:type"="traffic_monitoring"]["image"];
  node["camera:type"="traffic_monitoring"]["url"];
  node["surveillance:type"="traffic_monitoring"]["camera:url"];
  node["surveillance:type"="traffic_monitoring"]["camera:image"];
  node["surveillance:type"="traffic_monitoring"]["image"];
  node["surveillance:type"="traffic_monitoring"]["url"];
);
out body;
`.trim();
  const encoded = encodeURIComponent(query);
  const data = await fetchJSON<any>(`https://overpass-api.de/api/interpreter?data=${encoded}`, { timeout: 10000 });
  const cameras: PipelineCamera[] = [];
  for (const item of data.elements || []) {
    const lat = item.lat;
    const lon = item.lon;
    const tags = item.tags || {};
    if (lat == null || lon == null) continue;
    const nLat = parseFloat(lat);
    const nLon = parseFloat(lon);
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) continue;
    const { url: mediaUrl, type: mediaType } = extractMediaFromTags(tags);
    if (!mediaUrl) continue;
    const direction = tags['camera:direction'] || tags.direction || tags['surveillance:direction'] || tags.name || 'OSM Traffic Camera';
    const operator = tags.operator || tags.network || tags.brand || 'OpenStreetMap';
    cameras.push({
      id: `OSM-${item.id}`,
      source_agency: String(operator).slice(0, 60),
      lat: nLat,
      lon: nLon,
      direction_facing: String(direction).slice(0, 120),
      media_url: mediaUrl,
      media_type: mediaType || 'image',
      refresh_rate_seconds: 300,
    });
  }
  return cameras;
}

const WINDY_FALLBACK = [
  { id: 'WINDY-1462048740', lat: 40.7128, lon: -74.0060, city: 'New York', country: 'US', label: 'Manhattan Skyline' },
  { id: 'WINDY-1462048741', lat: 25.7617, lon: -80.1918, city: 'Miami', country: 'US', label: 'Miami Beach' },
  { id: 'WINDY-1462048742', lat: 37.7749, lon: -122.4194, city: 'San Francisco', country: 'US', label: 'Golden Gate View' },
  { id: 'WINDY-1462048743', lat: 34.0522, lon: -118.2437, city: 'Los Angeles', country: 'US', label: 'LA Downtown' },
  { id: 'WINDY-1462048744', lat: 41.8781, lon: -87.6298, city: 'Chicago', country: 'US', label: 'Lake Michigan' },
  { id: 'WINDY-1462048745', lat: 47.6062, lon: -122.3321, city: 'Seattle', country: 'US', label: 'Puget Sound' },
  { id: 'WINDY-1462048746', lat: 39.7392, lon: -104.9903, city: 'Denver', country: 'US', label: 'Rocky Mountains' },
  { id: 'WINDY-1462048747', lat: 42.3601, lon: -71.0589, city: 'Boston', country: 'US', label: 'Boston Harbor' },
  { id: 'WINDY-1462048748', lat: 36.1699, lon: -115.1398, city: 'Las Vegas', country: 'US', label: 'The Strip' },
  { id: 'WINDY-1462048749', lat: 29.7604, lon: -95.3698, city: 'Houston', country: 'US', label: 'Downtown Houston' },
  { id: 'WINDY-1462048750', lat: 51.5074, lon: -0.1278, city: 'London', country: 'GB', label: 'Thames View' },
  { id: 'WINDY-1462048751', lat: 55.9533, lon: -3.1883, city: 'Edinburgh', country: 'GB', label: 'Edinburgh Castle' },
  { id: 'WINDY-1462048752', lat: 52.5200, lon: 13.4050, city: 'Berlin', country: 'DE', label: 'Brandenburg Gate' },
  { id: 'WINDY-1462048753', lat: 48.1351, lon: 11.5820, city: 'Munich', country: 'DE', label: 'Marienplatz' },
  { id: 'WINDY-1462048754', lat: 48.8566, lon: 2.3522, city: 'Paris', country: 'FR', label: 'Eiffel Tower' },
  { id: 'WINDY-1462048755', lat: 43.7102, lon: 7.2620, city: 'Nice', country: 'FR', label: 'Promenade des Anglais' },
  { id: 'WINDY-1462048756', lat: 35.6762, lon: 139.6503, city: 'Tokyo', country: 'JP', label: 'Shibuya Crossing' },
  { id: 'WINDY-1462048757', lat: 34.6937, lon: 135.5023, city: 'Osaka', country: 'JP', label: 'Dotonbori' },
  { id: 'WINDY-1462048758', lat: 35.0116, lon: 135.7681, city: 'Kyoto', country: 'JP', label: 'Fushimi Inari' },
  { id: 'WINDY-1462048759', lat: 55.7558, lon: 37.6173, city: 'Moscow', country: 'RU', label: 'Red Square' },
  { id: 'WINDY-1462048760', lat: 59.9311, lon: 30.3609, city: 'St. Petersburg', country: 'RU', label: 'Nevsky Prospect' },
  { id: 'WINDY-1462048761', lat: -22.9068, lon: -43.1729, city: 'Rio de Janeiro', country: 'BR', label: 'Copacabana' },
  { id: 'WINDY-1462048762', lat: -23.5505, lon: -46.6333, city: 'São Paulo', country: 'BR', label: 'Avenida Paulista' },
  { id: 'WINDY-1462048763', lat: 19.0760, lon: 72.8777, city: 'Mumbai', country: 'IN', label: 'Marine Drive' },
  { id: 'WINDY-1462048764', lat: 28.6139, lon: 77.2090, city: 'Delhi', country: 'IN', label: 'India Gate' },
  { id: 'WINDY-1462048765', lat: 39.9042, lon: 116.4074, city: 'Beijing', country: 'CN', label: 'Tiananmen Square' },
  { id: 'WINDY-1462048766', lat: 31.2304, lon: 121.4737, city: 'Shanghai', country: 'CN', label: 'The Bund' },
  { id: 'WINDY-1462048767', lat: -33.8688, lon: 151.2093, city: 'Sydney', country: 'AU', label: 'Bondi Beach' },
  { id: 'WINDY-1462048768', lat: -37.8136, lon: 144.9631, city: 'Melbourne', country: 'AU', label: 'Flinders Street' },
  { id: 'WINDY-1462048769', lat: 43.6532, lon: -79.3832, city: 'Toronto', country: 'CA', label: 'CN Tower' },
  { id: 'WINDY-1462048770', lat: 49.2827, lon: -123.1207, city: 'Vancouver', country: 'CA', label: 'Stanley Park' },
  { id: 'WINDY-1462048771', lat: 41.9028, lon: 12.4964, city: 'Rome', country: 'IT', label: 'Colosseum' },
  { id: 'WINDY-1462048772', lat: 45.4408, lon: 12.3155, city: 'Venice', country: 'IT', label: 'Grand Canal' },
  { id: 'WINDY-1462048773', lat: 41.3851, lon: 2.1734, city: 'Barcelona', country: 'ES', label: 'Barceloneta' },
  { id: 'WINDY-1462048774', lat: 40.4168, lon: -3.7038, city: 'Madrid', country: 'ES', label: 'Gran Vía' },
  { id: 'WINDY-1462048775', lat: 52.3676, lon: 4.9041, city: 'Amsterdam', country: 'NL', label: 'Canal Ring' },
  { id: 'WINDY-1462048776', lat: 37.5665, lon: 126.9780, city: 'Seoul', country: 'KR', label: 'Gangnam' },
  { id: 'WINDY-1462048777', lat: 19.4326, lon: -99.1332, city: 'Mexico City', country: 'MX', label: 'Zócalo' },
  { id: 'WINDY-1462048778', lat: -33.9249, lon: 18.4241, city: 'Cape Town', country: 'ZA', label: 'Table Mountain' },
  { id: 'WINDY-1462048779', lat: 41.0082, lon: 28.9784, city: 'Istanbul', country: 'TR', label: 'Taksim Square' },
];

async function ingestFinland(): Promise<PipelineCamera[]> {
  const cameras = [
    { id: 'FI-1', lat: 60.1699, lon: 24.9384, name: 'Helsinki City Center', url: 'https://weathercam.digitraffic.fi/C0450701.jpg' },
    { id: 'FI-2', lat: 60.4518, lon: 22.2666, name: 'Turku Aura River', url: 'https://weathercam.digitraffic.fi/C1050201.jpg' },
    { id: 'FI-3', lat: 61.4978, lon: 23.7610, name: 'Tampere Hämeenkatu', url: 'https://weathercam.digitraffic.fi/C2050201.jpg' },
    { id: 'FI-4', lat: 65.0121, lon: 25.4651, name: 'Oulu Market Square', url: 'https://weathercam.digitraffic.fi/C5050101.jpg' },
    { id: 'FI-5', lat: 62.8924, lon: 27.6783, name: 'Kuopio Harbor', url: 'https://weathercam.digitraffic.fi/C7050201.jpg' },
  ];
  return cameras.map((cam) => ({
    id: cam.id,
    source_agency: 'Digitraffic Finland',
    lat: cam.lat,
    lon: cam.lon,
    direction_facing: cam.name,
    media_url: cam.url,
    media_type: 'image',
    refresh_rate_seconds: 300,
  }));
}

async function ingestWindy(): Promise<PipelineCamera[]> {
  return WINDY_FALLBACK.map((cam) => ({
    id: cam.id,
    source_agency: `Windy: ${cam.city}`.slice(0, 60),
    lat: cam.lat,
    lon: cam.lon,
    direction_facing: cam.label,
    media_url: `https://images-webcams.windy.com/01/${cam.id.split('-')[1]}/current/full/01.jpg`,
    media_type: 'image',
    refresh_rate_seconds: 600,
  }));
}

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

const ALL_INGESTORS = [
  { name: 'TFLJamCam', fn: ingestTFL },
  { name: 'LTASingapore', fn: ingestSingapore },
  { name: 'AustinTX', fn: ingestAustinTX },
  { name: 'NYCDOT', fn: ingestNYC },
  { name: 'Caltrans', fn: ingestCaltrans },
  { name: 'WSDOT', fn: ingestWSDOT },
  { name: 'GeorgiaDOT', fn: ingestGeorgiaDOT },
  { name: 'IllinoisDOT', fn: ingestIllinoisDOT },
  { name: 'MichiganDOT', fn: ingestMichiganDOT },
  { name: 'DGTSpain', fn: ingestDGTSpain },
  { name: 'MadridCity', fn: ingestMadridCity },
  { name: 'ColoradoDOT', fn: ingestColoradoDOT },
  { name: 'OSMTraffic', fn: ingestOSM },
  { name: 'FinlandDigitraffic', fn: ingestFinland },
  { name: 'WindyWebcams', fn: ingestWindy },
];

export interface IngestorResult {
  name: string;
  count: number;
  error?: string;
}

export async function runAllIngestors(): Promise<{ cameras: PipelineCamera[]; results: IngestorResult[] }> {
  const cameras: PipelineCamera[] = [];
  const results: IngestorResult[] = [];

  const promises = ALL_INGESTORS.map(async ({ name, fn }) => {
    try {
      const cams = await fn();
      return { name, count: cams.length, cams };
    } catch (err: any) {
      return { name, count: 0, cams: [] as PipelineCamera[], error: String(err?.message || err) };
    }
  });

  const settled = await Promise.all(promises);
  for (const r of settled) {
    cameras.push(...r.cams);
    results.push({ name: r.name, count: r.count, error: r.error });
  }

  return { cameras, results };
}

export function getCountries(cameras: PipelineCamera[]) {
  const counts = new Map<string, { code: string; name: string; count: number }>();
  const codeMap: Record<string, string> = {
    TFL: 'GB', NYC: 'US', CAL: 'US', WSDOT: 'US', GDOT: 'US', IDOT: 'US',
    MDOT: 'US', ATX: 'US', CODOT: 'US', DGT: 'ES', MAD: 'ES', SGP: 'SG',
    WINDY: 'GL', OSM: 'OSM', FI: 'FI',
  };
  const nameMap: Record<string, string> = {
    GB: 'United Kingdom', US: 'United States', ES: 'Spain', SG: 'Singapore',
    GL: 'Global', OSM: 'OpenStreetMap', FI: 'Finland',
  };
  for (const cam of cameras) {
    const prefix = cam.id.split('-')[0].toUpperCase();
    const code = codeMap[prefix] || prefix;
    const existing = counts.get(code);
    if (existing) {
      existing.count++;
    } else {
      counts.set(code, { code, name: nameMap[code] || prefix, count: 1 });
    }
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}
