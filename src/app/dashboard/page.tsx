'use client'

import { useEffect, useState, useCallback } from 'react'
import { AlertCircle, RefreshCw, LogOut, Layers, Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic'
import LayerPanel, { layers as layerConfigs } from '@/components/panels/LayerPanel'
import VisualModeSelector from '@/components/panels/VisualModeSelector'
import type { VisualMode } from '@/components/map/ShadowbrokerMap'
import type { CctvCamera } from '@/lib/data/cctv'

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

  // Initialize layer states
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    layerConfigs.forEach(l => { initial[l.id] = l.defaultOn })
    return initial
  })

  const toggleLayer = useCallback((id: string) => {
    setActiveLayers(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

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
          <div className="hidden md:flex items-center space-x-3">
            <span className="text-gray-600 text-[10px] font-mono">|</span>
            <span className="text-gray-500 text-[10px] font-mono">
              {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <VisualModeSelector currentMode={visualMode} onChange={setVisualMode} />
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
            <LayerPanel activeLayers={activeLayers} onToggle={toggleLayer} />
          </div>
        )}

        {/* Map */}
        <div className="flex-1 relative">
          <ShadowbrokerMap
            activeLayers={activeLayers}
            visualMode={visualMode}
            onCameraSelect={setActiveCamera}
          />

          {/* Bottom status bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-green-500/20 px-4 py-1.5 flex items-center justify-between z-20">
            <div className="flex items-center space-x-4">
              <span className="text-[10px] font-mono text-green-500/60">
                CCTV: {activeLayers['cctv'] ? 'ACTIVE' : 'OFF'}
              </span>
              <span className="text-[10px] font-mono text-gray-600">|</span>
              <span className="text-[10px] font-mono text-green-500/60">
                MODE: {visualMode}
              </span>
              {activeCamera && (
                <>
                  <span className="text-[10px] font-mono text-gray-600">|</span>
                  <span className="text-[10px] font-mono text-amber-400">
                    MONITORING: {activeCamera.name}
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] font-mono text-gray-600">
              SHADOWBROKER OSINT
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
