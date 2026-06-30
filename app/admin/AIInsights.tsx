import OpenAI from 'openai'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Submission } from './AdminTable'

const QUESTIONS = [
  'Does your organization maintain written compliance procedures?',
  'Do you track FCC filing deadlines?',
  'Are compliance responsibilities assigned to specific personnel?',
  'Have you conducted an FCC compliance review within the last 12 months?',
  'Are compliance documents stored in a centralized system?',
  'Can you produce documentation during an audit within 48 hours?',
  'Are compliance-related communications documented?',
  'Do you have a process for tracking corrective actions?',
]

type Outlook = 'positive' | 'neutral' | 'concerning'

interface Insights {
  summary: string
  topRisks: string[]
  recommendations: string[]
  outlook: Outlook
}

export default async function AIInsights({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) return null

  const total    = submissions.length
  const avgScore = Math.round(submissions.reduce((s, x) => s + x.score, 0) / total)
  const highRisk = submissions.filter(s => s.riskLevel === 'High Risk').length
  const modRisk  = submissions.filter(s => s.riskLevel === 'Moderate Risk').length
  const lowRisk  = submissions.filter(s => s.riskLevel === 'Low Risk').length

  const questionStats = QUESTIONS.map((q, i) => {
    const responses = submissions.map(s => s.responses?.[i]).filter(Boolean)
    const failPct   = Math.round((responses.filter(r => r.points === 0).length / total) * 100)
    return { question: q, failPct }
  }).sort((a, b) => b.failPct - a.failPct)

  const industryMap: Record<string, { count: number; total: number }> = {}
  submissions.forEach(s => {
    if (!industryMap[s.industry]) industryMap[s.industry] = { count: 0, total: 0 }
    industryMap[s.industry].count++
    industryMap[s.industry].total += s.score
  })
  const industryLines = Object.entries(industryMap)
    .map(([ind, d]) => `${ind}: avg ${Math.round(d.total / d.count)}/80 (${d.count} org${d.count > 1 ? 's' : ''})`)
    .join('\n')

  const prompt = `You are an FCC regulatory compliance analyst reviewing aggregate survey data from ${total} organizations.

Overall:
- Average score: ${avgScore}/80
- High Risk: ${highRisk} | Moderate Risk: ${modRisk} | Low Risk: ${lowRisk}

Top failing questions (by % of orgs that answered No):
${questionStats.slice(0, 4).map((q, i) => `${i + 1}. "${q.question}" — ${q.failPct}% failed`).join('\n')}

Industry breakdown:
${industryLines}

Return ONLY valid JSON with this exact shape:
{
  "summary": "2-3 sentence executive summary of the overall compliance landscape",
  "topRisks": ["specific risk pattern 1", "specific risk pattern 2", "specific risk pattern 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "outlook": "positive" | "neutral" | "concerning"
}

Guidelines:
- summary: factual, references the score and risk distribution
- topRisks: specific compliance patterns identified across organizations, not just question rephrases
- recommendations: concrete next steps for the cohort, 1 sentence each
- outlook: positive if avgScore >= 55, concerning if avgScore < 40, neutral otherwise`

  let insights: Insights
  try {
    const openai     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model:           'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })
    insights = JSON.parse(completion.choices[0].message.content ?? '{}')
  } catch {
    return null
  }

  const outlookConfig = {
    positive:   { label: 'Positive Outlook',   Icon: TrendingUp,   color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    neutral:    { label: 'Neutral Outlook',     Icon: Minus,        color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
    concerning: { label: 'Concerning Outlook',  Icon: TrendingDown, color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-200'     },
  }[insights.outlook ?? 'neutral']

  const { label, Icon, color, bg, border } = outlookConfig

  return (
    <div className="space-y-4 mb-8">

      {/* Summary card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${bg} ${border} ${color}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
          </div>
          <p className="text-slate-700 text-sm leading-relaxed">{insights.summary}</p>
        </div>
      </div>

      {/* Risks + Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">

        {/* Top Risks */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200">
            <div className="w-7 h-7 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            </div>
            <span className="text-slate-900 text-sm font-semibold">Top Risk Patterns</span>
          </div>
          <div className="px-5 py-4 space-y-3.5">
            {insights.topRisks?.map((risk, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 shrink-0 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-700 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-700 text-[13px] leading-relaxed">{risk}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-200">
            <div className="w-7 h-7 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-slate-900 text-sm font-semibold">Recommendations</span>
          </div>
          <div className="px-5 py-4 space-y-3.5">
            {insights.recommendations?.map((rec, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 shrink-0 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700 text-[10px] font-bold mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-700 text-[13px] leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
