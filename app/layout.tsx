import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const title = 'FCC Compliance Readiness Assessment | ComplianceIQ'
const description =
  'Assess your FCC compliance posture in under 3 minutes. Get an instant score, risk rating, and AI-powered recommendations tailored to your industry.'

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s | ComplianceIQ',
  },
  description,
  applicationName: 'ComplianceIQ',
  keywords: ['FCC compliance', 'compliance assessment', 'risk rating', 'audit readiness', 'regulatory'],
  openGraph: {
    title,
    description,
    siteName: 'ComplianceIQ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white">{children}</body>
    </html>
  )
}
