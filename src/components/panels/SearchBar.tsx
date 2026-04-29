'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface SearchBarProps {
  onSelect: (lat: number, lng: number, name: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      performSearch(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const performSearch = async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { 'User-Agent': 'Shadowbroker-OSINT/1.0' } }
      );
      const data = await res.json();
      setResults(data || []);
      setOpen(true);
    } catch (e) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onSelect(lat, lng, result.display_name);
    setQuery(result.display_name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center bg-black/80 border border-green-500/30 rounded px-2 py-1">
        <Search className="w-3 h-3 text-green-500/60 mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search location..."
          className="bg-transparent text-green-400 text-xs font-mono w-40 sm:w-56 outline-none placeholder-green-500/30"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}>
            <X className="w-3 h-3 text-gray-600 hover:text-gray-400" />
          </button>
        )}
        {loading && <div className="w-3 h-3 border border-green-500/30 border-t-green-500 rounded-full animate-spin ml-2" />}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-black/95 border border-green-500/30 rounded max-h-60 overflow-y-auto z-50">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2 text-[10px] font-mono text-green-400/80 hover:bg-green-900/20 hover:text-green-400 border-b border-green-500/10 last:border-0 flex items-start space-x-2"
            >
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-green-500/40" />
              <span className="line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
