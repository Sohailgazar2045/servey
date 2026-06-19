'use client'
import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'

type Response = { question: string; answer: string; points: number }
export type Submission = {
  id: string
  surveyVersion: string
  submissionDate: string
  scoreGenerated: string
  companyName: string
  contactName: string
  user: string
  industry: string
  responses: Response[]
  score: number
  maxScore: number
  riskLevel: string
}

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    'Low Risk':      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
    'Moderate Risk': 'bg-amber-500/15   text-amber-400   border border-amber-500/25',
    'High Risk':     'bg-red-500/15     text-red-400     border border-red-500/25',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[level] ?? 'bg-slate-500/15 text-slate-400'}`}>
      {level}
    </span>
  )
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-300 text-sm tabular-nums">{score}/{max}</span>
    </div>
  )
}

export default function AdminTable({ submissions }: { submissions: Submission[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  if (submissions.length === 0) {
    return <div className="text-center py-20 text-slate-500">No submissions yet.</div>
  }

  return (
    <div className="bg-brand-navy-mid border border-white/8 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/8 text-left">
              {['Company', 'Contact', 'Industry', 'Score', 'Risk', 'Submitted'].map(h => (
                <th key={h} className="px-5 py-3.5 text-slate-400 text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => {
              const isOpen = expanded === s.id
              const isLast = i === submissions.length - 1
              return (
                <>
                  <tr
                    key={s.id}
                    className={`${!isOpen && !isLast ? 'border-b border-white/5' : ''} hover:bg-white/3 transition-colors cursor-pointer`}
                    onClick={() => toggle(s.id)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-white font-medium">{s.companyName}</p>
                      <p className="text-slate-500 text-xs">{s.user}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{s.contactName}</td>
                    <td className="px-5 py-4 text-slate-300 whitespace-nowrap">{s.industry}</td>
                    <td className="px-5 py-4">
                      <ScoreBar score={s.score} max={s.maxScore} />
                    </td>
                    <td className="px-5 py-4">
                      <RiskBadge level={s.riskLevel} />
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.submissionDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={e => { e.stopPropagation(); toggle(s.id) }}
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                        aria-label="Toggle detail"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {/* Detail panel */}
                  {isOpen && (
                    <tr key={`${s.id}-detail`} className={!isLast ? 'border-b border-white/5' : ''}>
                      <td colSpan={7} className="px-5 pb-5 pt-1">
                        <div className="bg-brand-navy rounded-lg border border-white/8 p-5">
                          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
                            Question Responses
                          </p>
                          <div className="grid gap-3">
                            {s.responses.map((r, qi) => (
                              <div key={qi} className="flex items-start gap-3">
                                <span className="text-slate-600 text-xs w-5 shrink-0 pt-0.5 tabular-nums">Q{qi + 1}</span>
                                <p className="text-slate-300 text-xs leading-relaxed flex-1 min-w-0">{r.question}</p>
                                <div className="flex items-center gap-2 shrink-0 ml-4">
                                  <span className="text-slate-300 text-xs capitalize">{r.answer}</span>
                                  <span className={`text-xs font-semibold tabular-nums w-8 text-right ${
                                    r.points === 10 ? 'text-emerald-400' : r.points === 5 ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                    +{r.points}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 pt-4 border-t border-white/8 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                            <span>ID: {s.id}</span>
                            <span>Version: v{s.surveyVersion}</span>
                            <span>Generated: {s.scoreGenerated}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
