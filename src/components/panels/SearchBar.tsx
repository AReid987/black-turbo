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
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const containerRef          = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.length < 2) { setResults([]); return; }
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
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
    setQuery(result.display_name);
    setOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', fontFamily: 'var(--font-mono)' }}>
      {/* Input wrapper */}
      <div
        className="hud-accent"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--aig-void-raised)',
          border: '1px solid oklch(0.90 0.010 250 / 0.10)',
          padding: '0.25rem 0.5rem',
          gap: '0.375rem',
          transition: `border-color var(--aig-duration-fast) var(--aig-ease-out-expo)`,
        }}
      >
        <Search
          style={{ width: '0.625rem', height: '0.625rem', color: 'var(--aig-accent-warm)', flexShrink: 0 }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder="Search location..."
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--aig-text-body)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            letterSpacing: 'var(--aig-tracking-wide)',
            width: '10rem',
          }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X style={{ width: '0.625rem', height: '0.625rem', color: 'var(--aig-text-tertiary)' }} />
          </button>
        )}
        {loading && (
          <div
            className="aig-spin"
            style={{
              width: '0.625rem',
              height: '0.625rem',
              border: '1px solid oklch(0.90 0.010 250 / 0.12)',
              borderTopColor: 'var(--aig-accent-warm)',
              borderRadius: '50%',
              flexShrink: 0,
            }}
          />
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '2px',
            background: 'var(--aig-void-base)',
            border: '1px solid oklch(0.75 0.150 65 / 0.20)',
            maxHeight: '15rem',
            overflowY: 'auto',
            zIndex: 'var(--z-overlay)',
          }}
        >
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => handleSelect(r)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                fontSize: '0.625rem',
                fontFamily: 'var(--font-mono)',
                letterSpacing: 'var(--aig-tracking-wide)',
                color: 'var(--aig-text-secondary)',
                background: 'transparent',
                border: 'none',
                borderBottom: i < results.length - 1 ? '1px solid oklch(0.90 0.010 250 / 0.06)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                transition: `color var(--aig-duration-fast) var(--aig-ease-out-expo), background var(--aig-duration-fast) var(--aig-ease-out-expo)`,
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.color = 'var(--aig-accent-warm)';
                el.style.background = 'oklch(0.75 0.150 65 / 0.06)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.color = 'var(--aig-text-secondary)';
                el.style.background = 'transparent';
              }}
            >
              <MapPin style={{ width: '0.625rem', height: '0.625rem', flexShrink: 0, marginTop: '1px', color: 'var(--aig-accent-warm-dim)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.display_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
