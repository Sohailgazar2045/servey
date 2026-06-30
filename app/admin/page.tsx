import { Suspense } from 'react'
import { Shield, Users, BarChart2, AlertTriangle, CheckCircle, BarChart3, Building2, Lightbulb } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AdminTable, { type Submission } from './AdminTable'
import LogoutButton from './LogoutButton'
import AIInsights from './AIInsights'

export const dynamic = 'force-dynamic'

const QUESTIONS_SHORT = [
  'Written procedures',
  'FCC deadline tracking',
  'Assigned personnel',
  'Annual review',
  'Centralized documents',
  '48-hour audit readiness',
  'Documented communications',
  'Corrective action process',
]

async function getSubmissions(): Promise<Submission[]> {
  const { data, error, count } = await supabase
    .from('survey_submissions')
    .select('*', { count: 'exact' })
    .order('submission_date', { ascending: false })

  if (error) {
    console.error('Supabase fetch error:', error.message, error.details, error.hint)
    return []
  }

  console.log(`Supabase returned ${data?.length ?? 0} rows (count: ${count})`)

  return (data ?? []).map(row => ({
    id:             row.id,
    surveyVersion:  row.survey_version,
    submissionDate: row.submission_date,
    scoreGenerated: row.score_generated,
    companyName:    row.company_name,
    contactName:    row.contact_name,
    user:           row.email,
    industry:       row.industry,
    responses:      row.responses,
    score:          row.score,
    maxScore:       row.max_score,
    riskLevel:      row.risk_level,
    analysis:       row.analysis ?? null,
  }))
}

function AIInsightsSkeleton() {
  return (
    <div className="space-y-4 mb-8 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-7 w-36 bg-slate-200 rounded-full" />
        <div className="h-4 w-48 bg-slate-200 rounded" />
      </div>
      <div className="bg-white border border-slate-200 rounded-xl p-6 h-20" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl h-48" />
        <div className="bg-white border border-slate-200 rounded-xl h-48" />
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const submissions = await getSubmissions()

  const total    = submissions.length
  const avg      = total ? Math.round(submissions.reduce((s, x) => s + x.score, 0) / total) : 0
  const low      = submissions.filter(s => s.riskLevel === 'Low Risk').length
  const moderate = submissions.filter(s => s.riskLevel === 'Moderate Risk').length
  const high     = submissions.filter(s => s.riskLevel === 'High Risk').length

  // Question performance
  const questionStats = QUESTIONS_SHORT.map((label, i) => {
    if (!total) return { label, passPct: 0, partialPct: 0, failPct: 0 }
    const responses = submissions.map(s => s.responses?.[i]).filter(Boolean)
    const pass    = responses.filter(r => r.points === 10).length
    const partial = responses.filter(r => r.points === 5).length
    const fail    = responses.filter(r => r.points === 0).length
    return {
      label,
      passPct:    Math.round((pass    / total) * 100),
      partialPct: Math.round((partial / total) * 100),
      failPct:    Math.round((fail    / total) * 100),
    }
  })

  // Industry breakdown
  const industryMap: Record<string, { count: number; scoreTotal: number }> = {}
  submissions.forEach(s => {
    if (!industryMap[s.industry]) industryMap[s.industry] = { count: 0, scoreTotal: 0 }
    industryMap[s.industry].count++
    industryMap[s.industry].scoreTotal += s.score
  })
  const industries = Object.entries(industryMap)
    .map(([name, d]) => ({ name, count: d.count, avg: Math.round(d.scoreTotal / d.count) }))
    .sort((a, b) => b.avg - a.avg)

  const stats = [
    { label: 'Total Submissions', value: total,                  Icon: Users,         color: 'text-blue-600',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20'    },
    { label: 'Average Score',     value: `${avg} / 80`,          Icon: BarChart2,     color: 'text-purple-600',  bg: 'bg-purple-500/10',  border: 'border-purple-500/20'  },
    { label: 'Low / Moderate',    value: `${low} / ${moderate}`, Icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'High Risk',         value: high,                   Icon: AlertTriangle, color: 'text-red-600',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600">
              <Shield className="w-[18px] h-[18px] text-white" strokeWidth={2.2} />
            </span>
            <span className="text-slate-900 font-semibold text-[17px] tracking-tight">
              ComplianceIQ
            </span>
            <span className="hidden sm:inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 ml-1">
              Admin
            </span>
          </a>
          <div className="flex items-center gap-5">
            <a href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors duration-150">← Back to site</a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="relative max-w-7xl mx-auto px-6 py-12">

        {/* Page title */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold mb-3">
            <span className="w-6 h-px bg-blue-600" />
            Dashboard
          </div>
          <h1 className="text-slate-900 text-3xl font-bold tracking-tight">
            Survey Submissions
          </h1>
          <p className="text-slate-500 text-sm mt-2">Live data from Supabase · refreshed on load</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, Icon, color, bg, border }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className={`w-9 h-9 ${bg} border ${border} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className={`w-[18px] h-[18px] ${color}`} />
              </div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1.5">{label}</p>
              <p className="text-slate-900 text-2xl font-bold">{value}</p>
            </div>
          ))}
        </div>

        {/* AI Dashboard Insights — streamed, one-time call using aggregate data */}
        {total > 0 && (
          <Suspense fallback={<AIInsightsSkeleton />}>
            <AIInsights submissions={submissions} />
          </Suspense>
        )}

        {/* Analytics */}
        {total > 0 && (
          <div className="grid md:grid-cols-2 gap-4 mb-8">

            {/* Question Performance */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200">
                <div className="w-7 h-7 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-semibold">Question Performance</p>
                  <p className="text-slate-500 text-xs">Pass / Partial / Fail across all submissions</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3.5">
                {questionStats.map(({ label, passPct, partialPct, failPct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-slate-700 text-xs">{label}</span>
                      <span className="text-slate-500 text-xs tabular-nums">{passPct}% pass</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${passPct}%` }} />
                      <div className="h-full bg-amber-500"   style={{ width: `${partialPct}%` }} />
                      <div className="h-full bg-red-500"     style={{ width: `${failPct}%` }} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-1">
                  {[['bg-emerald-500','Pass'],['bg-amber-500','Partial'],['bg-red-500','Fail']].map(([bg, lbl]) => (
                    <div key={lbl} className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${bg}`} />
                      <span className="text-slate-600 text-xs">{lbl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Industry Breakdown */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200">
                <div className="w-7 h-7 bg-sky-500/10 border border-sky-500/20 rounded-lg flex items-center justify-center">
                  <Building2 className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-semibold">Industry Breakdown</p>
                  <p className="text-slate-500 text-xs">Average score by sector</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-3">
                {industries.length === 0 ? (
                  <p className="text-slate-500 text-sm">No data yet.</p>
                ) : industries.map(({ name, count, avg: iAvg }) => {
                  const pct   = Math.round((iAvg / 80) * 100)
                  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  const text  = pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 text-xs font-medium">{name}</span>
                          <span className="text-slate-400 text-xs">{count} org{count !== 1 ? 's' : ''}</span>
                        </div>
                        <span className={`text-xs font-bold tabular-nums ${text}`}>{iAvg}/80</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Submissions table */}
        {total > 0 && (
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold uppercase tracking-widest">
              <Lightbulb className="w-3.5 h-3.5" />
              All Submissions
            </div>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        )}

        <AdminTable submissions={submissions} />
      </div>
    </div>
  )
}
