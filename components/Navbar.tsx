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
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-brand-page border-b border-white/10 transition-shadow duration-200 ${
        scrolled ? 'shadow-lg shadow-black/20' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10">
            <Shield className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
          </span>
          <span className="text-white font-semibold text-[17px] tracking-tight">
            ComplianceIQ
          </span>
        </a>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-white/75 hover:text-white transition-colors"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <a
          href="#assessment"
          className="bg-brand-teal hover:bg-brand-teal-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          Start Survey
        </a>
      </div>
    </header>
  )
}
