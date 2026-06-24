import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(req: NextRequest) {
  try {
    const { companyName, industry, score, maxScore, riskLevel, responses } = await req.json()

    if (!companyName || !industry || score == null || !responses?.length) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const pct        = Math.round((score / maxScore) * 100)
    const answerBlock = responses
      .map((r: { question: string; answer: string; points: number }, i: number) =>
        `Q${i + 1}: ${r.question}\nAnswer: ${r.answer} (${r.points} pts)`
      )
      .join('\n\n')

    const prompt =
`You are an FCC regulatory compliance expert. Analyze this ${industry} company's compliance survey.

Company: ${companyName}
Score: ${score}/${maxScore} (${pct}%) — ${riskLevel}

${answerBlock}

Return ONLY valid JSON with this exact shape:
{
  "strengths":       ["string", "string"],
  "weaknesses":      ["string", "string"],
  "recommendations": ["string", "string", "string"]
}

Guidelines:
- strengths (2–3): based on Yes/high-score answers; specific to FCC obligations for ${industry}
- weaknesses (2–3): based on No/Partial answers; specific to FCC compliance gaps
- recommendations (3): actionable, prioritized steps; 1–2 sentences each
- If all answers are Yes, highlight strong posture and suggest sustaining practices`

    const openai     = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model:           'gpt-4o-mini',
      messages:        [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    })

    const analysis = JSON.parse(completion.choices[0].message.content ?? '{}')
    return NextResponse.json(analysis)
  } catch (err) {
    console.error('Insights route error:', err)
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 })
  }
}
