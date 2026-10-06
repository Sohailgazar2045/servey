import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'
import {
  MODULES, normalizeDeviceAnswers, validateModule,
  assessRisks, describeAnswers, getPathway, getReadiness, scoreRiskAreas,
} from '@/lib/deviceSurvey'

// 2.0 — adds the five device / RF modules from the AethyrLex pre-survey.
const SURVEY_VERSION = '2.0'

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

// 80-point framework: 8 compliance questions × 5 pts + 5 RF risk areas × 8 pts.
const QUESTION_POINTS = 5

const SCORE_MAP: Record<string, number> = {
  yes: 5, partially: 2.5, somewhat: 2.5,
  sometimes: 2.5, unsure: 2.5, no: 0,
}

function getRisk(score: number) {
  if (score >= 65) return { level: 'Low Risk',      badge: 'low',      color: '#16A34A' }
  if (score >= 40) return { level: 'Moderate Risk', badge: 'moderate', color: '#CA8A04' }
  return               { level: 'High Risk',        badge: 'high',     color: '#DC2626' }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { companyName, contactName, email, industry, answers,
            isLicensedBroadcaster } = body
    const device = normalizeDeviceAnswers(body.device)

    if (!companyName || !contactName || !email || !industry ||
        !isLicensedBroadcaster ||
        !Array.isArray(answers) || answers.length !== 8) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    for (let m = 0; m < MODULES.length; m++) {
      if (Object.keys(validateModule(m, device)).length) {
        return NextResponse.json({ error: `Incomplete answers in ${MODULES[m]}` }, { status: 400 })
      }
    }

    // Segmentation only — deliberately excluded from scoring and from the
    // AI prompt so it cannot influence the score or the recommendations.
    const isBroadcaster = String(isLicensedBroadcaster).toLowerCase() === 'yes'

    // ── Device / RF risks (rule-based) ────────────────────────────────────
    const flags           = assessRisks(device)
    const readiness       = getReadiness(flags)
    const pathway         = getPathway(device)
    const deviceResponses = describeAnswers(device)

    // ── Score ─────────────────────────────────────────────────────────────
    const scoredAnswers = [
      ...(answers as string[]).map((answer, i) => ({
        question:  QUESTIONS[i],
        answer,
        points:    SCORE_MAP[answer.toLowerCase()] ?? 0,
        maxPoints: QUESTION_POINTS,
      })),
      ...scoreRiskAreas(flags),
    ]
    const score = scoredAnswers.reduce((sum, a) => sum + a.points, 0)

    const risk = getRisk(score)

    // ── AI analysis ───────────────────────────────────────────────────────
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const answerBlock = scoredAnswers
      .map((a, i) => `Q${i + 1}: ${a.question}\nAnswer: ${a.answer} (${a.points}/${a.maxPoints} pts)`)
      .join('\n\n')

    const deviceBlock = MODULES.map(m => {
      const rows = deviceResponses.filter(r => r.module === m)
      return `## ${m}\n${rows.map(r => `- ${r.question}: ${r.answer}`).join('\n')}`
    }).join('\n\n')

    const flagBlock = flags.length
      ? flags.map(f => `- [${f.severity.toUpperCase()}] ${f.category}: ${f.title}`).join('\n')
      : '- None'

    const prompt =
`You are an FCC regulatory compliance and equipment authorization expert. Analyze this ${industry} company's readiness survey.

Company: ${companyName}

Overall score: ${score}/80 — ${risk.level}
(8 compliance questions × 5 pts + 5 RF risk areas × 8 pts)

PART A — Scored items
${answerBlock}

PART B — Device / RF pre-survey answers
${deviceBlock}

RF risk flags identified by rules:
${flagBlock}

Likely certification path: ${pathway}

Return ONLY valid JSON with this exact shape:
{
  "strengths":          ["string", "string"],
  "weaknesses":         ["string", "string"],
  "recommendations":    ["string", "string", "string"],
  "rfSummary":          "string",
  "missingInformation": ["string"]
}

Guidelines:
- This is ONE report covering the organization and the device together.
- strengths (2–3): based on full-point items in Part A (compliance practices and RF risk areas with no risk found)
- weaknesses (2–3): based on low-point items in Part A, especially high RF risks
- recommendations (3–5): actionable, prioritized steps covering both, highest risk first; 1–2 sentences each
- rfSummary: 3–4 sentences describing the device, its main RF compliance risks and the likely certification path
- missingInformation: specific device data to gather before testing (e.g. exact frequency band, module FCC ID, antenna gain); empty array if nothing is missing
- Cite FCC rule parts or KDBs only when you are confident they apply. Do not invent facts about the device.`

    const completion = await openai.chat.completions.create({
      model:           'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const ai = JSON.parse(completion.choices[0].message.content ?? '{}')
    const analysis = {
      strengths:       Array.isArray(ai.strengths)       ? ai.strengths.map(String)       : [],
      weaknesses:      Array.isArray(ai.weaknesses)      ? ai.weaknesses.map(String)      : [],
      recommendations: Array.isArray(ai.recommendations) ? ai.recommendations.map(String) : [],
    }
    const deviceAssessment = {
      readiness,
      pathway,
      flags,
      responses:          deviceResponses,
      summary:            typeof ai.rfSummary === 'string' ? ai.rfSummary : '',
      missingInformation: Array.isArray(ai.missingInformation) ? ai.missingInformation.map(String) : [],
    }

    // ── Build record ──────────────────────────────────────────────────────
    const submissionDate = new Date().toISOString()
    const scoreGenerated = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
    })
    const id = crypto.randomUUID()

    // ── Save to Supabase ──────────────────────────────────────────────────
    const baseRow = {
      id,
      survey_version:  SURVEY_VERSION,
      submission_date: submissionDate,
      score_generated: scoreGenerated,
      company_name:    companyName,
      contact_name:    contactName,
      email,
      industry,
      is_licensed_broadcaster: isBroadcaster,
      responses:       scoredAnswers,
      score,
      max_score:       80,
      risk_level:      risk.level,
      analysis,
    }
    const deviceRow = {
      device_answers:    device,
      device_assessment: deviceAssessment,
      readiness_level:   readiness.level,
    }

    // Fall back gracefully if the v2.0 migration in supabase/schema.sql has not been run:
    // PGRST204 = device columns missing, 22P02 = `score` is still an integer column.
    let row: Record<string, unknown> = { ...baseRow, ...deviceRow }
    let { error: dbError } = await supabase.from('survey_submissions').insert(row)
    for (let attempt = 0; dbError && attempt < 2; attempt++) {
      if (dbError.code === 'PGRST204' && 'device_answers' in row) {
        console.error('survey_submissions is missing the device columns; saving without them:', dbError.message)
        const { device_answers, device_assessment, readiness_level, ...rest } = row
        row = rest
      } else if (dbError.code === '22P02' && row.score !== Math.round(score)) {
        console.error('survey_submissions.score is an integer column; saving a rounded score:', dbError.message)
        row = { ...row, score: Math.round(score) }
      } else break
      ;({ error: dbError } = await supabase.from('survey_submissions').insert(row))
    }
    if (dbError) console.error('Supabase insert error:', dbError)

    const auditRecord = {
      id,
      surveyVersion:  SURVEY_VERSION,
      submissionDate,
      scoreGenerated,
      companyName,
      contactName,
      user:           email,
      industry,
      isLicensedBroadcaster: isBroadcaster,
      responses:      scoredAnswers,
      score,
      maxScore:       80,
      riskLevel:      risk.level,
    }

    return NextResponse.json({
      success:    true,
      score,
      maxScore:   80,
      riskLevel:  risk.level,
      riskBadge:  risk.badge,
      riskColor:  risk.color,
      analysis,
      device:     deviceAssessment,
      auditRecord,
    })
  } catch (err) {
    console.error('Submit route error:', err)
    return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
  }
}
