'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { cctvCameras, type CctvCamera } from '@/lib/data/cctv';
import { fetchEarthquakes, getMagnitudeColor, getMagnitudeSize, type EarthquakeFeature } from '@/lib/data/earthquakes';
import { fetchMilitaryAircraft, type Aircraft } from '@/lib/data/aircraft';
import { fetchAirQuality, getAqiColor, getAqiLabel, type AirQualityStation } from '@/lib/data/airquality';
import { volcanoes } from '@/lib/data/volcanoes';
import { militaryBases, powerPlants, dataCenters } from '@/lib/data/infrastructure';
import { CctvViewer } from '@/components/panels/CctvViewer';
import DossierPanel from '@/components/panels/DossierPanel';

export type VisualMode = 'DEFAULT' | 'SATELLITE' | 'FLIR' | 'NVG' | 'CRT';

interface ShadowbrokerMapProps {
  activeLayers: Record<string, boolean>;
  visualMode: VisualMode;
  onCameraSelect?: (camera: CctvCamera | null) => void;
}

const getSatelliteStyle = (): maplibregl.StyleSpecification => ({
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
      tileSize: 256,
      attribution: 'Esri',
    },
  },
  layers: [
    {
      id: 'satellite',
      type: 'raster',
      source: 'satellite',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
});

const getDarkStyle = (): maplibregl.StyleSpecification => ({
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    },
  },
  layers: [
    {
      id: 'carto',
      type: 'raster',
      source: 'carto',
      minzoom: 0,
      maxzoom: 22,
    },
  ],
});

const getModeFilter = (mode: VisualMode): string => {
  switch (mode) {
    case 'FLIR':
      return 'invert(1) grayscale(1) sepia(1) hue-rotate(-50deg) saturate(3) contrast(1.2)';
    case 'NVG':
      return 'grayscale(1) sepia(1) hue-rotate(80deg) saturate(2) contrast(1.3) brightness(0.9)';
    case 'CRT':
      return 'sepia(1) hue-rotate(60deg) saturate(0.5) contrast(1.1) brightness(0.85)';
    default:
      return 'none';
  }
};

function createTerminatorGeoJSON(): GeoJSON.Feature<GeoJSON.Polygon> {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const julian = (utc / 86400000) + 2440587.5;
  const gst = (18.697374558 + 24.06570982441908 * (julian - 2451545.0)) % 24;
  const lonSun = (gst * 15 + 180) % 360 - 180;
  const latSun = 23.45 * Math.sin((2 * Math.PI * (284 + (utc % 31536000000) / 86400000)) / 365);

  const coords: number[][] = [];
  for (let i = 0; i <= 360; i += 5) {
    const lon = i > 180 ? i - 360 : i;
    const lat = -latSun * Math.cos((lon - lonSun) * Math.PI / 180);
    coords.push([lon, lat]);
  }
  coords.push([180, -90], [-180, -90], [-180, coords[0][1]], coords[0]);

  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [coords] },
  };
}

export default function ShadowbrokerMap({ activeLayers, visualMode, onCameraSelect }: ShadowbrokerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const cctvMarkersRef = useRef<maplibregl.Marker[]>([]);
  const eqMarkersRef = useRef<maplibregl.Marker[]>([]);
  const aircraftMarkersRef = useRef<maplibregl.Marker[]>([]);
  const volcanoMarkersRef = useRef<maplibregl.Marker[]>([]);
  const infraMarkersRef = useRef<maplibregl.Marker[]>([]);
  const aqMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CctvCamera | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dossierPos, setDossierPos] = useState<{ lat: number; lng: number } | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityStation[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const style = visualMode === 'SATELLITE' ? getSatelliteStyle() : getDarkStyle();
    const instance = new maplibregl.Map({
      container: mapContainer.current,
      style,
      center: [0, 20],
      zoom: 1.5,
      attributionControl: false,
    });

    instance.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    instance.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    instance.addControl(new maplibregl.FullscreenControl(), 'bottom-right');

    instance.on('contextmenu', (e) => {
      e.preventDefault();
      setDossierPos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      setSelectedCamera(null);
      if (onCameraSelect) onCameraSelect(null);
    });

    instance.on('load', () => {
      setMapLoaded(true);
      instance.addSource('daynight', { type: 'geojson', data: createTerminatorGeoJSON() });
      instance.addLayer({
        id: 'daynight-fill',
        type: 'fill',
        source: 'daynight',
        paint: { 'fill-color': '#000', 'fill-opacity': 0.35 },
        layout: { visibility: activeLayers['daynight'] !== false ? 'visible' : 'none' },
      });
    });

    map.current = instance;

    return () => {
      instance.remove();
      map.current = null;
    };
  }, []);

  // Style updates
  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const style = visualMode === 'SATELLITE' ? getSatelliteStyle() : getDarkStyle();
    map.current.setStyle(style);
    map.current.once('styledata', () => {
      if (!map.current?.getSource('daynight')) {
        map.current?.addSource('daynight', { type: 'geojson', data: createTerminatorGeoJSON() });
        map.current?.addLayer({
          id: 'daynight-fill',
          type: 'fill',
          source: 'daynight',
          paint: { 'fill-color': '#000', 'fill-opacity': 0.35 },
          layout: { visibility: activeLayers['daynight'] !== false ? 'visible' : 'none' },
        });
      }
    });
  }, [visualMode, mapLoaded, activeLayers]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;
    const visibility = activeLayers['daynight'] !== false ? 'visible' : 'none';
    if (map.current.getLayer('daynight-fill')) {
      map.current.setLayoutProperty('daynight-fill', 'visibility', visibility);
    }
  }, [activeLayers, mapLoaded]);

  // Fetch earthquakes
  useEffect(() => {
    if (!activeLayers['earthquakes']) return;
    const load = async () => {
      const data = await fetchEarthquakes();
      setEarthquakes(data);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [activeLayers]);

  // Fetch military aircraft
  useEffect(() => {
    if (!activeLayers['flights_military']) return;
    const load = async () => {
      const data = await fetchMilitaryAircraft();
      setAircraft(data);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [activeLayers]);

  // Fetch air quality
  useEffect(() => {
    if (!activeLayers['air_quality']) return;
    const load = async () => {
      const data = await fetchAirQuality();
      setAirQuality(data);
    };
    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [activeLayers]);

  // --- MARKER UPDATERS ---

  const updateCctvMarkers = useCallback(() => {
    if (!map.current) return;
    cctvMarkersRef.current.forEach(m => m.remove());
    cctvMarkersRef.current = [];
    if (!activeLayers['cctv']) return;

    cctvCameras.forEach((cam) => {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:14px;height:14px;background:#22c55e;border:2px solid #000;border-radius:50%;box-shadow:0 0 8px #22c55e;cursor:pointer;transition:transform 0.2s;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([cam.lng, cam.lat]).addTo(map.current!);
      el.addEventListener('click', () => {
        setSelectedCamera(cam);
        setDossierPos(null);
        if (onCameraSelect) onCameraSelect(cam);
        map.current?.flyTo({ center: [cam.lng, cam.lat], zoom: 14, duration: 1000 });
      });

      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:#22c55e;background:#000;padding:4px 8px;border:1px solid #22c55e;"><strong>${cam.name}</strong><br/>${cam.city}, ${cam.country}</div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([cam.lng, cam.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      cctvMarkersRef.current.push(marker);
    });
  }, [activeLayers, onCameraSelect]);

  const updateEqMarkers = useCallback(() => {
    if (!map.current) return;
    eqMarkersRef.current.forEach(m => m.remove());
    eqMarkersRef.current = [];
    if (!activeLayers['earthquakes']) return;

    earthquakes.forEach((eq) => {
      const color = getMagnitudeColor(eq.magnitude);
      const size = getMagnitudeSize(eq.magnitude);
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:${size}px;height:${size}px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 6px ${color};cursor:pointer;opacity:0.85;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([eq.lng, eq.lat]).addTo(map.current!);
      const dateStr = new Date(eq.time).toISOString().slice(0, 19).replace('T', ' ');
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>M${eq.magnitude}</strong> ${eq.place}<br/><span style="color:#888">${dateStr} UTC • ${eq.depth.toFixed(1)}km</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([eq.lng, eq.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      eqMarkersRef.current.push(marker);
    });
  }, [activeLayers, earthquakes]);

  const updateAircraftMarkers = useCallback(() => {
    if (!map.current) return;
    aircraftMarkersRef.current.forEach(m => m.remove());
    aircraftMarkersRef.current = [];
    if (!activeLayers['flights_military']) return;

    aircraft.forEach((ac) => {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:10px solid #ef4444;transform:rotate(${ac.heading}deg);filter:drop-shadow(0 0 3px #ef4444);cursor:pointer;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([ac.lng, ac.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:#ef4444;background:#000;padding:4px 8px;border:1px solid #ef4444;"><strong>${ac.callsign || ac.hex}</strong><br/><span style="color:#888">${ac.altitude}ft • ${Math.round(ac.speed)}kts • ${ac.type || 'UNK'}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([ac.lng, ac.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      aircraftMarkersRef.current.push(marker);
    });
  }, [activeLayers, aircraft]);

  const updateVolcanoMarkers = useCallback(() => {
    if (!map.current) return;
    volcanoMarkersRef.current.forEach(m => m.remove());
    volcanoMarkersRef.current = [];
    if (!activeLayers['volcanoes']) return;

    volcanoes.forEach((v) => {
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:10px;height:10px;background:#dc2626;border:1.5px solid #000;border-radius:2px;transform:rotate(45deg);box-shadow:0 0 5px #dc2626;cursor:pointer;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([v.lng, v.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:#dc2626;background:#000;padding:4px 8px;border:1px solid #dc2626;max-width:180px;"><strong>${v.name}</strong><br/><span style="color:#888">${v.country} • ${v.type}<br/>${v.elevation}m</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([v.lng, v.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      volcanoMarkersRef.current.push(marker);
    });
  }, [activeLayers]);

  const updateInfraMarkers = useCallback(() => {
    if (!map.current) return;
    infraMarkersRef.current.forEach(m => m.remove());
    infraMarkersRef.current = [];

    if (activeLayers['infrastructure_bases']) {
      militaryBases.forEach((b) => {
        const el = document.createElement('div');
        el.innerHTML = `<div style="width:10px;height:10px;background:#3b82f6;border:1.5px solid #000;transform:rotate(45deg);box-shadow:0 0 5px #3b82f6;cursor:pointer;"></div>`;
        el.style.cursor = 'pointer';
        const marker = new maplibregl.Marker({ element: el }).setLngLat([b.lng, b.lat]).addTo(map.current!);
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
          .setHTML(`<div style="font-family:monospace;font-size:10px;color:#3b82f6;background:#000;padding:4px 8px;border:1px solid #3b82f6;max-width:180px;"><strong>${b.name}</strong><br/><span style="color:#888">${b.country} • ${b.type || 'Base'}</span></div>`);
        el.addEventListener('mouseenter', () => popup.setLngLat([b.lng, b.lat]).addTo(map.current!));
        el.addEventListener('mouseleave', () => popup.remove());
        infraMarkersRef.current.push(marker);
      });
    }

    if (activeLayers['infrastructure_power']) {
      powerPlants.forEach((p) => {
        const color = p.type === 'Nuclear' ? '#f59e0b' : p.type === 'Hydro' ? '#06b6d4' : p.type?.includes('Solar') ? '#eab308' : '#a855f7';
        const el = document.createElement('div');
        el.innerHTML = `<div style="width:8px;height:8px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 4px ${color};cursor:pointer;"></div>`;
        el.style.cursor = 'pointer';
        const marker = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map.current!);
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
          .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${p.name}</strong><br/><span style="color:#888">${p.country} • ${p.type || 'Power'}<br/>${p.operator || ''}</span></div>`);
        el.addEventListener('mouseenter', () => popup.setLngLat([p.lng, p.lat]).addTo(map.current!));
        el.addEventListener('mouseleave', () => popup.remove());
        infraMarkersRef.current.push(marker);
      });
    }

    if (activeLayers['infrastructure_datacenters']) {
      dataCenters.forEach((d) => {
        const el = document.createElement('div');
        el.innerHTML = `<div style="width:8px;height:8px;background:#14b8a6;border:1.5px solid #000;border-radius:1px;box-shadow:0 0 4px #14b8a6;cursor:pointer;"></div>`;
        el.style.cursor = 'pointer';
        const marker = new maplibregl.Marker({ element: el }).setLngLat([d.lng, d.lat]).addTo(map.current!);
        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
          .setHTML(`<div style="font-family:monospace;font-size:10px;color:#14b8a6;background:#000;padding:4px 8px;border:1px solid #14b8a6;max-width:180px;"><strong>${d.name}</strong><br/><span style="color:#888">${d.country} • ${d.type || 'DC'}<br/>${d.operator || ''}</span></div>`);
        el.addEventListener('mouseenter', () => popup.setLngLat([d.lng, d.lat]).addTo(map.current!));
        el.addEventListener('mouseleave', () => popup.remove());
        infraMarkersRef.current.push(marker);
      });
    }
  }, [activeLayers]);

  const updateAqMarkers = useCallback(() => {
    if (!map.current) return;
    aqMarkersRef.current.forEach(m => m.remove());
    aqMarkersRef.current = [];
    if (!activeLayers['air_quality']) return;

    airQuality.forEach((station) => {
      if (!station.pm25) return;
      const color = getAqiColor(station.pm25);
      const label = getAqiLabel(station.pm25);
      const size = Math.min(16, Math.max(8, station.pm25 / 8));
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:${size}px;height:${size}px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 4px ${color};cursor:pointer;opacity:0.75;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([station.lng, station.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${station.city || station.id}</strong><br/><span style="color:#888">PM2.5: ${station.pm25} µg/m³<br/>${label}<br/>${station.country || ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([station.lng, station.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      aqMarkersRef.current.push(marker);
    });
  }, [activeLayers, airQuality]);

  // Apply all marker updates
  useEffect(() => { if (mapLoaded) updateCctvMarkers(); }, [mapLoaded, activeLayers, updateCctvMarkers]);
  useEffect(() => { if (mapLoaded) updateEqMarkers(); }, [mapLoaded, activeLayers, earthquakes, updateEqMarkers]);
  useEffect(() => { if (mapLoaded) updateAircraftMarkers(); }, [mapLoaded, activeLayers, aircraft, updateAircraftMarkers]);
  useEffect(() => { if (mapLoaded) updateVolcanoMarkers(); }, [mapLoaded, activeLayers, updateVolcanoMarkers]);
  useEffect(() => { if (mapLoaded) updateInfraMarkers(); }, [mapLoaded, activeLayers, updateInfraMarkers]);
  useEffect(() => { if (mapLoaded) updateAqMarkers(); }, [mapLoaded, activeLayers, airQuality, updateAqMarkers]);

  const filterStyle = getModeFilter(visualMode);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" style={{ filter: filterStyle }} />

      {visualMode === 'CRT' && (
        <div className="pointer-events-none absolute inset-0 z-10"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
      )}

      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
          <div className="text-green-500 font-mono text-sm animate-pulse">INITIALIZING MAP...</div>
        </div>
      )}

      {selectedCamera && (
        <CctvViewer camera={selectedCamera} onClose={() => { setSelectedCamera(null); if (onCameraSelect) onCameraSelect(null); }} />
      )}

      {dossierPos && (
        <DossierPanel lat={dossierPos.lat} lng={dossierPos.lng} onClose={() => setDossierPos(null)} />
      )}
    </div>
  );
}
