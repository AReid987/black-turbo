'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AlertCircle, RefreshCw, LogOut, Layers, EyeOff, RotateCcw } from 'lucide-react'
import SearchBar from '@/components/panels/SearchBar'
import KeyboardShortcuts from '@/components/panels/KeyboardShortcuts'
import dynamic from 'next/dynamic'
import LayerPanel, { layers as layerConfigs } from '@/components/panels/LayerPanel'
import VisualModeSelector from '@/components/panels/VisualModeSelector'
import type { VisualMode, HealthMap, LayerStats } from '@/components/map/ShadowbrokerMap'
import type { CctvCamera } from '@/lib/data/cctv'
import ToastContainer, { useToasts } from '@/components/ui/Toast'

// Dynamic import — MapLibre requires browser environment
const ShadowbrokerMap = dynamic(() => import('@/components/map/ShadowbrokerMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        background: 'var(--aig-void-deep)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <span
        style={{
          color: 'var(--aig-accent-warm)',
          fontSize: '0.75rem',
          letterSpacing: 'var(--aig-tracking-widest)',
          animation: 'dataBreath 1.2s ease-in-out infinite',
        }}
      >
        LOADING TACTICAL DISPLAY...
      </span>
    </div>
  ),
})

// ── Signal dot color by health status ────────────────────────────────────────
const healthDotColor = (status?: string): string => {
  switch (status) {
    case 'online':   return 'var(--aig-signal-go)'
    case 'degraded': return 'var(--aig-signal-conditional)'
    case 'offline':  return 'var(--aig-signal-avoid)'
    default:         return 'var(--aig-text-tertiary)'
  }
}

// ── Sources health summary label color ────────────────────────────────────────
const sourcesSummaryColor = (health: HealthMap): string => {
  const vals = Object.values(health)
  if (vals.some(h => h.status === 'offline'))  return 'var(--aig-signal-avoid)'
  if (vals.some(h => h.status === 'degraded')) return 'var(--aig-accent-warm)'
  return 'var(--aig-signal-go)'
}

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading]             = useState(true)
  const [error, setError]                     = useState('')
  const [panelOpen, setPanelOpen]             = useState(true)
  const [visualMode, setVisualMode]           = useState<VisualMode>('DEFAULT')
  const [activeCamera, setActiveCamera]       = useState<CctvCamera | null>(null)
  const [health, setHealth]                   = useState<HealthMap>({})
  const [stats, setStats]                     = useState<LayerStats>({})
  const [refreshKey, setRefreshKey]           = useState(0)
  const { toasts, addToast, dismissToast }    = useToasts()

  // Initialise layer states from URL or defaults
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    layerConfigs.forEach(l => { initial[l.id] = l.defaultOn })
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const layersParam = params.get('layers')
      if (layersParam) {
        const enabled = new Set(layersParam.split(','))
        layerConfigs.forEach(l => { initial[l.id] = enabled.has(l.id) })
      }
    }
    return initial
  })

  // Read visual mode from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const modeParam = params.get('mode') as VisualMode | null
    if (modeParam && ['DEFAULT', 'SATELLITE', 'FLIR', 'NVG', 'CRT'].includes(modeParam)) {
      setVisualMode(modeParam)
    }
  }, [])

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Persist state to URL (debounced 300ms)
  const urlTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (urlTimeoutRef.current) clearTimeout(urlTimeoutRef.current)
    urlTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      const enabled = Object.entries(activeLayers).filter(([, v]) => v).map(([k]) => k)
      if (enabled.length > 0) {
        params.set('layers', enabled.join(','))
      } else {
        params.delete('layers')
      }
      if (visualMode !== 'DEFAULT') {
        params.set('mode', visualMode)
      } else {
        params.delete('mode')
      }
      const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
      window.history.replaceState({}, '', newUrl)
    }, 300)
    return () => { if (urlTimeoutRef.current) clearTimeout(urlTimeoutRef.current) }
  }, [activeLayers, visualMode])

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          if (data.valid) {
            setIsAuthenticated(true)
          } else {
            window.location.href = '/'
          }
        } else {
          window.location.href = '/'
        }
      } catch (err) {
        setError('Authentication check failed')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = () => {
    document.cookie = 'shadow_session=; Path=/; Max-Age=0; SameSite=Strict'
    window.location.href = '/'
  }

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--aig-void-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <RefreshCw
            className="aig-spin"
            style={{
              width: '2rem',
              height: '2rem',
              color: 'var(--aig-accent-warm)',
              margin: '0 auto 1rem',
            }}
          />
          <p
            style={{
              color: 'var(--aig-text-secondary)',
              fontSize: '0.75rem',
              letterSpacing: 'var(--aig-tracking-widest)',
            }}
          >
            VERIFYING ACCESS...
          </p>
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--aig-void-deep)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'var(--font-mono)',
        }}
      >
        <div
          className="hud-accent"
          style={{
            background: 'var(--aig-void-raised)',
            border: '1px solid var(--aig-signal-avoid)',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <AlertCircle
            style={{
              width: '2.5rem',
              height: '2.5rem',
              color: 'var(--aig-signal-avoid)',
              margin: '0 auto 1rem',
            }}
          />
          <h2
            style={{
              color: 'var(--aig-text-primary)',
              fontSize: '1rem',
              letterSpacing: 'var(--aig-tracking-widest)',
              marginBottom: '0.5rem',
            }}
          >
            ACCESS ERROR
          </h2>
          <p
            style={{
              color: 'var(--aig-text-secondary)',
              fontSize: '0.75rem',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </p>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'transparent',
              border: '1px solid var(--aig-accent-warm)',
              color: 'var(--aig-accent-warm)',
              fontSize: '0.75rem',
              letterSpacing: 'var(--aig-tracking-wider)',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: `background var(--aig-duration-fast) var(--aig-ease-out-expo)`,
            }}
            onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'var(--aig-accent-warm-glow)' }}
            onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent' }}
          >
            RETURN TO SAFETY
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  // ── Active source count ─────────────────────────────────────────────────────
  const activeSrcCount  = Object.values(health).filter(h => h.status === 'online').length
  const totalSrcCount   = Object.keys(health).length
  const activeLayerCount = Object.values(activeLayers).filter(Boolean).length

  // ── Dashboard ───────────────────────────────────────────────────────────────
  return (
    <div
      className="glass-surface"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <header
        style={{
          background: 'var(--aig-void-base)',
          borderBottom: '1px solid oklch(0.75 0.150 65 / 0.20)',
          padding: '0.5rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 'var(--z-nav)',
        }}
      >
        {/* Left: wordmark + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Amber pulse indicator */}
            <span
              className="data-breath"
              style={{
                display: 'inline-block',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'var(--aig-accent-warm)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: 'var(--aig-accent-warm)',
                fontSize: '0.8125rem',
                letterSpacing: 'var(--aig-tracking-widest)',
                fontWeight: 700,
              }}
            >
              BLACKTIVISM
            </span>
          </div>

          <span style={{ color: 'var(--aig-grid-faint)', fontSize: '0.625rem' }}>·</span>
          <span
            style={{
              color: 'var(--aig-signal-go)',
              fontSize: '0.625rem',
              letterSpacing: 'var(--aig-tracking-wider)',
            }}
          >
            SECURE
          </span>

          {/* Source health summary */}
          {totalSrcCount > 0 && (
            <>
              <span style={{ color: 'var(--aig-grid-faint)', fontSize: '0.625rem' }}>·</span>
              <span
                style={{
                  color: sourcesSummaryColor(health),
                  fontSize: '0.625rem',
                  letterSpacing: 'var(--aig-tracking-wider)',
                }}
              >
                {activeSrcCount}/{totalSrcCount} SRC
              </span>
            </>
          )}

          {/* UTC clock */}
          <span style={{ color: 'var(--aig-grid-faint)', fontSize: '0.625rem' }}>·</span>
          <span
            style={{
              color: 'var(--aig-text-tertiary)',
              fontSize: '0.625rem',
              letterSpacing: 'var(--aig-tracking-wide)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
          </span>
        </div>

        {/* Right: controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SearchBar
            onSelect={(lat, lng, name) => {
              (window as any).__shadowbrokerFlyTo?.({ lat, lng, name })
            }}
          />
          <KeyboardShortcuts
            layerIds={layerConfigs.map(l => l.id)}
            onToggleLayer={toggleLayer}
            onSetMode={setVisualMode}
            onCloseCamera={() => setActiveCamera(null)}
          />
          <VisualModeSelector currentMode={visualMode} onChange={setVisualMode} />

          <HudButton
            onClick={() => setRefreshKey(k => k + 1)}
            title="Force refresh all data"
          >
            <RotateCcw style={{ width: '0.75rem', height: '0.75rem' }} />
            <span className="hidden-sm">REFRESH</span>
          </HudButton>

          <HudButton
            onClick={() => setPanelOpen(!panelOpen)}
            title={panelOpen ? 'Hide layer panel' : 'Show layer panel'}
          >
            {panelOpen
              ? <EyeOff style={{ width: '0.75rem', height: '0.75rem' }} />
              : <Layers style={{ width: '0.75rem', height: '0.75rem' }} />
            }
            <span className="hidden-sm">{panelOpen ? 'HIDE' : 'LAYERS'}</span>
          </HudButton>

          <HudButton
            onClick={handleLogout}
            title="End session"
            danger
          >
            <LogOut style={{ width: '0.75rem', height: '0.75rem' }} />
            <span className="hidden-sm">EXIT</span>
          </HudButton>
        </div>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Layer panel */}
        {panelOpen && (
          <div style={{ flexShrink: 0, height: '100%' }}>
            <LayerPanel activeLayers={activeLayers} onToggle={toggleLayer} health={health} />
          </div>
        )}

        {/* Map area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <ShadowbrokerMap
            activeLayers={activeLayers}
            visualMode={visualMode}
            onCameraSelect={setActiveCamera}
            onToast={addToast}
            onHealthChange={setHealth}
            onStatsChange={setStats}
            refreshSignal={refreshKey}
          />

          <ToastContainer toasts={toasts} onDismiss={dismissToast} />

          {/* ── BOTTOM STATUS BAR ────────────────────────────────────────── */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'oklch(0.13 0.015 250 / 0.90)',
              borderTop: '1px solid oklch(0.75 0.150 65 / 0.15)',
              padding: '0.375rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 20,
              fontFamily: 'var(--font-mono)',
              backdropFilter: 'blur(4px)',
            }}
          >
            {/* Left: live stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto' }}>
              <StatusChip color="var(--aig-accent-warm)">
                {activeLayerCount} LAYERS
              </StatusChip>
              <Sep />
              <StatusChip color="var(--aig-text-tertiary)">
                MODE: {visualMode}
              </StatusChip>
              {activeLayers['cctv'] && (
                <><Sep /><StatusChip color="var(--aig-signal-go)">{stats.cctv ?? '—'} CAM</StatusChip></>
              )}
              {activeLayers['flights_military'] && (
                <><Sep /><StatusChip color="var(--aig-signal-avoid)">{stats.aircraft ?? '—'} MIL AIR</StatusChip></>
              )}
              {activeLayers['flights_commercial'] && (
                <><Sep /><StatusChip color="oklch(0.65 0.17 250)">{stats.commercialFlights ?? '—'} CIV AIR</StatusChip></>
              )}
              {activeLayers['ships'] && (
                <><Sep /><StatusChip color="oklch(0.72 0.17 220)">{stats.vessels ?? '—'} VESSELS</StatusChip></>
              )}
              {activeLayers['carriers'] && (
                <><Sep /><StatusChip color="var(--aig-signal-avoid)">20 CSG</StatusChip></>
              )}
              {activeLayers['conflict'] && (
                <><Sep /><StatusChip color="var(--aig-signal-conditional)">15 CONFLICTS</StatusChip></>
              )}
              {activeLayers['shodan'] && (
                <><Sep /><StatusChip color="var(--aig-accent-warm)">{stats.shodan ?? '—'} SHODAN</StatusChip></>
              )}
              {activeCamera && (
                <><Sep />
                  <StatusChip color="var(--aig-accent-warm)" bright>
                    ▶ {activeCamera.name.toUpperCase()}
                  </StatusChip>
                </>
              )}
            </div>

            {/* Right: version */}
            <span
              style={{
                color: 'var(--aig-text-tertiary)',
                fontSize: '0.625rem',
                letterSpacing: 'var(--aig-tracking-wider)',
                whiteSpace: 'nowrap',
                marginLeft: '0.5rem',
              }}
            >
              BLACKTIVISM v0.4
            </span>
          </div>
        </div>
      </div>

      {/* Responsive hide helper */}
      <style>{`
        @media (max-width: 640px) { .hidden-sm { display: none; } }
        .hidden-sm { font-size: 0.625rem; letter-spacing: 0.10em; }
      `}</style>
    </div>
  )
}

// ── Small shared primitives ───────────────────────────────────────────────────

function Sep() {
  return (
    <span style={{ color: 'var(--aig-grid-faint)', fontSize: '0.625rem', flexShrink: 0 }}>·</span>
  )
}

function StatusChip({
  children,
  color,
  bright,
}: {
  children: React.ReactNode
  color: string
  bright?: boolean
}) {
  return (
    <span
      style={{
        color,
        fontSize: '0.625rem',
        letterSpacing: 'var(--aig-tracking-wider)',
        whiteSpace: 'nowrap',
        filter: bright ? `drop-shadow(0 0 4px ${color})` : undefined,
      }}
    >
      {children}
    </span>
  )
}

function HudButton({
  children,
  onClick,
  title,
  danger,
}: {
  children: React.ReactNode
  onClick: () => void
  title?: string
  danger?: boolean
}) {
  const accent = danger ? 'var(--aig-signal-avoid)' : 'var(--aig-accent-warm)'
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        fontSize: '0.625rem',
        fontFamily: 'var(--font-mono)',
        letterSpacing: 'var(--aig-tracking-wider)',
        color: danger ? 'var(--aig-signal-avoid)' : 'var(--aig-text-secondary)',
        background: 'transparent',
        border: `1px solid ${danger ? 'oklch(0.60 0.200 25 / 0.25)' : 'oklch(0.90 0.010 250 / 0.10)'}`,
        borderRadius: 0,
        cursor: 'pointer',
        transition: `color var(--aig-duration-fast) var(--aig-ease-out-expo), border-color var(--aig-duration-fast) var(--aig-ease-out-expo)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.color = accent
        el.style.borderColor = `${accent.replace(')', ' / 0.40)').replace('var(', 'var(').slice(0, -1)} / 0.40)`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.color = danger ? 'var(--aig-signal-avoid)' : 'var(--aig-text-secondary)'
        el.style.borderColor = danger ? 'oklch(0.60 0.200 25 / 0.25)' : 'oklch(0.90 0.010 250 / 0.10)'
      }}
    >
      {children}
    </button>
  )
}
