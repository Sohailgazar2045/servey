import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { put, list } from '@vercel/blob'
import { promises as fs } from 'fs'
import path from 'path'

const SURVEY_VERSION = '1.0'
const BLOB_KEY = 'audit-log.json'
const LOCAL_LOG = path.join(process.cwd(), 'audit-log.json')

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

const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN

async function readLog(): Promise<unknown[]> {
  try {
    if (useBlob()) {
      const { blobs } = await list({ prefix: BLOB_KEY })
      if (!blobs.length) return []
      const res = await fetch(blobs[0].downloadUrl)
      return await res.json()
    } else {
      const raw = await fs.readFile(LOCAL_LOG, 'utf8')
      return JSON.parse(raw)
    }
  } catch {
    return []
  }
}

async function writeLog(log: unknown[]) {
  if (useBlob()) {
    await put(BLOB_KEY, JSON.stringify(log, null, 2), {
      access: 'public',
      contentType: 'application/json',
      allowOverwrite: true,
    })
  } else {
    await fs.writeFile(LOCAL_LOG, JSON.stringify(log, null, 2))
  }
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
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const answerBlock = scoredAnswers
      .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer} (${a.points} pts)`)
      .join('\n\n')

    const prompt =
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
- If all answers are Yes, highlight the strong posture and suggest sustaining practices`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const analysis = JSON.parse(completion.choices[0].message.content ?? '{}')

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

    try {
      const log = await readLog()
      log.push(auditRecord)
      await writeLog(log)
    } catch (logErr) {
      console.error('Audit log write failed (non-fatal):', logErr)
    }

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
