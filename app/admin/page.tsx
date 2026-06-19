import { list } from '@vercel/blob'
import { promises as fs } from 'fs'
import path from 'path'
import { Shield, Users, BarChart2, AlertTriangle, CheckCircle } from 'lucide-react'
import AdminTable, { type Submission } from './AdminTable'
import LogoutButton from './LogoutButton'

export const dynamic = 'force-dynamic'

const BLOB_KEY  = 'audit-log.json'
const LOCAL_LOG = path.join(process.cwd(), 'audit-log.json')

async function getSubmissions(): Promise<Submission[]> {
  try {
    let data: Submission[]
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { blobs } = await list({ prefix: BLOB_KEY })
      if (!blobs.length) return []
      const res = await fetch(blobs[0].downloadUrl, { cache: 'no-store' })
      data = await res.json()
    } else {
      const raw = await fs.readFile(LOCAL_LOG, 'utf8')
      data = JSON.parse(raw)
    }
    return data.slice().reverse()
  } catch {
    return []
  }
}

export default async function AdminPage() {
  const submissions = await getSubmissions()

  const total    = submissions.length
  const avg      = total ? Math.round(submissions.reduce((s, x) => s + x.score, 0) / total) : 0
  const low      = submissions.filter(s => s.riskLevel === 'Low Risk').length
  const moderate = submissions.filter(s => s.riskLevel === 'Moderate Risk').length
  const high     = submissions.filter(s => s.riskLevel === 'High Risk').length

  const stats = [
    { label: 'Total Submissions', value: total,                Icon: Users,         color: 'text-blue-400',    bg: 'bg-blue-500/10'    },
    { label: 'Average Score',     value: `${avg} / 80`,        Icon: BarChart2,     color: 'text-purple-400',  bg: 'bg-purple-500/10'  },
    { label: 'Low / Moderate',    value: `${low} / ${moderate}`, Icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'High Risk',         value: high,                 Icon: AlertTriangle, color: 'text-red-400',     bg: 'bg-red-500/10'     },
  ]

  return (
    <div className="min-h-screen bg-brand-navy font-sans">

      {/* Header */}
      <header className="border-b border-white/8 bg-brand-navy-mid/60 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-white font-semibold text-[15px] tracking-tight">ComplianceIQ</span>
            <span className="text-white/20 mx-1.5">·</span>
            <span className="text-slate-400 text-sm">Admin</span>
          </div>
          <div className="flex items-center gap-5">
            <a href="/" className="text-slate-400 hover:text-white text-sm transition-colors">
              ← Back to site
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">Survey Submissions</h1>
          <p className="text-slate-400 text-sm mt-1">All responses recorded in the audit log</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="bg-brand-navy-mid border border-white/8 rounded-xl p-5">
              <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-[18px] h-[18px] ${color}`} />
              </div>
              <p className="text-slate-400 text-xs mb-1">{label}</p>
              <p className="text-white text-xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <AdminTable submissions={submissions} />
      </div>
    </div>
  )
}
