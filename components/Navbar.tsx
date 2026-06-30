'use client'
import { useState, useEffect } from 'react'
import { Shield } from 'lucide-react'

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Industries',   href: '#industries'   },
  { label: 'Features',     href: '#features'     },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg shadow-slate-900/5 border-b border-slate-200'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group">
          <Shield className="w-5 h-5 text-blue-600 group-hover:text-blue-500 transition-colors" />
          <span className="text-slate-900 font-semibold text-[17px] tracking-tight">
            ComplianceIQ
          </span>
        </a>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#assessment"
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-150"
        >
          Start Survey
        </a>
      </div>
    </header>
  )
}
