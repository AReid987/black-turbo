'use client';

import { useEffect, useState } from 'react';
import { X, Globe, Users, Landmark, BookOpen, Satellite } from 'lucide-react';

interface DossierData {
  country?: string;
  countryCode?: string;
  capital?: string;
  population?: number;
  languages?: string[];
  currencies?: string[];
  area?: number;
  region?: string;
  flag?: string;
}

interface DossierPanelProps {
  lat: number;
  lng: number;
  onClose: () => void;
}

export default function DossierPanel({ lat, lng, onClose }: DossierPanelProps) {
  const [data, setData] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wikiSummary, setWikiSummary] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Reverse geocode to country using BigDataCloud free API (no key needed)
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        );
        const geo = await geoRes.json();
        const countryCode = geo.countryCode?.toLowerCase();
        const countryName = geo.countryName;

        if (!countryCode || cancelled) return;

        // Fetch country data
        const countryRes = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        const countryData = await countryRes.json();
        const c = countryData[0];

        if (cancelled) return;

        setData({
          country: c.name.common,
          countryCode: countryCode.toUpperCase(),
          capital: c.capital?.[0],
          population: c.population,
          languages: Object.values(c.languages || {}),
          currencies: Object.values(c.currencies || {}).map((v: any) => v.name),
          area: c.area,
          region: c.region,
          flag: c.flags?.svg,
        });

        // Fetch Wikipedia summary
        const wikiRes = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(countryName)}`
        );
        if (wikiRes.ok) {
          const wiki = await wikiRes.json();
          setWikiSummary(wiki.extract || '');
        }
      } catch (err) {
        console.error('Dossier error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [lat, lng]);

  return (
    <div className="absolute top-4 left-4 z-30 w-80 bg-black/95 border border-green-500/50 rounded-lg shadow-2xl backdrop-blur-sm max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-green-500/30 bg-green-900/20 sticky top-0">
        <div className="flex items-center space-x-2">
          <Globe className="w-3.5 h-3.5 text-green-500" />
          <span className="text-green-400 text-xs font-mono font-bold tracking-wider">INTEL DOSSIER</span>
        </div>
        <button onClick={onClose} className="text-green-500/70 hover:text-green-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Coordinates */}
      <div className="px-3 py-2 border-b border-green-500/10">
        <span className="text-[10px] font-mono text-gray-500">
          {lat.toFixed(4)}, {lng.toFixed(4)}
        </span>
      </div>

      {loading && (
        <div className="px-3 py-8 text-center">
          <div className="text-green-500 text-xs font-mono animate-pulse">RETRIEVING INTEL...</div>
        </div>
      )}

      {!loading && data && (
        <div className="px-3 py-3 space-y-3">
          {/* Country name & flag */}
          <div className="flex items-center space-x-3">
            {data.flag && <img src={data.flag} alt={data.country} className="w-8 h-6 object-cover rounded border border-gray-700" />}
            <div>
              <h3 className="text-white text-sm font-bold">{data.country}</h3>
              <span className="text-[10px] font-mono text-gray-500">{data.countryCode} • {data.region}</span>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            {data.capital && (
              <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
                <div className="flex items-center space-x-1 text-gray-500 mb-1">
                  <Landmark className="w-3 h-3" />
                  <span className="text-[9px] font-mono uppercase">Capital</span>
                </div>
                <span className="text-green-400 text-[10px] font-mono">{data.capital}</span>
              </div>
            )}
            {data.population && (
              <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
                <div className="flex items-center space-x-1 text-gray-500 mb-1">
                  <Users className="w-3 h-3" />
                  <span className="text-[9px] font-mono uppercase">Population</span>
                </div>
                <span className="text-green-400 text-[10px] font-mono">{(data.population / 1e6).toFixed(1)}M</span>
              </div>
            )}
            {data.area && (
              <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
                <div className="flex items-center space-x-1 text-gray-500 mb-1">
                  <Satellite className="w-3 h-3" />
                  <span className="text-[9px] font-mono uppercase">Area</span>
                </div>
                <span className="text-green-400 text-[10px] font-mono">{(data.area / 1e6).toFixed(2)}M km²</span>
              </div>
            )}
            {data.languages && data.languages.length > 0 && (
              <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
                <div className="flex items-center space-x-1 text-gray-500 mb-1">
                  <BookOpen className="w-3 h-3" />
                  <span className="text-[9px] font-mono uppercase">Languages</span>
                </div>
                <span className="text-green-400 text-[10px] font-mono truncate block">{data.languages.slice(0, 2).join(', ')}</span>
              </div>
            )}
          </div>

          {/* Wikipedia summary */}
          {wikiSummary && (
            <div className="bg-gray-900/50 rounded p-2 border border-gray-800">
              <div className="flex items-center space-x-1 text-gray-500 mb-1">
                <BookOpen className="w-3 h-3" />
                <span className="text-[9px] font-mono uppercase">Summary</span>
              </div>
              <p className="text-gray-300 text-[10px] leading-relaxed line-clamp-6">{wikiSummary}</p>
            </div>
          )}
        </div>
      )}

      {!loading && !data && (
        <div className="px-3 py-6 text-center text-gray-500 text-xs font-mono">
          NO DATA AVAILABLE
        </div>
      )}
    </div>
  );
}
