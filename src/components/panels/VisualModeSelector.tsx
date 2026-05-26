'use client';

import { Monitor, Satellite, Thermometer, Eye, Terminal } from 'lucide-react';
import type { VisualMode } from '@/components/map/ShadowbrokerMap';

interface VisualModeSelectorProps {
  currentMode: VisualMode;
  onChange: (mode: VisualMode) => void;
}

const modes: { id: VisualMode; label: string; icon: React.ReactNode }[] = [
  { id: 'DEFAULT',   label: 'DEFAULT',   icon: <Monitor     style={{ width: '0.75rem', height: '0.75rem' }} /> },
  { id: 'SATELLITE', label: 'SAT',       icon: <Satellite   style={{ width: '0.75rem', height: '0.75rem' }} /> },
  { id: 'FLIR',      label: 'FLIR',      icon: <Thermometer style={{ width: '0.75rem', height: '0.75rem' }} /> },
  { id: 'NVG',       label: 'NVG',       icon: <Eye         style={{ width: '0.75rem', height: '0.75rem' }} /> },
  { id: 'CRT',       label: 'CRT',       icon: <Terminal    style={{ width: '0.75rem', height: '0.75rem' }} /> },
];

export default function VisualModeSelector({ currentMode, onChange }: VisualModeSelectorProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.125rem',
        background: 'var(--aig-void-raised)',
        border: '1px solid oklch(0.90 0.010 250 / 0.10)',
        padding: '0.25rem',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span
        style={{
          fontSize: '0.5rem',
          color: 'var(--aig-text-tertiary)',
          letterSpacing: 'var(--aig-tracking-widest)',
          marginRight: '0.25rem',
          textTransform: 'uppercase',
        }}
      >
        VIS
      </span>
      {modes.map(mode => {
        const active = currentMode === mode.id;
        return (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            title={mode.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem',
              padding: '0.1875rem 0.375rem',
              fontSize: '0.5625rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: 'var(--aig-tracking-wide)',
              color: active ? 'var(--aig-void-deep)' : 'var(--aig-text-secondary)',
              background: active ? 'var(--aig-accent-warm)' : 'transparent',
              border: `1px solid ${active ? 'var(--aig-accent-warm)' : 'transparent'}`,
              borderRadius: 0,
              cursor: 'pointer',
              transition: `color var(--aig-duration-fast) var(--aig-ease-out-expo), background var(--aig-duration-fast) var(--aig-ease-out-expo)`,
            }}
            onMouseEnter={e => {
              if (!active) {
                const el = e.currentTarget;
                el.style.color = 'var(--aig-accent-warm)';
                el.style.borderColor = 'oklch(0.75 0.150 65 / 0.40)';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                const el = e.currentTarget;
                el.style.color = 'var(--aig-text-secondary)';
                el.style.borderColor = 'transparent';
              }
            }}
          >
            {mode.icon}
            <span className="hidden-sm">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}
