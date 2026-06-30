import { Shield, Mail } from 'lucide-react'

const PRODUCT_LINKS = [
  { label: 'How It Works',    href: '#how-it-works' },
  { label: 'Features',        href: '#features'     },
  { label: 'Industries',      href: '#industries'   },
  { label: 'Take the Survey', href: '#assessment'   },
]

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">

        {/* top — brand · product · contact */}
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1.2fr]">

          {/* brand */}
          <div className="max-w-xs">
            <a href="/" className="flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
                <Shield className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
              </span>
              <span className="text-slate-900 font-semibold text-[17px] tracking-tight">
                ComplianceIQ
              </span>
            </a>
            <p className="text-slate-500 text-sm leading-relaxed">
              Instant FCC compliance assessment — score, risk rating, and AI-powered
              recommendations in under three minutes.
            </p>
          </div>

          {/* product */}
          <nav>
            <h3 className="text-slate-900 text-xs font-semibold uppercase tracking-widest mb-4">
              Product
            </h3>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-slate-500 hover:text-blue-600 text-sm transition-colors duration-150"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* contact */}
          <div>
            <h3 className="text-slate-900 text-xs font-semibold uppercase tracking-widest mb-4">
              Contact
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-3">
              Questions about an assessment, or a compliance concern to report?
            </p>
            <a
              href="mailto:compliance@aethyrlex.com"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Mail className="w-4 h-4" />
              compliance@aethyrlex.com
            </a>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-400 text-sm">
            © 2026 ComplianceIQ. All rights reserved.
          </p>
          <p className="text-slate-400 text-xs">
            Informational tool only — does not constitute legal advice.
          </p>
        </div>
      </div>
    </footer>
  )
}
