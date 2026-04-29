'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getAllCameras, cctvCameras, type CctvCamera } from '@/lib/data/cctv';
import { fetchEarthquakes, getMagnitudeColor, getMagnitudeSize, type EarthquakeFeature } from '@/lib/data/earthquakes';
import { fetchMilitaryAircraft, type Aircraft } from '@/lib/data/aircraft';
import { fetchAirQuality, getAqiColor, getAqiLabel, type AirQualityStation } from '@/lib/data/airquality';
import { volcanoes } from '@/lib/data/volcanoes';
import { militaryBases, powerPlants, dataCenters } from '@/lib/data/infrastructure';
import { searchShodan, getShodanColor, type ShodanHost } from '@/lib/data/shodan';
import { fetchVessels, getVesselColor, type Vessel } from '@/lib/data/vessels';
import { fetchWeatherAlerts, getSeverityColor, type WeatherAlert } from '@/lib/data/weather';
import { fetchFireHotspots, getFireColor, getFireSize, type FireHotspot } from '@/lib/data/fires';
import { conflictZones, getConflictColor, getConflictSize, type ConflictZone } from '@/lib/data/conflicts';
import { satellites, getSatelliteColor, type Satellite } from '@/lib/data/satellites';
import { fetchCommercialFlights, type CommercialFlight } from '@/lib/data/commercialFlights';
import { trains, getTrainColor, type Train } from '@/lib/data/trains';
import { gpsJammingZones, getJammingColor, type GpsJammingZone } from '@/lib/data/gpsJamming';
import { internetOutages, getOutageColor, type InternetOutage } from '@/lib/data/outages';
import { radioStations, getRadioColor, type RadioStation } from '@/lib/data/radios';
import { carrierGroups, getCarrierColor, type CarrierGroup } from '@/lib/data/carriers';
import { meshNodes, getMeshColor, type MeshNode } from '@/lib/data/mesh';
import { CctvViewer } from '@/components/panels/CctvViewer';
import DossierPanel from '@/components/panels/DossierPanel';
import type { ToastType } from '@/components/ui/Toast';
import { useSmartToast } from '@/lib/utils/useSmartToast';
import { useDataHealth } from '@/lib/utils/useDataHealth';

export type VisualMode = 'DEFAULT' | 'SATELLITE' | 'FLIR' | 'NVG' | 'CRT';

export interface HealthMap {
  [source: string]: { status: 'online' | 'degraded' | 'offline' | 'unknown'; lastSuccess?: number; lastError?: number };
}

export interface LayerStats {
  earthquakes?: number;
  aircraft?: number;
  vessels?: number;
  commercialFlights?: number;
  airQuality?: number;
  weatherAlerts?: number;
  fireHotspots?: number;
  cctv?: number;
  shodan?: number;
}

interface ShadowbrokerMapProps {
  activeLayers: Record<string, boolean>;
  visualMode: VisualMode;
  onCameraSelect?: (camera: CctvCamera | null) => void;
  onToast?: (toast: { type: ToastType; title: string; message?: string; duration?: number }) => void;
  onHealthChange?: (health: HealthMap) => void;
  onStatsChange?: (stats: LayerStats) => void;
  refreshSignal?: number;
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

export default function ShadowbrokerMap({ activeLayers, visualMode, onCameraSelect, onToast, onHealthChange, onStatsChange, refreshSignal }: ShadowbrokerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const cctvMarkersRef = useRef<maplibregl.Marker[]>([]);
  const eqMarkersRef = useRef<maplibregl.Marker[]>([]);
  const aircraftMarkersRef = useRef<maplibregl.Marker[]>([]);
  const volcanoMarkersRef = useRef<maplibregl.Marker[]>([]);
  const infraMarkersRef = useRef<maplibregl.Marker[]>([]);
  const aqMarkersRef = useRef<maplibregl.Marker[]>([]);
  const shodanMarkersRef = useRef<maplibregl.Marker[]>([]);
  const vesselMarkersRef = useRef<maplibregl.Marker[]>([]);
  const weatherMarkersRef = useRef<maplibregl.Marker[]>([]);
  const fireMarkersRef = useRef<maplibregl.Marker[]>([]);
  const conflictMarkersRef = useRef<maplibregl.Marker[]>([]);
  const satelliteMarkersRef = useRef<maplibregl.Marker[]>([]);
  const commercialFlightMarkersRef = useRef<maplibregl.Marker[]>([]);
  const trainMarkersRef = useRef<maplibregl.Marker[]>([]);
  const jammingMarkersRef = useRef<maplibregl.Marker[]>([]);
  const outageMarkersRef = useRef<maplibregl.Marker[]>([]);
  const radioMarkersRef = useRef<maplibregl.Marker[]>([]);
  const carrierMarkersRef = useRef<maplibregl.Marker[]>([]);
  const meshMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CctvCamera | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dossierPos, setDossierPos] = useState<{ lat: number; lng: number } | null>(null);
  const [mapZoom, setMapZoom] = useState(1.5);
  const [mousePos, setMousePos] = useState<{ lat: number; lng: number } | null>(null);
  const [earthquakes, setEarthquakes] = useState<EarthquakeFeature[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [airQuality, setAirQuality] = useState<AirQualityStation[]>([]);
  const [cctvList, setCctvList] = useState<CctvCamera[]>(cctvCameras);
  const [shodanHosts, setShodanHosts] = useState<ShodanHost[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [fireHotspots, setFireHotspots] = useState<FireHotspot[]>([]);
  const [conflictList] = useState<ConflictZone[]>(conflictZones);
  const [satelliteList] = useState<Satellite[]>(satellites);
  const [commercialFlights, setCommercialFlights] = useState<CommercialFlight[]>([]);
  const [trainList] = useState<Train[]>(trains);
  const [jammingZones] = useState<GpsJammingZone[]>(gpsJammingZones);
  const [outageList] = useState<InternetOutage[]>(internetOutages);
  const [radioList] = useState<RadioStation[]>(radioStations);
  const [carrierList] = useState<CarrierGroup[]>(carrierGroups);
  const [meshList] = useState<MeshNode[]>(meshNodes);

  // Smart toast + health tracking
  const { smartToast, resetLayer } = useSmartToast(onToast);
  const { health, updateHealth } = useDataHealth();

  // Expose health changes to parent
  useEffect(() => {
    if (onHealthChange) {
      const mapped: HealthMap = {};
      for (const [k, v] of Object.entries(health)) {
        mapped[k] = { status: v.status, lastSuccess: v.lastSuccess, lastError: v.lastError };
      }
      onHealthChange(mapped);
    }
  }, [health, onHealthChange]);

  // Expose live stats to parent whenever data changes
  useEffect(() => {
    if (!onStatsChange) return;
    onStatsChange({
      earthquakes: earthquakes.length,
      aircraft: aircraft.length,
      vessels: vessels.length,
      commercialFlights: commercialFlights.length,
      airQuality: airQuality.length,
      weatherAlerts: weatherAlerts.length,
      fireHotspots: fireHotspots.length,
      cctv: cctvList.length,
      shodan: shodanHosts.length,
    });
  }, [earthquakes, aircraft, vessels, commercialFlights, airQuality, weatherAlerts, fireHotspots, cctvList, shodanHosts, onStatsChange]);

  // Initialize map
  // Expose flyTo for external search integration
  useEffect(() => {
    (window as any).__shadowbrokerFlyTo = ({ lat, lng, name }: { lat: number; lng: number; name: string }) => {
      if (!map.current) return;
      map.current.flyTo({ center: [lng, lat], zoom: 12, duration: 1500 });
      // Show a brief notification or set dossier
      setDossierPos({ lat, lng });
      setSelectedCamera(null);
      if (onCameraSelect) onCameraSelect(null);
    };
    return () => {
      delete (window as any).__shadowbrokerFlyTo;
    };
  }, [onCameraSelect]);

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

    instance.on('zoom', () => {
      setMapZoom(instance.getZoom());
    });

    instance.on('mousemove', (e) => {
      setMousePos({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    });

    instance.on('mouseout', () => {
      setMousePos(null);
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
    if (!activeLayers['earthquakes']) { resetLayer('earthquakes'); return; }
    const load = async () => {
      try {
        const data = await fetchEarthquakes();
        setEarthquakes(data);
        updateHealth('earthquakes', true);
        // Only toast on significant NEW earthquakes (first load or changed)
        const significant = data.filter(e => e.magnitude >= 5.5);
        if (significant.length > 0) {
          const top = significant[0];
          smartToast('earthquakes', {
            type: 'warning',
            title: `EARTHQUAKE ALERT`,
            message: `M${top.magnitude} detected near ${top.place}`,
            duration: 8000,
          }, top.id);
        }
      } catch {
        updateHealth('earthquakes', false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [activeLayers, smartToast, updateHealth, resetLayer, refreshSignal]);

  // Fetch military aircraft
  useEffect(() => {
    if (!activeLayers['flights_military']) { resetLayer('flights_military'); return; }
    const load = async () => {
      try {
        const data = await fetchMilitaryAircraft();
        setAircraft(data);
        updateHealth('flights_military', true);
        smartToast('flights_military', {
          type: 'info',
          title: `MIL AIR TRACKING`,
          message: `${data.length} military aircraft active`,
          duration: 4000,
        }, `count:${data.length}`);
      } catch {
        updateHealth('flights_military', false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [activeLayers, smartToast, updateHealth, resetLayer, refreshSignal]);

  // Fetch air quality
  useEffect(() => {
    if (!activeLayers['air_quality']) return;
    const load = async () => {
      try {
        const data = await fetchAirQuality();
        setAirQuality(data);
        updateHealth('air_quality', true);
      } catch {
        updateHealth('air_quality', false);
      }
    };
    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [activeLayers, updateHealth, refreshSignal]);

  // Fetch CCTV cameras dynamically
  useEffect(() => {
    if (!activeLayers['cctv']) return;
    const load = async () => {
      try {
        const data = await getAllCameras();
        setCctvList(data);
        updateHealth('cctv', true);
      } catch {
        updateHealth('cctv', false);
      }
    };
    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [activeLayers, updateHealth, refreshSignal]);

  // Fetch Shodan hosts
  useEffect(() => {
    if (!activeLayers['shodan']) return;
    const load = async () => {
      try {
        const data = await searchShodan('webcam');
        setShodanHosts(data.matches.slice(0, 100));
        updateHealth('shodan', true);
      } catch {
        updateHealth('shodan', false);
      }
    };
    load();
  }, [activeLayers, updateHealth, refreshSignal]);

  // Fetch vessels
  useEffect(() => {
    if (!activeLayers['ships']) { resetLayer('ships'); return; }
    const load = async () => {
      try {
        const data = await fetchVessels();
        setVessels(data);
        updateHealth('ships', true);
        smartToast('ships', {
          type: 'info',
          title: `NAVAL TRAFFIC`,
          message: `${data.length} vessels tracked`,
          duration: 4000,
        }, `count:${data.length}`);
      } catch {
        updateHealth('ships', false);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [activeLayers, smartToast, updateHealth, resetLayer, refreshSignal]);

  // Fetch weather alerts
  useEffect(() => {
    if (!activeLayers['weather']) return;
    const load = async () => {
      try {
        const data = await fetchWeatherAlerts();
        setWeatherAlerts(data);
        updateHealth('weather', true);
      } catch {
        updateHealth('weather', false);
      }
    };
    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [activeLayers, updateHealth, refreshSignal]);

  // Fetch fire hotspots
  useEffect(() => {
    if (!activeLayers['fires']) return;
    const load = async () => {
      try {
        const data = await fetchFireHotspots();
        setFireHotspots(data);
        updateHealth('fires', true);
      } catch {
        updateHealth('fires', false);
      }
    };
    load();
    const interval = setInterval(load, 300000);
    return () => clearInterval(interval);
  }, [activeLayers, updateHealth, refreshSignal]);

  // Fetch commercial flights
  useEffect(() => {
    if (!activeLayers['flights_commercial']) { resetLayer('flights_commercial'); return; }
    const load = async () => {
      try {
        const data = await fetchCommercialFlights();
        setCommercialFlights(data);
        updateHealth('flights_commercial', true);
        smartToast('flights_commercial', {
          type: 'info',
          title: `COMMERCIAL AIR`,
          message: `${data.length} flights tracked`,
          duration: 4000,
        }, `count:${data.length}`);
      } catch {
        updateHealth('flights_commercial', false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [activeLayers, smartToast, updateHealth, resetLayer, refreshSignal]);

  // --- MARKER UPDATERS ---

  const updateCctvMarkers = useCallback(() => {
    if (!map.current) return;
    cctvMarkersRef.current.forEach(m => m.remove());
    cctvMarkersRef.current = [];
    if (!activeLayers['cctv']) return;

    // Skip rendering if zoomed out too far — too many markers kills performance
    const zoom = map.current.getZoom();
    const isZoomedOut = zoom < 9;

    cctvList.forEach((cam) => {
      // When zoomed out, only show a subset of cameras (spaced out)
      if (isZoomedOut) {
        // Simple spatial filter: only show every 20th camera to avoid clutter
        const hash = cam.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        if (hash % 20 !== 0) return;
      }

      const el = document.createElement('div');
      const size = isZoomedOut ? 8 : 14;
      el.innerHTML = `<div style="width:${size}px;height:${size}px;background:#22c55e;border:2px solid #000;border-radius:50%;box-shadow:0 0 8px #22c55e;cursor:pointer;transition:transform 0.2s;"></div>`;
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
  }, [activeLayers, cctvList, onCameraSelect]);

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

  const updateShodanMarkers = useCallback(() => {
    if (!map.current) return;
    shodanMarkersRef.current.forEach(m => m.remove());
    shodanMarkersRef.current = [];
    if (!activeLayers['shodan']) return;

    shodanHosts.forEach((host) => {
      const color = getShodanColor(host.ports);
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:8px;height:8px;background:${color};border:1.5px solid #000;border-radius:1px;box-shadow:0 0 4px ${color};cursor:pointer;transform:rotate(45deg);"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([host.longitude, host.latitude]).addTo(map.current!);
      const vulns = host.vulns ? `<br/><span style="color:#ef4444">VULNS: ${host.vulns.slice(0, 3).join(', ')}</span>` : '';
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:220px;"><strong>${host.ip_str}</strong><br/><span style="color:#888">${host.org || host.isp || 'Unknown'}<br/>Ports: ${host.ports.join(', ')}<br/>${host.city || ''}, ${host.country_code || ''}<br/>${host.product || ''} ${host.version || ''}${vulns}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([host.longitude, host.latitude]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      shodanMarkersRef.current.push(marker);
    });
  }, [activeLayers, shodanHosts]);

  const updateVesselMarkers = useCallback(() => {
    if (!map.current) return;
    vesselMarkersRef.current.forEach(m => m.remove());
    vesselMarkersRef.current = [];
    if (!activeLayers['ships']) return;

    vessels.forEach((v) => {
      const color = getVesselColor(v.type);
      const el = document.createElement('div');
      // Chevron/ship shape pointing in heading direction
      el.innerHTML = `<div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:10px solid ${color};transform:rotate(${v.heading}deg);filter:drop-shadow(0 0 3px ${color});cursor:pointer;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([v.lng, v.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${v.name}</strong><br/><span style="color:#888">${v.type} • ${v.flag || 'UNK'}<br/>${Math.round(v.speed)}kts • HDG ${v.heading}°<br/>${v.destination ? `→ ${v.destination}` : ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([v.lng, v.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      vesselMarkersRef.current.push(marker);
    });
  }, [activeLayers, vessels]);

  const updateWeatherMarkers = useCallback(() => {
    if (!map.current) return;
    weatherMarkersRef.current.forEach(m => m.remove());
    weatherMarkersRef.current = [];
    if (!activeLayers['weather']) return;

    weatherAlerts.forEach((w) => {
      const color = getSeverityColor(w.severity);
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:12px;height:12px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 6px ${color};cursor:pointer;opacity:0.9;animation:pulse 2s infinite;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([w.lng, w.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${w.event.toUpperCase()}</strong><br/><span style="color:#888">${w.area}<br/>${w.description}<br/>Severity: ${w.severity.toUpperCase()}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([w.lng, w.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      weatherMarkersRef.current.push(marker);
    });
  }, [activeLayers, weatherAlerts]);

  const updateFireMarkers = useCallback(() => {
    if (!map.current) return;
    fireMarkersRef.current.forEach(m => m.remove());
    fireMarkersRef.current = [];
    if (!activeLayers['fires']) return;

    fireHotspots.forEach((f) => {
      const color = getFireColor(f.intensity);
      const size = getFireSize(f.intensity);
      const el = document.createElement('div');
      el.innerHTML = `<div style="width:${size}px;height:${size}px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 8px ${color};cursor:pointer;opacity:0.85;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([f.lng, f.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>FIRE HOTSPOT</strong><br/><span style="color:#888">Intensity: ${f.intensity}/10<br/>Confidence: ${f.confidence}<br/>Satellite: ${f.satellite}<br/>${new Date(f.time).toISOString().slice(0, 19)} UTC</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([f.lng, f.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      fireMarkersRef.current.push(marker);
    });
  }, [activeLayers, fireHotspots]);

  const updateConflictMarkers = useCallback(() => {
    if (!map.current) return;
    conflictMarkersRef.current.forEach(m => m.remove());
    conflictMarkersRef.current = [];
    if (!activeLayers['conflict']) return;

    conflictList.forEach((c) => {
      const color = getConflictColor(c.intensity);
      const size = getConflictSize(c.intensity);
      const el = document.createElement('div');
      // Cross/X shape for conflict
      el.innerHTML = `<div style="width:${size}px;height:${size}px;position:relative;cursor:pointer;">
        <div style="position:absolute;top:50%;left:0;width:100%;height:2px;background:${color};transform:translateY(-50%) rotate(45deg);box-shadow:0 0 4px ${color};"></div>
        <div style="position:absolute;top:50%;left:0;width:100%;height:2px;background:${color};transform:translateY(-50%) rotate(-45deg);box-shadow:0 0 4px ${color};"></div>
      </div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:220px;"><strong>${c.name.toUpperCase()}</strong><br/><span style="color:#888">${c.type}<br/>${c.description}<br/>Intensity: ${c.intensity.toUpperCase()}<br/>Since: ${c.since}<br/>${c.casualties ? `Casualties: ${c.casualties}` : ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([c.lng, c.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      conflictMarkersRef.current.push(marker);
    });
  }, [activeLayers, conflictList]);

  const updateSatelliteMarkers = useCallback(() => {
    if (!map.current) return;
    satelliteMarkersRef.current.forEach(m => m.remove());
    satelliteMarkersRef.current = [];
    if (!activeLayers['satellites']) return;

    satelliteList.forEach((s) => {
      const color = getSatelliteColor(s.type);
      const el = document.createElement('div');
      // Diamond shape for satellite
      el.innerHTML = `<div style="width:8px;height:8px;background:${color};border:1.5px solid #000;transform:rotate(45deg);box-shadow:0 0 4px ${color};cursor:pointer;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([s.lng, s.lat]).addTo(map.current!);
      const orbitType = s.altitude > 30000 ? 'GEO' : s.altitude > 1000 ? 'MEO' : 'LEO';
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${s.name}</strong><br/><span style="color:#888">NORAD: ${s.noradId}<br/>${s.type}<br/>${s.operator}<br/>Alt: ${s.altitude.toLocaleString()}km (${orbitType})<br/>Launch: ${s.launchYear}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([s.lng, s.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      satelliteMarkersRef.current.push(marker);
    });
  }, [activeLayers, satelliteList]);

  const updateCommercialFlightMarkers = useCallback(() => {
    if (!map.current) return;
    commercialFlightMarkersRef.current.forEach(m => m.remove());
    commercialFlightMarkersRef.current = [];
    if (!activeLayers['flights_commercial']) return;

    commercialFlights.forEach((f) => {
      const el = document.createElement('div');
      // Small airplane icon in blue
      el.innerHTML = `<div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-bottom:8px solid #3b82f6;transform:rotate(${f.heading}deg);filter:drop-shadow(0 0 2px #3b82f6);cursor:pointer;opacity:0.8;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([f.lng, f.lat]).addTo(map.current!);
      const route = f.origin && f.destination ? `${f.origin} → ${f.destination}` : '';
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:#3b82f6;background:#000;padding:4px 8px;border:1px solid #3b82f6;max-width:200px;"><strong>${f.callsign}</strong><br/><span style="color:#888">${f.airline || 'Commercial'}<br/>${route}<br/>${f.altitude.toLocaleString()}ft • ${Math.round(f.speed)}kts<br/>${f.aircraft || ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([f.lng, f.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      commercialFlightMarkersRef.current.push(marker);
    });
  }, [activeLayers, commercialFlights]);

  const updateTrainMarkers = useCallback(() => {
    if (!map.current) return;
    trainMarkersRef.current.forEach(m => m.remove());
    trainMarkersRef.current = [];
    if (!activeLayers['trains']) return;

    trainList.forEach((t) => {
      const color = getTrainColor(t.type);
      const el = document.createElement('div');
      // Rectangle for train
      el.innerHTML = `<div style="width:10px;height:6px;background:${color};border:1.5px solid #000;border-radius:1px;box-shadow:0 0 4px ${color};cursor:pointer;transform:rotate(${t.heading}deg);"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([t.lng, t.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${t.name}</strong><br/><span style="color:#888">${t.type}<br/>${t.operator}<br/>${t.route ? t.route : ''}<br/>${Math.round(t.speed)} km/h<br/>${t.country}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([t.lng, t.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      trainMarkersRef.current.push(marker);
    });
  }, [activeLayers, trainList]);

  const updateJammingMarkers = useCallback(() => {
    if (!map.current) return;
    jammingMarkersRef.current.forEach(m => m.remove());
    jammingMarkersRef.current = [];
    if (!activeLayers['gps_jamming']) return;

    jammingZones.forEach((j) => {
      const color = getJammingColor(j.intensity);
      const el = document.createElement('div');
      // Lightning bolt shape
      el.innerHTML = `<div style="width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:10px solid ${color};filter:drop-shadow(0 0 3px ${color});cursor:pointer;transform:rotate(180deg);"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([j.lng, j.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:220px;"><strong>GPS JAMMING / SPOOFING</strong><br/><span style="color:#888">${j.source}<br/>${j.description}<br/>Radius: ${j.radius}km<br/>Intensity: ${j.intensity.toUpperCase()}<br/>${j.since ? `Since: ${j.since}` : ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([j.lng, j.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      jammingMarkersRef.current.push(marker);
    });
  }, [activeLayers, jammingZones]);

  const updateOutageMarkers = useCallback(() => {
    if (!map.current) return;
    outageMarkersRef.current.forEach(m => m.remove());
    outageMarkersRef.current = [];
    if (!activeLayers['outages']) return;

    outageList.forEach((o) => {
      const color = getOutageColor(o.severity);
      const el = document.createElement('div');
      // Broken connection icon style
      el.innerHTML = `<div style="width:10px;height:10px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 5px ${color};cursor:pointer;position:relative;">
        <div style="position:absolute;top:50%;left:-2px;width:14px;height:2px;background:${color};transform:translateY(-50%) rotate(45deg);"></div>
      </div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([o.lng, o.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:220px;"><strong>INTERNET OUTAGE</strong><br/><span style="color:#888">${o.region}, ${o.country}<br/>${o.affected}<br/>Cause: ${o.cause}<br/>Severity: ${o.severity.toUpperCase()}<br/>Since: ${o.since}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([o.lng, o.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      outageMarkersRef.current.push(marker);
    });
  }, [activeLayers, outageList]);

  const updateRadioMarkers = useCallback(() => {
    if (!map.current) return;
    radioMarkersRef.current.forEach(m => m.remove());
    radioMarkersRef.current = [];
    if (!activeLayers['radios']) return;

    radioList.forEach((r) => {
      const color = getRadioColor(r.type, r.status);
      const el = document.createElement('div');
      // Antenna shape
      el.innerHTML = `<div style="width:6px;height:6px;background:${color};border:1.5px solid #000;border-radius:50%;box-shadow:0 0 4px ${color};cursor:pointer;position:relative;">
        <div style="position:absolute;bottom:100%;left:50%;width:1px;height:6px;background:${color};transform:translateX(-50%);"></div>
        <div style="position:absolute;bottom:calc(100% + 4px);left:50%;width:8px;height:1px;background:${color};transform:translateX(-50%);"></div>
      </div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([r.lng, r.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${r.name}</strong><br/><span style="color:#888">${r.type}<br/>${r.frequency}<br/>Status: ${r.status.toUpperCase()}<br/>${r.operator || ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([r.lng, r.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      radioMarkersRef.current.push(marker);
    });
  }, [activeLayers, radioList]);

  const updateCarrierMarkers = useCallback(() => {
    if (!map.current) return;
    carrierMarkersRef.current.forEach(m => m.remove());
    carrierMarkersRef.current = [];
    if (!activeLayers['carriers']) return;

    carrierList.forEach((c) => {
      const color = getCarrierColor(c.status);
      const el = document.createElement('div');
      // Carrier icon — larger diamond
      el.innerHTML = `<div style="width:14px;height:14px;background:${color};border:2px solid #000;transform:rotate(45deg);box-shadow:0 0 8px ${color};cursor:pointer;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([c.lng, c.lat]).addTo(map.current!);
      const escorts = c.escorts.length > 0 ? `<br/>Escorts: ${c.escorts.slice(0, 3).join(', ')}${c.escorts.length > 3 ? '...' : ''}` : '';
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:11px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:260px;"><strong>${c.name}</strong><br/><span style="color:#888">${c.flagship}<br/>${c.type}<br/>${c.country} • ${c.region}<br/>Status: ${c.status.toUpperCase()}${escorts}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([c.lng, c.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      carrierMarkersRef.current.push(marker);
    });
  }, [activeLayers, carrierList]);

  const updateMeshMarkers = useCallback(() => {
    if (!map.current) return;
    meshMarkersRef.current.forEach(m => m.remove());
    meshMarkersRef.current = [];
    if (!activeLayers['mesh']) return;

    meshList.forEach((n) => {
      const color = getMeshColor(n.type, n.status);
      const el = document.createElement('div');
      // Hexagon for mesh
      el.innerHTML = `<div style="width:8px;height:8px;background:${color};border:1.5px solid #000;clip-path:polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);box-shadow:0 0 4px ${color};cursor:pointer;"></div>`;
      el.style.cursor = 'pointer';

      const marker = new maplibregl.Marker({ element: el }).setLngLat([n.lng, n.lat]).addTo(map.current!);
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
        .setHTML(`<div style="font-family:monospace;font-size:10px;color:${color};background:#000;padding:4px 8px;border:1px solid ${color};max-width:200px;"><strong>${n.name}</strong><br/><span style="color:#888">${n.type}<br/>Network: ${n.network}<br/>Protocol: ${n.protocol}<br/>Status: ${n.status.toUpperCase()}${n.range ? `<br/>Range: ${n.range}km` : ''}</span></div>`);
      el.addEventListener('mouseenter', () => popup.setLngLat([n.lng, n.lat]).addTo(map.current!));
      el.addEventListener('mouseleave', () => popup.remove());

      meshMarkersRef.current.push(marker);
    });
  }, [activeLayers, meshList]);

  // Apply all marker updates
  useEffect(() => { if (mapLoaded) updateCctvMarkers(); }, [mapLoaded, activeLayers, cctvList, updateCctvMarkers]);
  useEffect(() => { if (mapLoaded) updateEqMarkers(); }, [mapLoaded, activeLayers, earthquakes, updateEqMarkers]);
  useEffect(() => { if (mapLoaded) updateAircraftMarkers(); }, [mapLoaded, activeLayers, aircraft, updateAircraftMarkers]);
  useEffect(() => { if (mapLoaded) updateVolcanoMarkers(); }, [mapLoaded, activeLayers, updateVolcanoMarkers]);
  useEffect(() => { if (mapLoaded) updateInfraMarkers(); }, [mapLoaded, activeLayers, updateInfraMarkers]);
  useEffect(() => { if (mapLoaded) updateAqMarkers(); }, [mapLoaded, activeLayers, airQuality, updateAqMarkers]);
  useEffect(() => { if (mapLoaded) updateShodanMarkers(); }, [mapLoaded, activeLayers, shodanHosts, updateShodanMarkers]);
  useEffect(() => { if (mapLoaded) updateVesselMarkers(); }, [mapLoaded, activeLayers, vessels, updateVesselMarkers]);
  useEffect(() => { if (mapLoaded) updateWeatherMarkers(); }, [mapLoaded, activeLayers, weatherAlerts, updateWeatherMarkers]);
  useEffect(() => { if (mapLoaded) updateFireMarkers(); }, [mapLoaded, activeLayers, fireHotspots, updateFireMarkers]);
  useEffect(() => { if (mapLoaded) updateConflictMarkers(); }, [mapLoaded, activeLayers, conflictList, updateConflictMarkers]);
  useEffect(() => { if (mapLoaded) updateSatelliteMarkers(); }, [mapLoaded, activeLayers, satelliteList, updateSatelliteMarkers]);
  useEffect(() => { if (mapLoaded) updateCommercialFlightMarkers(); }, [mapLoaded, activeLayers, commercialFlights, updateCommercialFlightMarkers]);
  useEffect(() => { if (mapLoaded) updateTrainMarkers(); }, [mapLoaded, activeLayers, trainList, updateTrainMarkers]);
  useEffect(() => { if (mapLoaded) updateJammingMarkers(); }, [mapLoaded, activeLayers, jammingZones, updateJammingMarkers]);
  useEffect(() => { if (mapLoaded) updateOutageMarkers(); }, [mapLoaded, activeLayers, outageList, updateOutageMarkers]);
  useEffect(() => { if (mapLoaded) updateRadioMarkers(); }, [mapLoaded, activeLayers, radioList, updateRadioMarkers]);
  useEffect(() => { if (mapLoaded) updateCarrierMarkers(); }, [mapLoaded, activeLayers, carrierList, updateCarrierMarkers]);
  useEffect(() => { if (mapLoaded) updateMeshMarkers(); }, [mapLoaded, activeLayers, meshList, updateMeshMarkers]);

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

      {/* Mouse coordinate tracker */}
      {mousePos && (
        <div className="absolute bottom-8 left-4 z-20 bg-black/80 border border-green-500/20 rounded px-2 py-1 pointer-events-none">
          <span className="text-[10px] font-mono text-green-500/60">
            {mousePos.lat.toFixed(4)}°, {mousePos.lng.toFixed(4)}°
          </span>
        </div>
      )}
    </div>
  );
}
