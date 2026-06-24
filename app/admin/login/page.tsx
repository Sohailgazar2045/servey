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
    <div className="min-h-screen bg-brand-navy hero-grid flex items-center justify-center px-4 font-sans">

      {/* Radial glows */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo — matches Navbar */}
        <a href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <Shield className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
          <span className="text-white font-semibold text-[17px] tracking-tight">ComplianceIQ</span>
        </a>

        {/* Card */}
        <div className="bg-brand-navy-mid border border-white/8 rounded-2xl p-8 shadow-2xl shadow-black/40">

          <div className="flex items-center justify-center w-11 h-11 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6 mx-auto">
            <Lock className="w-5 h-5 text-blue-400" />
          </div>

          <h1 className="text-white text-xl font-bold text-center mb-1">Admin Access</h1>
          <p className="text-slate-400 text-sm text-center mb-7">Enter the admin password to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoFocus
                className="w-full bg-brand-navy border border-white/10 text-white placeholder-slate-600 text-sm rounded-lg px-4 py-3 pr-10 outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                tabIndex={-1}
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold py-3 rounded-lg transition-colors duration-150"
            >
              {loading ? 'Verifying…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors duration-150">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  )
}
