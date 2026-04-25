'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'same-origin'
        })

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
    // Clear the cookie by calling a logout endpoint or just delete client-side
    document.cookie = 'shadow_session=; Path=/; Max-Age=0; SameSite=Strict'
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-white">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-red-500 rounded-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Return to Safety
          </button>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Security header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-500 text-sm font-mono">SECURE CONNECTION ESTABLISHED</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition text-sm"
        >
          Terminate Session
        </button>
      </div>

      {/* Main content area - Shadowbroker will be mounted here */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900 border border-green-500/30 rounded-lg p-8">
            <h1 className="text-3xl font-bold text-white mb-4">🎉 Access Granted</h1>
            <p className="text-gray-400 mb-6">
              Welcome to the protected area. The Shadowbroker OSINT platform will be integrated here.
            </p>
            <div className="bg-black/50 rounded-lg p-6 border border-gray-800">
              <h3 className="text-lg font-semibold text-green-400 mb-4">Integration Instructions:</h3>
              <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                <li>Copy the Shadowbroker frontend code from the original repository</li>
                <li>Place it in this directory or integrate it as a component</li>
                <li>Update any API endpoints to point to your backend</li>
                <li>Ensure all external API keys are configured in environment variables</li>
                <li>Test the integration thoroughly before deployment</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
