'use client';

import { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsProps {
  onToggleLayer: (id: string) => void;
  onSetMode: (mode: 'DEFAULT' | 'SATELLITE' | 'FLIR' | 'NVG' | 'CRT') => void;
  onCloseCamera: () => void;
  layerIds: string[];
}

export default function KeyboardShortcuts({ onToggleLayer, onSetMode, onCloseCamera, layerIds }: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      // Number keys 1-9 toggle layers
      const num = parseInt(e.key);
      if (!isNaN(num) && num >= 1 && num <= Math.min(9, layerIds.length)) {
        e.preventDefault();
        onToggleLayer(layerIds[num - 1]);
        return;
      }

      switch (key) {
        case 'm':
          e.preventDefault();
          onToggleLayer('cctv');
          break;
        case 'a':
          e.preventDefault();
          onToggleLayer('flights_military');
          break;
        case 'c':
          e.preventDefault();
          onToggleLayer('flights_commercial');
          break;
        case 's':
          e.preventDefault();
          onToggleLayer('ships');
          break;
        case 'g':
          e.preventDefault();
          onToggleLayer('carriers');
          break;
        case 'e':
          e.preventDefault();
          onToggleLayer('earthquakes');
          break;
        case 'v':
          e.preventDefault();
          onToggleLayer('volcanoes');
          break;
        case 'f':
          e.preventDefault();
          onToggleLayer('fires');
          break;
        case 'w':
          e.preventDefault();
          onToggleLayer('weather');
          break;
        case 'o':
          e.preventDefault();
          onToggleLayer('conflict');
          break;
        case 'd':
          e.preventDefault();
          onSetMode('DEFAULT');
          break;
        case 't':
          e.preventDefault();
          onSetMode('SATELLITE');
          break;
        case 'n':
          e.preventDefault();
          onSetMode('NVG');
          break;
        case 'r':
          e.preventDefault();
          onSetMode('FLIR');
          break;
        case 'x':
          e.preventDefault();
          onSetMode('CRT');
          break;
        case 'escape':
          e.preventDefault();
          onCloseCamera();
          break;
        case '?':
          e.preventDefault();
          setShowHelp(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onToggleLayer, onSetMode, onCloseCamera, layerIds]);

  if (!showHelp) return null;

  return (
    <div className="absolute top-14 right-4 z-50 w-80 bg-black/95 border border-green-500/30 rounded-lg shadow-2xl">
      <div className="px-4 py-3 border-b border-green-500/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Keyboard className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-mono font-bold">KEYBOARD SHORTCUTS</span>
        </div>
        <button onClick={() => setShowHelp(false)} className="text-gray-500 hover:text-gray-300 text-xs font-mono">ESC</button>
      </div>
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        <div>
          <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Layers</h3>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <span className="text-green-400">M</span><span className="text-gray-400">CCTV Mesh</span>
            <span className="text-green-400">A</span><span className="text-gray-400">Military Aircraft</span>
            <span className="text-green-400">C</span><span className="text-gray-400">Commercial Flights</span>
            <span className="text-green-400">S</span><span className="text-gray-400">Ships / AIS</span>
            <span className="text-green-400">G</span><span className="text-gray-400">Carrier Groups</span>
            <span className="text-green-400">E</span><span className="text-gray-400">Earthquakes</span>
            <span className="text-green-400">V</span><span className="text-gray-400">Volcanoes</span>
            <span className="text-green-400">F</span><span className="text-gray-400">Fire Hotspots</span>
            <span className="text-green-400">W</span><span className="text-gray-400">Severe Weather</span>
            <span className="text-green-400">O</span><span className="text-gray-400">Conflict Zones</span>
            <span className="text-green-400">1-9</span><span className="text-gray-400">Toggle layer N</span>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Visual Modes</h3>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <span className="text-green-400">D</span><span className="text-gray-400">Default (Dark)</span>
            <span className="text-green-400">T</span><span className="text-gray-400">Satellite</span>
            <span className="text-green-400">N</span><span className="text-gray-400">Night Vision</span>
            <span className="text-green-400">R</span><span className="text-gray-400">Thermal (FLIR)</span>
            <span className="text-green-400">X</span><span className="text-gray-400">CRT Monitor</span>
          </div>
        </div>
        <div>
          <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">General</h3>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <span className="text-green-400">ESC</span><span className="text-gray-400">Close camera / dossier</span>
            <span className="text-green-400">?</span><span className="text-gray-400">Toggle this help</span>
          </div>
        </div>
      </div>
    </div>
  );
}
