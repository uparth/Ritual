import { initializeApp } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { HttpsError, onCall } from 'firebase-functions/v2/https'
import { defineSecret, defineString } from 'firebase-functions/params'

initializeApp()

const db = getFirestore()
const openAIKey = defineSecret('OPENAI_API_KEY')
const openAIModel = defineString('OPENAI_MODEL', { default: 'gpt-4o-mini' })

type AIMode =
  | 'daily_guidance'
  | 'craving_support'
  | 'overthinking'
  | 'low_energy'
  | 'cant_sleep'
  | 'guilt'
  | 'motivation'

interface AIInputContext {
  checkInDate: string | null
  mood: number | null
  stress: number | null
  energy: number | null
  cravings: number | null
  recentPatterns: string[]
  userMessage: string | null
}

interface AICallPayload {
  mode: AIMode
  context: AIInputContext
}

interface AICallResult {
  sessionId: string
  response: string
  safetyFlagged: boolean
  safetyResponse: string | null
  tokensUsed: number
  model: string
}

const safetyResponse =
  'This sounds heavy to carry alone. Ritual can support small grounding steps, but if you feel unsafe or unable to cope, please contact a trusted person or a mental health professional.'

const distressKeywords = [
  'kill myself',
  'suicide',
  'end my life',
  'hurt myself',
  'self harm',
  'unsafe',
  'cannot go on',
]

const modeLabels: Record<AIMode, string> = {
  daily_guidance: 'daily guidance',
  craving_support: 'craving support',
  overthinking: 'overthinking support',
  low_energy: 'low energy planning',
  cant_sleep: 'sleep support',
  guilt: 'guilt support',
  motivation: 'motivation',
}

function assertPayload(data: unknown, allowedModes: AIMode[]): AICallPayload {
  if (!data || typeof data !== 'object') {
    throw new HttpsError('invalid-argument', 'Missing AI request payload.')
  }

  const payload = data as Partial<AICallPayload>
  if (!payload.mode || !allowedModes.includes(payload.mode)) {
    throw new HttpsError('invalid-argument', `Expected mode ${allowedModes.join(' or ')}.`)
  }

  const context = payload.context
  if (!context || typeof context !== 'object' || !Array.isArray(context.recentPatterns)) {
    throw new HttpsError('invalid-argument', 'Missing AI input context.')
  }

  return {
    mode: payload.mode,
    context: {
      checkInDate: nullableString(context.checkInDate),
      mood: nullableNumber(context.mood),
      stress: nullableNumber(context.stress),
      energy: nullableNumber(context.energy),
      cravings: nullableNumber(context.cravings),
      recentPatterns: context.recentPatterns.filter((item): item is string => typeof item === 'string'),
      userMessage: nullableString(context.userMessage),
    },
  }
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function nullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function containsDistressLanguage(context: AIInputContext): boolean {
  const haystack = [context.userMessage, ...context.recentPatterns].filter(Boolean).join(' ').toLowerCase()
  return distressKeywords.some(keyword => haystack.includes(keyword))
}

function buildPrompt(mode: AIMode, context: AIInputContext): string {
  const lines = [
    `Mode: ${modeLabels[mode]}`,
    `Date: ${context.checkInDate ?? 'not provided'}`,
    `Mood: ${context.mood ?? 'unknown'}/10`,
    `Stress: ${context.stress ?? 'unknown'}/10`,
    `Energy: ${context.energy ?? 'unknown'}/10`,
    `Cravings: ${context.cravings ?? 'unknown'}/10`,
    `Recent patterns: ${context.recentPatterns.length > 0 ? context.recentPatterns.join('; ') : 'none yet'}`,
    `User message: ${context.userMessage ?? 'none'}`,
  ]

  return [
    'You are Ritual, a calm, practical AI coach for daily mind-body habit change.',
    'Give emotionally grounded support without diagnosing, moralizing, or making medical claims.',
    'Keep the answer concise: 2 short paragraphs plus up to 3 tiny next actions.',
    'If the user sounds distressed, encourage immediate human support and professional help.',
    lines.join('\n'),
  ].join('\n\n')
}

async function callOpenAI(prompt: string): Promise<{ text: string; tokensUsed: number; model: string }> {
  const apiKey = openAIKey.value()
  if (!apiKey) {
    throw new HttpsError('failed-precondition', 'OPENAI_API_KEY is not configured for Cloud Functions.')
  }

  const model = openAIModel.value()
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 500,
      temperature: 0.7,
    }),
  })

  const body = await response.json() as {
    output_text?: string
    error?: { message?: string }
    usage?: { total_tokens?: number }
  }

  if (!response.ok) {
    throw new HttpsError('internal', body.error?.message ?? 'OpenAI request failed.')
  }

  return {
    text: body.output_text?.trim() || 'Take one gentle step now: pause, breathe, and choose the smallest supportive action available.',
    tokensUsed: body.usage?.total_tokens ?? 0,
    model,
  }
}

async function saveSession(uid: string, payload: AICallPayload, result: Omit<AICallResult, 'sessionId'>): Promise<string> {
  const ref = db.collection('users').doc(uid).collection('ai_sessions').doc()
  await ref.set({
    sessionId: ref.id,
    mode: payload.mode,
    inputContext: payload.context,
    response: result.response,
    safetyFlagged: result.safetyFlagged,
    safetyResponse: result.safetyResponse,
    model: result.model,
    tokensUsed: result.tokensUsed,
    createdAt: FieldValue.serverTimestamp(),
  })
  return ref.id
}

function createAIHandler(allowedModes: AIMode[]) {
  return onCall({ secrets: [openAIKey] }, async (request): Promise<AICallResult> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before requesting coach support.')
    }

    const payload = assertPayload(request.data, allowedModes)
    const safetyFlagged = containsDistressLanguage(payload.context)
    const aiResult = safetyFlagged
      ? { text: safetyResponse, tokensUsed: 0, model: 'safety-router' }
      : await callOpenAI(buildPrompt(payload.mode, payload.context))

    const result = {
      response: aiResult.text,
      safetyFlagged,
      safetyResponse: safetyFlagged ? safetyResponse : null,
      tokensUsed: aiResult.tokensUsed,
      model: aiResult.model,
    }
    const sessionId = await saveSession(request.auth.uid, payload, result)

    return {
      sessionId,
      ...result,
    }
  })
}

export const dailyGuidance = createAIHandler(['daily_guidance', 'motivation'])
export const cravingSupport = createAIHandler(['craving_support'])
export const overthinkingSupport = createAIHandler(['overthinking', 'cant_sleep', 'guilt'])
export const lowEnergySupport = createAIHandler(['low_energy'])
