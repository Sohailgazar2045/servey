'use client'
import React, { useState } from 'react'
import {
  Clock, ChevronDown, ChevronUp, ClipboardList,
  CheckCircle2, AlertTriangle, Lightbulb,
} from 'lucide-react'

type Response = { question: string; answer: string; points: number }
type Analysis = {
  strengths:       string[]
  weaknesses:      string[]
  recommendations: string[]
}
export type Submission = {
  id:             string
  surveyVersion:  string
  submissionDate: string
  scoreGenerated: string
  companyName:    string
  contactName:    string
  user:           string
  industry:       string
  responses:      Response[]
  score:          number
  maxScore:       number
  riskLevel:      string
  analysis:       Analysis | null
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: string }) {
  const styles: Record<string, string> = {
    'Low Risk':      'bg-emerald-50 text-emerald-700 border border-emerald-200',
    'Moderate Risk': 'bg-amber-50   text-amber-700   border border-amber-200',
    'High Risk':     'bg-red-50     text-red-700     border border-red-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[level] ?? 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
      {level}
    </span>
  )
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct   = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-700 text-sm tabular-nums font-medium">{score}/{max}</span>
    </div>
  )
}

function ScoreSummary({ s }: { s: Submission }) {
  const pct = Math.round((s.score / s.maxScore) * 100)
  const rc  = {
    'Low Risk':      { bar: 'bg-emerald-500', text: 'text-emerald-600' },
    'Moderate Risk': { bar: 'bg-amber-500',   text: 'text-amber-600'   },
    'High Risk':     { bar: 'bg-red-500',      text: 'text-red-600'     },
  }[s.riskLevel] ?? { bar: 'bg-slate-500', text: 'text-slate-600' }

  return (
    <div className="flex flex-wrap items-center gap-6 bg-slate-50 rounded-xl border border-slate-200 px-5 py-4">
      <div className="text-center min-w-[60px]">
        <p className={`text-3xl font-bold ${rc.text}`}>{s.score}</p>
        <p className="text-slate-500 text-xs mt-0.5">out of {s.maxScore}</p>
      </div>
      <div className="flex-1 min-w-[120px]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-slate-500 text-xs">Compliance Score</span>
          <span className={`text-xs font-bold ${rc.text}`}>{pct}%</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${rc.bar}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <RiskBadge level={s.riskLevel} />
      <div className="text-xs text-slate-500 space-y-0.5">
        <p><span className="text-slate-700 font-medium">Industry:</span> {s.industry}</p>
        <p><span className="text-slate-700 font-medium">Contact:</span> {s.contactName} · {s.user}</p>
      </div>
    </div>
  )
}

function AnalysisPanel({ analysis }: { analysis: Analysis }) {
  const sections = [
    {
      key:       'strengths',
      label:     'Strengths',
      items:     analysis.strengths,
      Icon:      CheckCircle2,
      headerCls: 'bg-emerald-50 border-b border-emerald-100',
      titleCls:  'text-emerald-700',
      iconBg:    'bg-emerald-500/10 border border-emerald-500/20',
      dotCls:    'bg-emerald-100 border border-emerald-200 text-emerald-700',
    },
    {
      key:       'weaknesses',
      label:     'Weaknesses',
      items:     analysis.weaknesses,
      Icon:      AlertTriangle,
      headerCls: 'bg-red-50 border-b border-red-100',
      titleCls:  'text-red-700',
      iconBg:    'bg-red-500/10 border border-red-500/20',
      dotCls:    'bg-red-100 border border-red-200 text-red-700',
    },
    {
      key:       'recommendations',
      label:     'Recommendations',
      items:     analysis.recommendations,
      Icon:      Lightbulb,
      headerCls: 'bg-blue-50 border-b border-blue-100',
      titleCls:  'text-blue-700',
      iconBg:    'bg-blue-500/10 border border-blue-500/20',
      dotCls:    'bg-blue-100 border border-blue-200 text-blue-700',
    },
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Lightbulb className="w-3.5 h-3.5 text-blue-600" />
        <span className="text-blue-600 text-xs font-semibold uppercase tracking-widest">AI Analysis</span>
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {sections.map(({ key, label, items, Icon, headerCls, titleCls, iconBg, dotCls }) => (
          <div key={key} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className={`flex items-center gap-2.5 px-4 py-3 ${headerCls}`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-3.5 h-3.5 ${titleCls}`} />
              </div>
              <span className={`text-xs font-semibold ${titleCls}`}>{label}</span>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              {items?.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={`w-4 h-4 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5 ${dotCls}`}>
                    {i + 1}
                  </span>
                  <p className="text-slate-700 text-[12px] leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminTable({ submissions }: { submissions: Submission[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  if (submissions.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-card p-16 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
          <ClipboardList className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-slate-900 font-semibold text-base mb-1">No submissions yet</p>
          <p className="text-slate-500 text-sm">Survey responses will appear here once submitted.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              {['Company', 'Contact', 'Industry', 'Score', 'Risk', 'Submitted'].map(h => (
                <th key={h} className="px-5 py-4 text-slate-500 text-xs font-semibold uppercase tracking-widest whitespace-nowrap">
                  {h}
                </th>
              ))}
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody>
            {submissions.map((s, i) => {
              const isOpen = expanded === s.id
              const isLast = i === submissions.length - 1

              return (
                <React.Fragment key={`row-${i}`}>
                  <tr
                    className={`${!isOpen && !isLast ? 'border-b border-slate-100' : ''} hover:bg-slate-50 transition-colors duration-150 cursor-pointer`}
                    onClick={() => toggle(s.id)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-slate-900 font-semibold">{s.companyName}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{s.user}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{s.contactName}</td>
                    <td className="px-5 py-4 text-slate-700 whitespace-nowrap">{s.industry}</td>
                    <td className="px-5 py-4"><ScoreBar score={s.score} max={s.maxScore} /></td>
                    <td className="px-5 py-4"><RiskBadge level={s.riskLevel} /></td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(s.submissionDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={e => { e.stopPropagation(); toggle(s.id) }}
                        className="text-slate-400 hover:text-blue-600 transition-colors duration-150"
                        aria-label="Toggle detail"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>

                  {isOpen && (
                    <tr className={!isLast ? 'border-b border-slate-100' : ''}>
                      <td colSpan={7} className="px-5 pb-6 pt-2">
                        <div className="space-y-3">

                          <ScoreSummary s={s} />

                          {s.analysis
                            ? <AnalysisPanel analysis={s.analysis} />
                            : (
                              <div className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4">
                                <p className="text-slate-500 text-sm">No AI analysis stored for this submission.</p>
                              </div>
                            )
                          }

                          {/* Question Responses */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-200">
                              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Question Responses</p>
                            </div>
                            <div className="divide-y divide-slate-200">
                              {s.responses.map((r, qi) => (
                                <div key={qi} className="flex items-start gap-3 px-4 py-3">
                                  <span className="text-slate-400 text-xs w-6 shrink-0 pt-0.5 tabular-nums font-medium">Q{qi + 1}</span>
                                  <p className="text-slate-700 text-xs leading-relaxed flex-1 min-w-0">{r.question}</p>
                                  <div className="flex items-center gap-2.5 shrink-0 ml-4">
                                    <span className="text-slate-700 text-xs capitalize">{r.answer}</span>
                                    <span className={`text-xs font-bold tabular-nums w-8 text-right ${
                                      r.points === 10 ? 'text-emerald-600' : r.points === 5 ? 'text-amber-600' : 'text-red-600'
                                    }`}>+{r.points}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-400 px-1">
                            <span>ID: {s.id}</span>
                            <span>v{s.surveyVersion}</span>
                            <span>{s.scoreGenerated}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
