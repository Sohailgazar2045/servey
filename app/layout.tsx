import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const title = 'FCC Compliance Readiness Assessment | AethyrLex'
const description =
  'Assess your FCC compliance posture in under 3 minutes. Scored against the AethyrLex 80-point framework, with an instant risk rating and prioritized recommendations tailored to your industry.'

export const metadata: Metadata = {
  title: {
    default: title,
    template: '%s | AethyrLex',
  },
  description,
  applicationName: 'ComplianceIQ',
  keywords: ['FCC compliance', 'compliance assessment', 'risk rating', 'audit readiness', 'regulatory'],
  openGraph: {
    title,
    description,
    siteName: 'AethyrLex',
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
