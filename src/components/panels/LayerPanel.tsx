'use client';

import {
  Video,
  Plane,
  Ship,
  Radio,
  Satellite,
  Flame,
  Activity,
  Globe,
  Map as MapIcon,
  Train,
  Zap,
  Database,
  Shield,
  Eye,
  Wifi,
  Sun,
  Moon,
  Factory,
  Server,
  Wind,
} from 'lucide-react';

export interface LayerConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultOn: boolean;
  category: string;
}

export const layers: LayerConfig[] = [
  // Surveillance
  { id: 'cctv', name: 'CCTV Mesh (882+)', icon: <Video className="w-3.5 h-3.5" />, defaultOn: true, category: 'Surveillance' },

  // Aviation
  { id: 'flights_military', name: 'Military Aircraft', icon: <Plane className="w-3.5 h-3.5" />, defaultOn: true, category: 'Aviation' },
  { id: 'flights_commercial', name: 'Commercial Flights', icon: <Plane className="w-3.5 h-3.5" />, defaultOn: false, category: 'Aviation' },

  // Maritime
  { id: 'ships', name: 'Naval Traffic (20)', icon: <Ship className="w-3.5 h-3.5" />, defaultOn: false, category: 'Maritime' },
  { id: 'carriers', name: 'Carrier Groups (20)', icon: <Ship className="w-3.5 h-3.5" />, defaultOn: false, category: 'Maritime' },

  // Ground
  { id: 'trains', name: 'Rail Tracking (19)', icon: <Train className="w-3.5 h-3.5" />, defaultOn: false, category: 'Ground' },

  // Space
  { id: 'satellites', name: 'Satellites (24)', icon: <Satellite className="w-3.5 h-3.5" />, defaultOn: false, category: 'Space' },

  // SIGINT
  { id: 'radios', name: 'KiwiSDR / Scanners (21)', icon: <Radio className="w-3.5 h-3.5" />, defaultOn: false, category: 'SIGINT' },
  { id: 'mesh', name: 'Mesh / APRS (26)', icon: <Wifi className="w-3.5 h-3.5" />, defaultOn: false, category: 'SIGINT' },
  { id: 'gps_jamming', name: 'GPS Jamming (15)', icon: <Zap className="w-3.5 h-3.5" />, defaultOn: false, category: 'SIGINT' },

  // Environment
  { id: 'earthquakes', name: 'Earthquakes (USGS)', icon: <Activity className="w-3.5 h-3.5" />, defaultOn: true, category: 'Environment' },
  { id: 'volcanoes', name: 'Volcanoes (60)', icon: <MapIcon className="w-3.5 h-3.5" />, defaultOn: true, category: 'Environment' },
  { id: 'fires', name: 'Fire Hotspots (16)', icon: <Flame className="w-3.5 h-3.5" />, defaultOn: false, category: 'Environment' },
  { id: 'weather', name: 'Severe Weather (10)', icon: <Sun className="w-3.5 h-3.5" />, defaultOn: false, category: 'Environment' },
  { id: 'air_quality', name: 'Air Quality (OpenAQ)', icon: <Wind className="w-3.5 h-3.5" />, defaultOn: false, category: 'Environment' },

  // Infrastructure
  { id: 'infrastructure_bases', name: 'Military Bases (200+)', icon: <Shield className="w-3.5 h-3.5" />, defaultOn: false, category: 'Infrastructure' },
  { id: 'infrastructure_power', name: 'Power Plants (500+)', icon: <Factory className="w-3.5 h-3.5" />, defaultOn: false, category: 'Infrastructure' },
  { id: 'infrastructure_datacenters', name: 'Data Centers (30)', icon: <Server className="w-3.5 h-3.5" />, defaultOn: false, category: 'Infrastructure' },
  { id: 'outages', name: 'Internet Outages (15)', icon: <Wifi className="w-3.5 h-3.5" />, defaultOn: false, category: 'Infrastructure' },

  // Geopolitics
  { id: 'conflict', name: 'Conflict Zones (15)', icon: <Globe className="w-3.5 h-3.5" />, defaultOn: false, category: 'Geopolitics' },

  // Overlays
  { id: 'daynight', name: 'Day / Night Terminator', icon: <Moon className="w-3.5 h-3.5" />, defaultOn: true, category: 'Overlays' },
  { id: 'shodan', name: 'Shodan Devices', icon: <Eye className="w-3.5 h-3.5" />, defaultOn: false, category: 'Overlays' },
];

interface LayerPanelProps {
  activeLayers: Record<string, boolean>;
  onToggle: (id: string) => void;
}

export default function LayerPanel({ activeLayers, onToggle }: LayerPanelProps) {
  const categories = [...new Set(layers.map(l => l.category))];

  return (
    <div className="w-64 bg-black/95 border-r border-green-500/30 flex flex-col h-full">
      <div className="px-4 py-3 border-b border-green-500/30">
        <h2 className="text-green-400 text-xs font-mono font-bold tracking-widest uppercase">
          Data Layers
        </h2>
        <p className="text-gray-500 text-[10px] font-mono mt-1">
          {Object.values(activeLayers).filter(Boolean).length} active / {layers.length} total
        </p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {categories.map((category) => (
          <div key={category} className="mb-3">
            <div className="px-4 py-1.5 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
              {category}
            </div>
            {layers
              .filter((l) => l.category === category)
              .map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => onToggle(layer.id)}
                  className={`w-full flex items-center space-x-2.5 px-4 py-1.5 text-xs font-mono transition-colors ${
                    activeLayers[layer.id]
                      ? 'text-green-400 bg-green-900/10'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <span className={activeLayers[layer.id] ? 'text-green-400' : 'text-gray-600'}>
                    {layer.icon}
                  </span>
                  <span className="truncate">{layer.name}</span>
                  {activeLayers[layer.id] && (
                    <span className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-green-500/30 text-[10px] font-mono text-gray-600">
        Shadowbroker OSINT v0.4
      </div>
    </div>
  );
}
