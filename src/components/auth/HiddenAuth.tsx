'use client'

import { useState, useEffect } from 'react'
import { X, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { checkRateLimit, recordAttempt } from '@/lib/auth'

interface HiddenAuthProps {
  onClose: () => void
}

export default function HiddenAuth({ onClose }: HiddenAuthProps) {
  const [key, setKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)

  useEffect(() => {
    // Lock after 5 failed attempts
    if (attempts >= 5) {
      setIsLocked(true)
      const timer = setTimeout(() => {
        setIsLocked(false)
        setAttempts(0)
      }, 15 * 60 * 1000) // 15 minutes lockout
      return () => clearTimeout(timer)
    }
  }, [attempts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Client-side pre-check (helps UX before hitting the server)
    const rateLimit = checkRateLimit()
    if (!rateLimit.allowed) {
      setIsLocked(true)
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key })
      })

      const data = await res.json()

      if (res.ok && data.success) {
        // Cookie is set by the API response; middleware will see it.
        window.location.href = '/dashboard'
      } else {
        recordAttempt()
        setAttempts(prev => prev + 1)
        setError(data.error || 'Invalid key. Access denied.')
      }
    } catch (err) {
      setError('Authentication error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 border border-red-500 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Temporarily Locked</h2>
          <p className="text-gray-400 mb-4">
            Too many failed attempts. Access has been temporarily locked for security reasons.
          </p>
          <p className="text-sm text-gray-500">
            Please wait 15 minutes before trying again, or contact the administrator if you believe this is an error.
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Return to Safety
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Secure Access</h2>
          <p className="text-gray-400 text-sm">Enter your access key to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="access-key" className="block text-sm font-medium text-gray-300 mb-2">
              Access Key
            </label>
            <div className="relative">
              <input
                id="access-key"
                type={showKey ? 'text' : 'password'}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                placeholder="Enter your key"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !key.trim()}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Access Dashboard'}
          </button>
        </form>

        {/* Security notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 This connection is secure. Your key is validated server-side.
          </p>
        </div>
      </div>
    </div>
  )
}
