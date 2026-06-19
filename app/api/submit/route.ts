import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { promises as fs } from 'fs'
import path from 'path'

const SURVEY_VERSION = '1.0'
const AUDIT_LOG = path.join(process.cwd(), 'audit-log.json')

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

const SCORE_MAP: Record<string, number> = {
  yes: 10, partially: 5, somewhat: 5,
  sometimes: 5, unsure: 5, no: 0,
}

function getRisk(score: number) {
  if (score >= 65) return { level: 'Low Risk',      badge: 'low',      color: '#10B981' }
  if (score >= 40) return { level: 'Moderate Risk', badge: 'moderate', color: '#F59E0B' }
  return               { level: 'High Risk',        badge: 'high',     color: '#EF4444' }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, contactName, email, industry, answers } = body

    if (!companyName || !contactName || !email || !industry ||
        !Array.isArray(answers) || answers.length !== 8) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let score = 0
    const scoredAnswers = (answers as string[]).map((answer, i) => {
      const pts = SCORE_MAP[answer.toLowerCase()] ?? 0
      score += pts
      return { question: QUESTIONS[i], answer, points: pts }
    })

    const risk = getRisk(score)

    // ── AI analysis ──────────────────────────────────────────────────────
    let analysis = {
      strengths:       [] as string[],
      weaknesses:      [] as string[],
      recommendations: [] as string[],
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      try {
        const client = new Anthropic({ apiKey })
        const answerBlock = scoredAnswers
          .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer} (${a.points} pts)`)
          .join('\n\n')

        const msg = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 900,
          messages: [{
            role: 'user',
            content:
`You are an FCC regulatory compliance expert. Analyze this ${industry} company's readiness survey.

Company: ${companyName}
Score: ${score}/80 — ${risk.level}

${answerBlock}

Return ONLY valid JSON (no markdown fences, no commentary) with this exact shape:
{
  "strengths":       ["string", "string"],
  "weaknesses":      ["string", "string"],
  "recommendations": ["string", "string", "string"]
}

Guidelines:
- strengths (2–3): based on Yes/high-score answers; specific to FCC obligations for ${industry}
- weaknesses (2–3): based on No/Partial answers; specific to FCC compliance gaps
- recommendations (3): actionable, prioritized steps; 1–2 sentences each
- If all answers are Yes, highlight the strong posture and suggest sustaining practices`,
          }],
        })

        const raw = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
        analysis = JSON.parse(raw)
      } catch (aiErr) {
        console.error('AI error (using fallback):', aiErr)
        analysis = buildFallback(scoredAnswers, industry)
      }
    } else {
      analysis = buildFallback(scoredAnswers, industry)
    }

    // ── Audit record ─────────────────────────────────────────────────────
    const submissionDate = new Date().toISOString()
    const scoreGenerated = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    })

    const auditRecord = {
      id: String(Date.now()),
      surveyVersion: SURVEY_VERSION,
      submissionDate,
      scoreGenerated,
      companyName,
      contactName,
      user: email,
      industry,
      responses: scoredAnswers,
      score,
      maxScore: 80,
      riskLevel: risk.level,
    }

    let log: unknown[] = []
    try {
      const raw = await fs.readFile(AUDIT_LOG, 'utf8')
      log = JSON.parse(raw)
    } catch {}
    log.push(auditRecord)
    await fs.writeFile(AUDIT_LOG, JSON.stringify(log, null, 2))

    return NextResponse.json({
      success: true,
      score,
      maxScore: 80,
      riskLevel:  risk.level,
      riskBadge:  risk.badge,
      riskColor:  risk.color,
      analysis,
      auditRecord,
    })
  } catch (err) {
    console.error('Submit route error:', err)
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
  }
}

// Rule-based fallback when no API key or AI call fails
function buildFallback(
  scoredAnswers: { question: string; answer: string; points: number }[],
  industry: string,
) {
  const yesItems  = scoredAnswers.filter(a => a.points === 10)
  const gapItems  = scoredAnswers.filter(a => a.points < 10)

  const strengths = yesItems.slice(0, 3).map(a =>
    `Your organization has confirmed: "${a.question}" — a strong baseline for FCC compliance.`
  )
  if (!strengths.length)
    strengths.push(`Your ${industry} organization has taken the first step by completing this compliance assessment.`)

  const weaknesses = gapItems.slice(0, 3).map(a =>
    `Response to "${a.question}" indicates a compliance gap that should be addressed.`
  )
  if (!weaknesses.length)
    weaknesses.push('No significant weaknesses identified based on your responses.')

  const recommendations = [
    'Develop or formalize written FCC compliance procedures and assign ownership to a designated compliance officer.',
    'Establish a centralized document management system with version control to store all compliance records.',
    'Schedule a formal FCC compliance review every 12 months and document findings with corrective action plans.',
  ]

  return { strengths, weaknesses, recommendations }
}
