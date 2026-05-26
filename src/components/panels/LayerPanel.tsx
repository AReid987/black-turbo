'use client';

import {
  Video, Plane, Ship, Radio, Satellite, Flame, Activity, Globe,
  Map as MapIcon, Train, Zap, Database, Shield, Eye, Wifi, Sun,
  Moon, Factory, Server, Wind, Search, X,
} from 'lucide-react';
import { useState } from 'react';
import type { HealthMap } from '@/components/map/ShadowbrokerMap';

export interface LayerConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  defaultOn: boolean;
  category: string;
}

export const layers: LayerConfig[] = [
  // Surveillance
  { id: 'cctv',                    name: 'CCTV Mesh (900+)',       icon: <Video className="w-3.5 h-3.5" />,    defaultOn: true,  category: 'Surveillance'   },
  // Aviation
  { id: 'flights_military',        name: 'Military Aircraft',       icon: <Plane className="w-3.5 h-3.5" />,    defaultOn: true,  category: 'Aviation'       },
  { id: 'flights_commercial',      name: 'Commercial Flights',      icon: <Plane className="w-3.5 h-3.5" />,    defaultOn: false, category: 'Aviation'       },
  // Maritime
  { id: 'ships',                   name: 'Naval Traffic (20)',      icon: <Ship className="w-3.5 h-3.5" />,     defaultOn: false, category: 'Maritime'       },
  { id: 'carriers',                name: 'Carrier Groups (20)',     icon: <Ship className="w-3.5 h-3.5" />,     defaultOn: false, category: 'Maritime'       },
  // Ground
  { id: 'trains',                  name: 'Rail Tracking (19)',      icon: <Train className="w-3.5 h-3.5" />,    defaultOn: false, category: 'Ground'         },
  // Space
  { id: 'satellites',              name: 'Satellites (24)',         icon: <Satellite className="w-3.5 h-3.5" />, defaultOn: false, category: 'Space'         },
  // SIGINT
  { id: 'radios',                  name: 'KiwiSDR / Scanners (21)', icon: <Radio className="w-3.5 h-3.5" />,   defaultOn: false, category: 'SIGINT'         },
  { id: 'mesh',                    name: 'Mesh / APRS (26)',        icon: <Wifi className="w-3.5 h-3.5" />,     defaultOn: false, category: 'SIGINT'         },
  { id: 'gps_jamming',             name: 'GPS Jamming (15)',        icon: <Zap className="w-3.5 h-3.5" />,      defaultOn: false, category: 'SIGINT'         },
  // Environment
  { id: 'earthquakes',             name: 'Earthquakes (USGS)',      icon: <Activity className="w-3.5 h-3.5" />, defaultOn: true,  category: 'Environment'    },
  { id: 'volcanoes',               name: 'Volcanoes (60)',          icon: <MapIcon className="w-3.5 h-3.5" />,  defaultOn: true,  category: 'Environment'    },
  { id: 'fires',                   name: 'Fire Hotspots (16)',      icon: <Flame className="w-3.5 h-3.5" />,    defaultOn: false, category: 'Environment'    },
  { id: 'weather',                 name: 'Severe Weather (10)',     icon: <Sun className="w-3.5 h-3.5" />,      defaultOn: false, category: 'Environment'    },
  { id: 'air_quality',             name: 'Air Quality (OpenAQ)',    icon: <Wind className="w-3.5 h-3.5" />,     defaultOn: false, category: 'Environment'    },
  // Infrastructure
  { id: 'infrastructure_bases',    name: 'Military Bases (200+)',   icon: <Shield className="w-3.5 h-3.5" />,   defaultOn: false, category: 'Infrastructure' },
  { id: 'infrastructure_power',    name: 'Power Plants (500+)',     icon: <Factory className="w-3.5 h-3.5" />,  defaultOn: false, category: 'Infrastructure' },
  { id: 'infrastructure_datacenters', name: 'Data Centers (30)',   icon: <Server className="w-3.5 h-3.5" />,   defaultOn: false, category: 'Infrastructure' },
  { id: 'outages',                 name: 'Internet Outages (15)',   icon: <Wifi className="w-3.5 h-3.5" />,     defaultOn: false, category: 'Infrastructure' },
  // Geopolitics
  { id: 'conflict',                name: 'Conflict Zones (15)',     icon: <Globe className="w-3.5 h-3.5" />,    defaultOn: false, category: 'Geopolitics'    },
  // Overlays
  { id: 'daynight',                name: 'Day / Night Terminator',  icon: <Moon className="w-3.5 h-3.5" />,     defaultOn: true,  category: 'Overlays'       },
  { id: 'shodan',                  name: 'Shodan Devices',          icon: <Eye className="w-3.5 h-3.5" />,      defaultOn: false, category: 'Overlays'       },
];

interface LayerPanelProps {
  activeLayers: Record<string, boolean>;
  onToggle: (id: string) => void;
  health?: HealthMap;
}

const healthColor = (status?: string): string => {
  switch (status) {
    case 'online':   return 'var(--aig-signal-go)';
    case 'degraded': return 'var(--aig-signal-conditional)';
    case 'offline':  return 'var(--aig-signal-avoid)';
    default:         return 'var(--aig-text-tertiary)';
  }
};

export default function LayerPanel({ activeLayers, onToggle, health }: LayerPanelProps) {
  const [filter, setFilter] = useState('');
  const categories = [...new Set(layers.map(l => l.category))];

  const filteredLayers = filter.trim()
    ? layers.filter(l =>
        l.name.toLowerCase().includes(filter.toLowerCase()) ||
        l.category.toLowerCase().includes(filter.toLowerCase())
      )
    : layers;

  const activeCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div
      className="glass-surface"
      style={{
        width: '15rem',
        background: 'var(--aig-void-base)',
        borderRight: '1px solid oklch(0.75 0.150 65 / 0.15)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid oklch(0.75 0.150 65 / 0.12)',
        }}
      >
        <h2
          style={{
            color: 'var(--aig-accent-warm)',
            fontSize: '0.625rem',
            letterSpacing: 'var(--aig-tracking-widest)',
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Data Layers
        </h2>
        <p style={{ color: 'var(--aig-text-tertiary)', fontSize: '0.5625rem', marginTop: '0.25rem', letterSpacing: 'var(--aig-tracking-wide)' }}>
          {activeCount} ACTIVE / {layers.length} TOTAL
        </p>
      </div>

      {/* Filter input */}
      <div
        style={{
          padding: '0.5rem 0.75rem',
          borderBottom: '1px solid oklch(0.90 0.010 250 / 0.06)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search
            style={{
              position: 'absolute',
              left: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '0.625rem',
              height: '0.625rem',
              color: 'var(--aig-text-tertiary)',
            }}
          />
          <input
            type="text"
            placeholder="Filter layers..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--aig-void-raised)',
              border: '1px solid oklch(0.90 0.010 250 / 0.10)',
              borderRadius: 0,
              paddingLeft: '1.375rem',
              paddingRight: filter ? '1.5rem' : '0.5rem',
              paddingTop: '0.375rem',
              paddingBottom: '0.375rem',
              fontSize: '0.6875rem',
              fontFamily: 'var(--font-mono)',
              color: 'var(--aig-text-body)',
              outline: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--aig-accent-warm)' }}
            onBlur={e => { e.target.style.borderColor = 'oklch(0.90 0.010 250 / 0.10)' }}
          />
          {filter && (
            <button
              onClick={() => setFilter('')}
              style={{
                position: 'absolute',
                right: '0.5rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--aig-text-tertiary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X style={{ width: '0.625rem', height: '0.625rem' }} />
            </button>
          )}
        </div>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>
        {categories.map(category => {
          const categoryLayers = filteredLayers.filter(l => l.category === category);
          if (categoryLayers.length === 0) return null;
          return (
            <div key={category} style={{ marginBottom: '0.5rem' }}>
              {/* Category header */}
              <div
                style={{
                  padding: '0.375rem 1rem',
                  fontSize: '0.5625rem',
                  color: 'var(--aig-text-tertiary)',
                  letterSpacing: 'var(--aig-tracking-widest)',
                  textTransform: 'uppercase',
                  borderLeft: '2px solid transparent',
                }}
              >
                {category}
              </div>

              {categoryLayers.map(layer => {
                const active = activeLayers[layer.id];
                const hStatus = health?.[layer.id]?.status;
                return (
                  <button
                    key={layer.id}
                    onClick={() => onToggle(layer.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.3125rem 1rem',
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: active ? 'var(--aig-accent-warm)' : 'var(--aig-text-tertiary)',
                      background: active ? 'oklch(0.75 0.150 65 / 0.06)' : 'transparent',
                      border: 'none',
                      borderLeft: active ? '2px solid var(--aig-accent-warm)' : '2px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: `color var(--aig-duration-fast) var(--aig-ease-out-expo), background var(--aig-duration-fast) var(--aig-ease-out-expo)`,
                      letterSpacing: 'var(--aig-tracking-wide)',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--aig-text-body)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--aig-text-tertiary)'
                      }
                    }}
                  >
                    {/* Icon */}
                    <span style={{ color: active ? 'var(--aig-accent-warm)' : 'var(--aig-text-tertiary)', flexShrink: 0 }}>
                      {layer.icon}
                    </span>

                    {/* Name */}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {layer.name}
                    </span>

                    {/* Health dot */}
                    {active && (
                      <span
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: healthColor(hStatus),
                          flexShrink: 0,
                          ...(hStatus === undefined ? { animation: 'dataBreath 1.2s ease-in-out infinite' } : {}),
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {filteredLayers.length === 0 && (
          <div
            style={{
              padding: '1.5rem 1rem',
              textAlign: 'center',
              color: 'var(--aig-text-tertiary)',
              fontSize: '0.5625rem',
              letterSpacing: 'var(--aig-tracking-widest)',
            }}
          >
            NO LAYERS MATCH
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '0.5rem 1rem',
          borderTop: '1px solid oklch(0.90 0.010 250 / 0.06)',
          fontSize: '0.5625rem',
          color: 'var(--aig-text-tertiary)',
          letterSpacing: 'var(--aig-tracking-wide)',
        }}
      >
        BLACKTIVISM OSINT v0.4
      </div>
    </div>
  );
}
