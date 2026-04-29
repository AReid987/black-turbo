'use client';

import { useEffect, useState, useRef } from 'react';
import { X, RefreshCw, MapPin, Radio } from 'lucide-react';
import type { CctvCamera } from '@/lib/data/cctv';

interface CctvViewerProps {
  camera: CctvCamera;
  onClose: () => void;
}

function getProxyUrl(originalUrl: string): string {
  // Use our proxy to bypass CORS
  return `/api/proxy/cctv?url=${encodeURIComponent(originalUrl)}`;
}

export function CctvViewer({ camera, onClose }: CctvViewerProps) {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [status, setStatus] = useState<'loading' | 'live' | 'error'>('loading');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshInterval = (camera.refreshInterval || 5) * 1000;

  useEffect(() => {
    setStatus('loading');
    const img = new Image();
    img.onload = () => setStatus('live');
    img.onerror = () => setStatus('error');
    img.src = `${getProxyUrl(camera.url)}&t=${Date.now()}`;
  }, [camera.url]);

  useEffect(() => {
    if (camera.type === 'image') {
      intervalRef.current = setInterval(() => {
        setTimestamp(Date.now());
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [camera.type, refreshInterval]);

  const imageUrl = camera.type === 'image'
    ? `${getProxyUrl(camera.url)}&t=${timestamp}`
    : getProxyUrl(camera.url);

  return (
    <div className="absolute top-4 right-4 z-30 w-80 bg-black/95 border border-green-500/50 rounded-lg shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/30 bg-green-900/20">
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          <span className="text-green-400 text-xs font-mono font-bold tracking-wider">LIVE FEED</span>
        </div>
        <button
          onClick={onClose}
          className="text-green-500/70 hover:text-green-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Feed */}
      <div className="relative bg-black">
        {status === 'loading' && (
          <div className="flex items-center justify-center h-48">
            <RefreshCw className="w-6 h-6 text-green-500 animate-spin" />
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center justify-center h-48 text-red-400 text-xs font-mono">
            SIGNAL LOST
          </div>
        )}
        <img
          src={imageUrl}
          alt={camera.name}
          className={`w-full h-48 object-cover ${status === 'live' ? 'block' : 'hidden'}`}
          onLoad={() => setStatus('live')}
          onError={() => setStatus('error')}
        />

        {/* Timestamp overlay */}
        <div className="absolute bottom-2 left-2 text-[10px] font-mono text-green-400/80 bg-black/60 px-1.5 py-0.5 rounded">
          {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2 space-y-1">
        <h4 className="text-white text-xs font-semibold truncate">{camera.name}</h4>
        <div className="flex items-center text-gray-400 text-[10px] font-mono space-x-1">
          <MapPin className="w-3 h-3" />
          <span>{camera.city}, {camera.country}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-green-500/70 uppercase">
            {camera.type} • {camera.refreshInterval}s refresh
          </span>
          <button
            onClick={() => setTimestamp(Date.now())}
            className="text-green-500/60 hover:text-green-400 transition-colors"
            title="Refresh now"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
