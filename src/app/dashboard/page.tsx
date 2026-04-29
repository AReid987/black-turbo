'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AlertCircle, RefreshCw, LogOut, Layers, Eye, EyeOff, RotateCcw } from 'lucide-react'
import SearchBar from '@/components/panels/SearchBar'
import KeyboardShortcuts from '@/components/panels/KeyboardShortcuts'
import dynamic from 'next/dynamic'
import LayerPanel, { layers as layerConfigs } from '@/components/panels/LayerPanel'
import VisualModeSelector from '@/components/panels/VisualModeSelector'
import type { VisualMode, HealthMap, LayerStats } from '@/components/map/ShadowbrokerMap'
import type { CctvCamera } from '@/lib/data/cctv'
import ToastContainer, { useToasts } from '@/components/ui/Toast'

// Dynamic import to avoid SSR issues with MapLibre
const ShadowbrokerMap = dynamic(() => import('@/components/map/ShadowbrokerMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black">
      <div className="text-green-500 font-mono text-sm animate-pulse">LOADING TACTICAL DISPLAY...</div>
    </div>
  ),
})

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [panelOpen, setPanelOpen] = useState(true)
  const [visualMode, setVisualMode] = useState<VisualMode>('DEFAULT')
  const [activeCamera, setActiveCamera] = useState<CctvCamera | null>(null)
  const [health, setHealth] = useState<HealthMap>({})
  const [stats, setStats] = useState<LayerStats>({})
  const [refreshKey, setRefreshKey] = useState(0)
  const { toasts, addToast, dismissToast } = useToasts()

  // Initialize layer states from URL or defaults
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    layerConfigs.forEach(l => { initial[l.id] = l.defaultOn })
    // Override from URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const layersParam = params.get('layers')
      if (layersParam) {
        const enabled = new Set(layersParam.split(','))
        layerConfigs.forEach(l => { initial[l.id] = enabled.has(l.id) })
      }
      const modeParam = params.get('mode') as VisualMode | null
      if (modeParam && ['DEFAULT', 'SATELLITE', 'FLIR', 'NVG', 'CRT'].includes(modeParam)) {
        // We'll set this in an effect since state initializer can't reference other state
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

  // Persist state to URL (debounced)
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
    return () => {
      if (urlTimeoutRef.current) clearTimeout(urlTimeoutRef.current)
    }
  }, [activeLayers, visualMode])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-white font-mono">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2 font-mono">Access Error</h2>
          <p className="text-gray-400 mb-4 font-mono text-sm">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-mono text-sm"
          >
            Return to Safety
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="bg-black border-b border-green-500/30 px-4 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-500 text-xs font-mono tracking-wider">SECURE CONNECTION</span>
          </div>
          {/* Data source health summary */}
          {Object.keys(health).length > 0 && (
            <div className="hidden md:flex items-center space-x-2">
              <span className="text-gray-600 text-[10px] font-mono">|</span>
              {Object.values(health).some(h => h.status === 'offline') ? (
                <span className="text-red-400 text-[10px] font-mono">
                  {Object.values(health).filter(h => h.status === 'online').length}/{Object.keys(health).length} SOURCES
                </span>
              ) : Object.values(health).some(h => h.status === 'degraded') ? (
                <span className="text-amber-400 text-[10px] font-mono">
                  {Object.values(health).filter(h => h.status === 'online').length}/{Object.keys(health).length} SOURCES
                </span>
              ) : (
                <span className="text-green-400 text-[10px] font-mono">
                  {Object.keys(health).length} SOURCES ONLINE
                </span>
              )}
            </div>
          )}
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-gray-600 text-[10px] font-mono">|</span>
            <span className="text-gray-500 text-[10px] font-mono">
              {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <SearchBar onSelect={(lat, lng, name) => {
            (window as any).__shadowbrokerFlyTo?.({ lat, lng, name });
          }} />
          <KeyboardShortcuts
            layerIds={layerConfigs.map(l => l.id)}
            onToggleLayer={toggleLayer}
            onSetMode={setVisualMode}
            onCloseCamera={() => setActiveCamera(null)}
          />
          <VisualModeSelector currentMode={visualMode} onChange={setVisualMode} />
          <button
            onClick={() => setRefreshKey(k => k + 1)}
            className="flex items-center space-x-1 px-2 py-1.5 text-[10px] font-mono text-gray-400 hover:text-green-400 transition-colors border border-gray-800 hover:border-green-500/30 rounded"
            title="Force refresh all data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="flex items-center space-x-1 px-2 py-1.5 text-[10px] font-mono text-gray-400 hover:text-green-400 transition-colors border border-gray-800 hover:border-green-500/30 rounded"
          >
            {panelOpen ? <EyeOff className="w-3 h-3" /> : <Layers className="w-3 h-3" />}
            <span className="hidden sm:inline">{panelOpen ? 'Hide' : 'Layers'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 px-2 py-1.5 text-[10px] font-mono text-red-400 hover:text-red-300 transition-colors border border-red-900/30 hover:border-red-500/30 rounded"
          >
            <LogOut className="w-3 h-3" />
            <span className="hidden sm:inline">EXIT</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Layer panel */}
        {panelOpen && (
          <div className="flex-shrink-0 h-full">
            <LayerPanel activeLayers={activeLayers} onToggle={toggleLayer} health={health} />
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
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

          {/* Bottom status bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-green-500/20 px-4 py-1.5 flex items-center justify-between z-20">
            <div className="flex items-center space-x-3 overflow-x-auto">
              <span className="text-[10px] font-mono text-green-500/60 whitespace-nowrap">
                {Object.values(activeLayers).filter(Boolean).length} LAYERS ACTIVE
              </span>
              <span className="text-[10px] font-mono text-gray-600">|</span>
              <span className="text-[10px] font-mono text-green-500/60 whitespace-nowrap">
                MODE: {visualMode}
              </span>
              {activeLayers['cctv'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-green-400/80 whitespace-nowrap">{stats.cctv ?? '—'} CAMERAS</span>
                </>
              )}
              {activeLayers['flights_military'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-red-400/80 whitespace-nowrap">{stats.aircraft ?? '—'} MIL AIR</span>
                </>
              )}
              {activeLayers['flights_commercial'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-blue-400/80 whitespace-nowrap">{stats.commercialFlights ?? '—'} CIV AIR</span>
                </>
              )}
              {activeLayers['ships'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-cyan-400/80 whitespace-nowrap">{stats.vessels ?? '—'} VESSELS</span>
                </>
              )}
              {activeLayers['carriers'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-red-400/80 whitespace-nowrap">20 CSG</span>
                </>
              )}
              {activeLayers['conflict'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-orange-400/80 whitespace-nowrap">15 CONFLICTS</span>
                </>
              )}
              {activeLayers['shodan'] && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-amber-400/80 whitespace-nowrap">{stats.shodan ?? '—'} SHODAN</span>
                </>
              )}
              {activeCamera && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-amber-400 whitespace-nowrap">
                    MONITORING: {activeCamera.name.toUpperCase()}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-600 whitespace-nowrap ml-2">
              SHADOWBROKER v0.4
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
