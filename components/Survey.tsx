'use client'

import { useState, useEffect, useRef } from 'react'
import {
  CheckCircle2, XCircle, AlertCircle,
  Download, RotateCcw, ArrowRight, ChevronDown, Info,
} from 'lucide-react'
import type { PDFData } from '@/lib/generatePDF'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  companyName: string
  contactName: string
  email:       string
  industry:    string
}

interface ResultPayload {
  score:     number
  maxScore:  number
  riskLevel: string
  riskBadge: 'low' | 'moderate' | 'high'
  riskColor: string
  analysis: {
    strengths:       string[]
    weaknesses:      string[]
    recommendations: string[]
  }
  auditRecord: {
    submissionDate: string
    surveyVersion:  string
    scoreGenerated: string
    responses: { question: string; answer: string; points: number }[]
  }
}

// ─── Survey data ──────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    text: 'Does your organization maintain written compliance procedures?',
    options: [
      { value: 'yes',       label: 'Yes',       variant: 'yes'     },
      { value: 'partially', label: 'Partially',  variant: 'partial' },
      { value: 'no',        label: 'No',         variant: 'no'      },
    ],
  },
  {
    text: 'Do you track FCC filing deadlines?',
    options: [
      { value: 'yes',      label: 'Yes',      variant: 'yes'     },
      { value: 'somewhat', label: 'Somewhat', variant: 'partial' },
      { value: 'no',       label: 'No',       variant: 'no'      },
    ],
  },
  {
    text: 'Are compliance responsibilities assigned to specific personnel?',
    options: [
      { value: 'yes',       label: 'Yes',       variant: 'yes'     },
      { value: 'partially', label: 'Partially',  variant: 'partial' },
      { value: 'no',        label: 'No',         variant: 'no'      },
    ],
  },
  {
    text: 'Have you conducted an FCC compliance review within the last 12 months?',
    options: [
      { value: 'yes', label: 'Yes', variant: 'yes' },
      { value: 'no',  label: 'No',  variant: 'no'  },
    ],
  },
  {
    text: 'Are compliance documents stored in a centralized system?',
    options: [
      { value: 'yes',       label: 'Yes',       variant: 'yes'     },
      { value: 'partially', label: 'Partially',  variant: 'partial' },
      { value: 'no',        label: 'No',         variant: 'no'      },
    ],
  },
  {
    text: 'Can you produce documentation during an audit within 48 hours?',
    options: [
      { value: 'yes',    label: 'Yes',    variant: 'yes'     },
      { value: 'unsure', label: 'Unsure', variant: 'partial' },
      { value: 'no',     label: 'No',     variant: 'no'      },
    ],
  },
  {
    text: 'Are compliance-related communications documented?',
    options: [
      { value: 'yes',       label: 'Yes',       variant: 'yes'     },
      { value: 'sometimes', label: 'Sometimes',  variant: 'partial' },
      { value: 'no',        label: 'No',         variant: 'no'      },
    ],
  },
  {
    text: 'Do you have a process for tracking corrective actions?',
    options: [
      { value: 'yes', label: 'Yes', variant: 'yes' },
      { value: 'no',  label: 'No',  variant: 'no'  },
    ],
  },
]

const INDUSTRIES = [
  'Broadcaster', 'Manufacturer', 'Telecom Provider',
  'Consultant', 'Law Firm', 'Other',
]

const LOADING_STEPS = [
  'Calculating your compliance score…',
  'Analyzing response patterns…',
  'Generating AI recommendations…',
  'Preparing your report…',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionButton({
  variant, label, selected, onClick,
}: {
  variant: string
  label:   string
  selected: boolean
  onClick:  () => void
}) {
  const base = 'flex-1 py-2.5 px-3 rounded-lg border font-semibold text-sm transition-colors cursor-pointer text-center select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'

  let cls = base
  if (!selected) {
    cls += ' bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-blue-400'
  } else if (variant === 'yes') {
    cls += ' bg-emerald-600 border-emerald-600 text-white focus-visible:ring-emerald-400'
  } else if (variant === 'partial') {
    cls += ' bg-amber-500 border-amber-500 text-white focus-visible:ring-amber-400'
  } else {
    cls += ' bg-red-500 border-red-500 text-white focus-visible:ring-red-400'
  }

  return (
    <button type="button" className={cls} onClick={onClick}>
      {label}
    </button>
  )
}

function ScoreCircle({ score, maxScore, riskBadge }: {
  score:    number
  maxScore: number
  riskBadge: string
}) {
  const r             = 56
  const circumference = 2 * Math.PI * r
  const fill          = (score / maxScore) * circumference
  const color =
    riskBadge === 'low'      ? '#10B981' :
    riskBadge === 'moderate' ? '#F59E0B' :
                               '#EF4444'

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - fill}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
        <span className="text-[32px] font-bold text-slate-900 leading-none">{score}</span>
        <span className="text-xs text-slate-400 font-medium">/ {maxScore}</span>
      </div>
    </div>
  )
}

function AnalysisCard({
  variant, items,
}: {
  variant: 'strength' | 'weakness' | 'recommendation'
  items:   string[]
}) {
  const map = {
    strength:       { label: 'Strengths',       Icon: CheckCircle2, dot: 'bg-emerald-500', border: 'border-emerald-200', header: 'bg-emerald-50',  title: 'text-emerald-800' },
    weakness:       { label: 'Weaknesses',       Icon: XCircle,      dot: 'bg-red-500',     border: 'border-red-200',     header: 'bg-red-50',      title: 'text-red-800'     },
    recommendation: { label: 'Recommendations',  Icon: AlertCircle,  dot: 'bg-blue-500',    border: 'border-blue-200',    header: 'bg-blue-50',     title: 'text-blue-800'    },
  }
  const { label, Icon, dot, border, header, title } = map[variant]

  return (
    <div className={`rounded-2xl border ${border} shadow-card overflow-hidden`}>
      <div className={`${header} px-5 py-3.5 flex items-center gap-2.5`}>
        <Icon className={`w-4 h-4 ${dot.replace('bg-', 'text-')}`} />
        <span className={`font-bold text-sm ${title}`}>{label}</span>
      </div>
      <div className="bg-white px-5 py-5 space-y-3.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className={`w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0 ${dot}`} />
            <p className="text-slate-700 text-[14px] leading-relaxed">{item}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Survey() {
  const [form, setForm] = useState<FormState>({
    companyName: '', contactName: '', email: '', industry: '',
  })
  const [answers,    setAnswers]    = useState<Record<number, string>>({})
  const [view,       setView]       = useState<'form' | 'loading' | 'results' | 'error'>('form')
  const [loadingMsg, setLoadingMsg] = useState(LOADING_STEPS[0])
  const [result,     setResult]     = useState<ResultPayload | null>(null)
  const [errors,     setErrors]     = useState<Record<string, string>>({})
  const [agreed,     setAgreed]     = useState(false)
  const [serverErr,  setServerErr]  = useState('')
  const [pdfErr,     setPdfErr]     = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)
  const resultsRef = useRef<HTMLDivElement>(null)

  const answeredCount = Object.keys(answers).length

  // Cycle loading messages
  useEffect(() => {
    if (view !== 'loading') return
    let idx = 1
    const id = setInterval(() => {
      setLoadingMsg(LOADING_STEPS[idx % LOADING_STEPS.length])
      idx++
    }, 1800)
    return () => clearInterval(id)
  }, [view])

  // Scroll to results
  useEffect(() => {
    if (view === 'results') {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [view])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.companyName.trim()) e.companyName = 'Required'
    if (!form.contactName.trim()) e.contactName = 'Required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email'
    if (!form.industry) e.industry = 'Select an industry'
    if (answeredCount < 8)
      e.answers = `${8 - answeredCount} question${8 - answeredCount !== 1 ? 's' : ''} still unanswered`
    if (!agreed)
      e.agreed = 'Please confirm the acknowledgment above to continue'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})

    const answersArray = QUESTIONS.map((_, i) => answers[i] ?? '')
    setView('loading')

    try {
      const res  = await fetch('/api/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, answers: answersArray }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Submission failed')
      setResult(data)
      setView('results')
    } catch (err) {
      setServerErr(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setView('error')
    }
  }

  async function handleDownloadPDF() {
    if (!result) return
    setPdfErr('')
    setPdfLoading(true)
    try {
      const { generatePDF } = await import('@/lib/generatePDF')
      const payload: PDFData = { ...form, ...result }
      await generatePDF(payload)
    } catch (err) {
      setPdfErr(err instanceof Error ? err.message : 'Failed to generate PDF')
    } finally {
      setPdfLoading(false)
    }
  }

  function handleReset() {
    setForm({ companyName: '', contactName: '', email: '', industry: '' })
    setAnswers({})
    setResult(null)
    setErrors({})
    setAgreed(false)
    setServerErr('')
    setView('form')
  }

  // ── Loading ────────────────────────────────────────────────────────────────

  if (view === 'loading') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-16 flex flex-col items-center text-center gap-6 min-h-[320px] justify-center">
        <div className="w-14 h-14 rounded-full border-[3px] border-slate-100 border-t-blue-600 animate-spin" />
        <div>
          <p className="text-slate-900 font-semibold text-lg mb-1.5">{loadingMsg}</p>
          <p className="text-slate-400 text-sm">Usually takes 10–20 seconds</p>
        </div>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────

  if (view === 'error') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-14 flex flex-col items-center text-center gap-5">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <p className="text-slate-900 font-bold text-lg mb-2">Something went wrong</p>
          <p className="text-slate-500 text-sm max-w-sm">{serverErr}</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    )
  }

  // ── Results ────────────────────────────────────────────────────────────────

  if (view === 'results' && result) {
    const riskStyle = {
      low:      { pill: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
      moderate: { pill: 'bg-amber-100   text-amber-700   border-amber-200',   dot: 'bg-amber-500'   },
      high:     { pill: 'bg-red-100     text-red-700     border-red-200',      dot: 'bg-red-500'     },
    }[result.riskBadge] ?? { pill: '', dot: '' }

    const date    = new Date(result.auditRecord.submissionDate)
    const dateStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
      <div ref={resultsRef} className="space-y-4 scroll-mt-24">

        {/* Score header */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-8">
          <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
            <ScoreCircle score={result.score} maxScore={result.maxScore} riskBadge={result.riskBadge} />
            <div className="flex-1 min-w-0">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold mb-3 ${riskStyle.pill}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${riskStyle.dot}`} />
                {result.riskLevel}
              </div>
              <h3 className="text-slate-900 text-2xl font-bold tracking-tight mb-1 truncate">
                {form.companyName}
              </h3>
              <p className="text-slate-500 text-sm">
                {form.industry} · {dateStr}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Scored {result.score} of {result.maxScore} points ({Math.round((result.score / result.maxScore) * 100)}%)
              </p>
            </div>
          </div>
        </div>

        {/* AI analysis */}
        <AnalysisCard variant="strength"       items={result.analysis.strengths}       />
        <AnalysisCard variant="weakness"       items={result.analysis.weaknesses}      />
        <AnalysisCard variant="recommendation" items={result.analysis.recommendations} />

        {/* Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3.5 px-6 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              {pdfLoading ? 'Generating…' : 'Download PDF Report'}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold py-3.5 px-5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors duration-150"
            >
              <RotateCcw className="w-4 h-4" />
              New Survey
            </button>
          </div>
          {pdfErr && (
            <p className="mt-3 text-red-500 text-sm text-center">{pdfErr}</p>
          )}
        </div>

        {/* Audit record */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Audit Record
          </p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3.5">
            {([
              ['Submission Date', dateStr],
              ['User (Email)',    form.email],
              ['Survey Version', result.auditRecord.surveyVersion],
              ['Company',        form.companyName],
              ['Industry',       form.industry],
              ['Score Generated',result.auditRecord.scoreGenerated],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{k}</dt>
                <dd className="text-sm text-slate-800 font-medium truncate" title={v}>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    )
  }

  // ── Form ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Progress */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card px-6 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-slate-700">Assessment Progress</p>
          <span className={`text-sm font-bold tabular-nums ${answeredCount === 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {answeredCount} / 8
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${answeredCount === 8 ? 'bg-emerald-500' : 'bg-blue-600'}`}
            style={{ width: `${(answeredCount / 8) * 100}%` }}
          />
        </div>
        {errors.answers && (
          <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.answers}</p>
        )}
      </div>

      {/* Company info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <div className="mb-5">
          <h3 className="text-slate-900 text-sm font-semibold">Company Information</h3>
          <p className="text-slate-400 text-xs mt-0.5">Used to personalize your report and audit record.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {([
            { key: 'companyName', label: 'Company Name', type: 'text',  placeholder: 'Acme Broadcasting Co.' },
            { key: 'contactName', label: 'Contact Name', type: 'text',  placeholder: 'Jane Smith'            },
            { key: 'email',       label: 'Email Address', type: 'email', placeholder: 'jane@company.com'     },
          ] as const).map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                  errors[key] ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'
                }`}
              />
              {errors[key] && (
                <p className="text-red-500 text-xs mt-1 font-medium">{errors[key]}</p>
              )}
            </div>
          ))}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Industry
            </label>
            <div className="relative">
              <select
                value={form.industry}
                onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}
                className={`w-full appearance-none px-4 py-2.5 pr-9 rounded-lg border text-sm outline-none transition-colors duration-150 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                  !form.industry ? 'text-slate-400' : 'text-slate-900'
                } ${errors.industry ? 'border-red-400 bg-red-50/50' : 'border-slate-200 hover:border-slate-300'}`}
              >
                <option value="" disabled>Select your industry</option>
                {INDUSTRIES.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
            {errors.industry && (
              <p className="text-red-500 text-xs mt-1 font-medium">{errors.industry}</p>
            )}
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-slate-900 text-sm font-semibold">Compliance Assessment</h3>
            <p className="text-slate-400 text-xs mt-0.5">8 questions · select one answer for each.</p>
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-400">
            {answeredCount}/8
          </span>
        </div>
        <div className="space-y-3">
          {QUESTIONS.map((q, i) => {
            const answered = answers[i] !== undefined
            return (
              <div
                key={i}
                className={`p-5 rounded-lg border transition-colors duration-200 ${
                  answered ? 'border-slate-200 bg-slate-50/70' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5 mb-4">
                  <span className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200 ${
                    answered ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <p className="text-slate-800 font-medium text-[15px] leading-snug pt-0.5">
                    {q.text}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {q.options.map(opt => (
                    <OptionButton
                      key={opt.value}
                      variant={opt.variant}
                      label={opt.label}
                      selected={answers[i] === opt.value}
                      onClick={() => setAnswers(prev => ({ ...prev, [i]: opt.value }))}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6">

        {/* Consent disclaimer */}
        <div className="mb-5">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100">
              <Info className="w-3.5 h-3.5 text-slate-500" />
            </span>
            <h3 className="text-slate-900 text-sm font-semibold">Participation &amp; Consent</h3>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-5 space-y-3 text-slate-500 text-[13px] leading-[1.7]">
            <p>
              You are invited to participate in the 2026 AETHYRLEX COMPLIANCE ASSESSMENT SURVEY.
              The purpose of this study is to evaluate internal alignment with FCC Part 15
              regulations and identify areas for compliance improvement. This survey will take
              approximately 3–5 minutes to complete. Your participation is highly valued and
              completely voluntary. You may skip any question or stop the survey at any time. To
              ensure objective reporting, all responses will be kept strictly anonymous. Data will
              be aggregated and analyzed by our Internal Dept. Individual responses will not be
              linked to your name or employment record, and no retaliatory action can or will be
              taken based on your feedback.
            </p>
            <p>
              Information gathered will be stored on secure, encrypted servers accessible only to
              authorized compliance personnel. By proceeding to the next page, you acknowledge that
              you have read this information and consent to participate. For questions regarding this
              study, or to report a compliance concern directly, please contact the Compliance Office
              at{' '}
              <a href="mailto:compliance@aethyrlex.com" className="font-medium text-blue-600 hover:text-blue-700">
                compliance@aethyrlex.com
              </a>
              . Thank you for your cooperation.
            </p>
            <p className="text-slate-400 italic">
              This survey assessment is mainly an FCC Compliance Readiness Report general tool.
            </p>
          </div>
        </div>

        {/* Acknowledgment — required */}
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={e => {
              setAgreed(e.target.checked)
              setErrors(prev => {
                const next = { ...prev }
                delete next.agreed
                return next
              })
            }}
            className="mt-0.5 h-4 w-4 shrink-0 accent-blue-600 cursor-pointer"
          />
          <span className="text-slate-600 text-sm leading-relaxed">
            I understand that this assessment is for informational purposes only, does not
            constitute legal advice, and does not guarantee FCC compliance.
          </span>
        </label>
        {errors.agreed && (
          <p className="text-red-500 text-xs ml-7 mt-1.5 font-medium">{errors.agreed}</p>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-5 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSubmit}
            className="group inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-semibold text-[15px] px-7 py-3.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Submit Survey
            <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-0.5" />
          </button>
          <p className="text-slate-400 text-sm">
            {answeredCount < 8
              ? `Answer ${8 - answeredCount} more question${8 - answeredCount !== 1 ? 's' : ''} to submit`
              : 'All answered — results appear instantly below'}
          </p>
        </div>
      </div>
    </div>
  )
}
