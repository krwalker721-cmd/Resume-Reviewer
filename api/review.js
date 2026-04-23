import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const APP_TYPE_CONTEXT = {
  college: 'a college program application (emphasize academics, extracurriculars, personal growth, leadership potential)',
  firstjob: 'a first full-time job application (focus on transferable skills, any work experience including part-time, volunteer, school projects)',
  parttime: 'a part-time job application (availability, reliability, relevant skills, any past work experience)',
  internship: 'an internship application (highlight coursework, projects, technical skills, eagerness to learn)',
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { resumeText, appType, userId } = req.body

  if (!resumeText || !userId) {
    return res.status(400).json({ error: 'Missing resumeText or userId' })
  }

  // Check access in Supabase
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('access_level, reviews_used')
    .eq('id', userId)
    .single()

  if (profileError || !profile) {
    return res.status(403).json({ error: 'User profile not found' })
  }

  if (profile.access_level === 'free' && profile.reviews_used >= 1) {
    return res.status(403).json({ error: 'Free review limit reached', paywall: true })
  }

  const context = APP_TYPE_CONTEXT[appType] || APP_TYPE_CONTEXT.internship

  const systemPrompt = `You are a warm, encouraging resume coach who specializes in helping students land their first opportunities. You are reviewing a resume for ${context}.

TONE RULES:
- Be encouraging and student-friendly — never corporate or harsh
- Acknowledge that limited experience is completely normal and expected
- Tailor ALL advice specifically to the application type
- Start every tip with an action verb (e.g., "Add...", "Replace...", "Move...", "Quantify...")
- Be specific and concrete — no vague advice

Respond ONLY with valid JSON matching this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2 sentences: encouraging overview of the resume>",
  "sections": {
    "formatting": {
      "score": <number 0-100>,
      "label": "Formatting & Length",
      "feedback": "<2-3 sentences of specific feedback>",
      "tips": ["<action verb tip 1>", "<action verb tip 2>"]
    },
    "bulletPoints": {
      "score": <number 0-100>,
      "label": "Bullet Point Strength",
      "feedback": "<2-3 sentences of specific feedback>",
      "tips": ["<action verb tip 1>", "<action verb tip 2>"]
    },
    "skills": {
      "score": <number 0-100>,
      "label": "Skills Section",
      "feedback": "<2-3 sentences of specific feedback>",
      "tips": ["<action verb tip 1>", "<action verb tip 2>"]
    },
    "missingSections": {
      "score": <number 0-100>,
      "label": "Missing Sections",
      "feedback": "<2-3 sentences of specific feedback>",
      "tips": ["<action verb tip 1>", "<action verb tip 2>"]
    }
  },
  "topWins": ["<strength 1>", "<strength 2>"],
  "topFixes": ["<fix 1>", "<fix 2>", "<fix 3>"]
}

Return ONLY the JSON object. No markdown fences, no extra text.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Please review this resume:\n\n${resumeText.slice(0, 6000)}`,
        },
      ],
    })

    const raw = message.content[0].text.trim()
    let feedback
    try {
      feedback = JSON.parse(raw)
    } catch {
      // Strip any accidental markdown fences
      const cleaned = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '')
      feedback = JSON.parse(cleaned)
    }

    // Save review to Supabase
    await supabase.from('reviews').insert({
      user_id: userId,
      resume_text: resumeText.slice(0, 8000),
      application_type: appType,
      feedback,
    })

    // Increment reviews_used
    await supabase
      .from('profiles')
      .update({ reviews_used: profile.reviews_used + 1 })
      .eq('id', userId)

    return res.status(200).json(feedback)
  } catch (err) {
    console.error('Review error:', err)
    return res.status(500).json({ error: err?.message || err?.toString() || 'AI review failed' })
  }
}
