import { Shield } from 'lucide-react'

const LINKS = [
  { label: 'Assessment',    href: '#assessment'   },
  { label: 'How It Works',  href: '#how-it-works' },
  { label: 'Industries',    href: '#industries'   },
  { label: 'Privacy Policy', href: '#'            },
]

export default function Footer() {
  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* logo */}
          <a href="/" className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-slate-900 font-semibold text-[17px] tracking-tight">
              ComplianceIQ
            </span>
          </a>

          {/* links */}
          <nav className="flex flex-wrap gap-6">
            {LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-slate-500 hover:text-slate-900 text-sm transition-colors duration-150"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* copyright */}
          <p className="text-slate-500 text-sm">
            © 2026 ComplianceIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
