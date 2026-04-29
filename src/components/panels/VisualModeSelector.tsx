'use client';

import { Monitor, Satellite, Thermometer, Eye, Terminal } from 'lucide-react';
import type { VisualMode } from '@/components/map/ShadowbrokerMap';

interface VisualModeSelectorProps {
  currentMode: VisualMode;
  onChange: (mode: VisualMode) => void;
}

const modes: { id: VisualMode; label: string; icon: React.ReactNode }[] = [
  { id: 'DEFAULT', label: 'DEFAULT', icon: <Monitor className="w-3.5 h-3.5" /> },
  { id: 'SATELLITE', label: 'SATELLITE', icon: <Satellite className="w-3.5 h-3.5" /> },
  { id: 'FLIR', label: 'FLIR', icon: <Thermometer className="w-3.5 h-3.5" /> },
  { id: 'NVG', label: 'NVG', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'CRT', label: 'CRT', icon: <Terminal className="w-3.5 h-3.5" /> },
];

export default function VisualModeSelector({ currentMode, onChange }: VisualModeSelectorProps) {
  return (
    <div className="flex items-center space-x-1 bg-black/80 border border-green-500/30 rounded-lg px-2 py-1.5">
      <span className="text-[10px] font-mono text-gray-500 mr-2 uppercase">Style</span>
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onChange(mode.id)}
          className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-mono transition-all ${
            currentMode === mode.id
              ? 'bg-green-500/20 text-green-400 border border-green-500/40'
              : 'text-gray-500 hover:text-gray-300 border border-transparent'
          }`}
          title={mode.label}
        >
          {mode.icon}
          <span className="hidden sm:inline">{mode.label}</span>
        </button>
      ))}
    </div>
  );
}
