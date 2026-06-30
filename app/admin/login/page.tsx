'use client'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Eye, EyeOff, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [show, setShow]         = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 font-sans">

      <div className="w-full max-w-sm">

        {/* Logo — matches Navbar */}
        <a href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600">
            <Shield className="w-5 h-5 text-white" strokeWidth={2.2} />
          </span>
          <span className="text-slate-900 font-semibold text-[18px] tracking-tight">
            ComplianceIQ
          </span>
        </a>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-card">

          <div className="flex items-center justify-center w-11 h-11 bg-blue-50 rounded-lg mb-6 mx-auto">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>

          <h1 className="text-slate-900 text-xl font-bold text-center mb-1">Admin Access</h1>
          <p className="text-slate-500 text-sm text-center mb-7">Enter the admin password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoFocus
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-sm rounded-lg px-4 py-3 pr-10 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                tabIndex={-1}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Verifying…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-slate-500 hover:text-slate-900 text-sm transition-colors duration-150">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  )
}
