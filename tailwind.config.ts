import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy:       '#0B1628',
          'navy-mid': '#152238',
          blue:       '#1A56DB',
          'blue-lt':  '#3F7AEB',
          sky:        '#EBF2FF',

          // ─── 2026 palette ───────────────────────────────────────────
          // First page / marketing header — Deep Navy Blue
          page:        '#163A5F',
          'page-dark': '#0F2A46',
          // Reports & Dashboards (admin)
          report:      '#1F2937',
          'report-dark':'#111827',
          // Buttons & status indicators — Teal
          teal:        '#0D9488',
          'teal-dark': '#0B7C72',
          // Off-white surface / reports background
          canvas:      '#F8FAFC',
          // Risk tiers
          low:         '#16A34A', // Low Risk / Compliant
          moderate:    '#CA8A04', // Moderate Risk
          high:        '#DC2626', // High Risk
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-grid': `
          linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'grid-48': '48px 48px',
      },
      boxShadow: {
        // Subtle, realistic elevation — restrained on purpose
        'card':       '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.04)',
        'card-hover': '0 4px 12px -2px rgb(15 23 42 / 0.08), 0 2px 4px -1px rgb(15 23 42 / 0.04)',
        'float':      '0 12px 32px -12px rgb(15 23 42 / 0.18), 0 2px 8px -2px rgb(15 23 42 / 0.06)',
      },
    },
  },
  plugins: [],
}
export default config
