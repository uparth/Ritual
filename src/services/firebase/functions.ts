import { httpsCallable } from 'firebase/functions'
import { functions } from './config'
import { config } from '@/constants/config'
import type { AIMode, AIInputContext, AISession } from '@/types'

interface AICallPayload {
  mode: AIMode
  context: AIInputContext
}

interface AICallResult {
  response: string
  safetyFlagged: boolean
  safetyResponse: string | null
  tokensUsed: number
  model: string
}

const fnMap: Record<AIMode, string> = {
  daily_guidance:  config.ai.dailyGuidanceFn,
  craving_support: config.ai.cravingSupportFn,
  overthinking:    config.ai.overthinkingFn,
  low_energy:      config.ai.lowEnergyFn,
  cant_sleep:      config.ai.overthinkingFn,
  guilt:           config.ai.overthinkingFn,
  motivation:      config.ai.dailyGuidanceFn,
}

export async function callAI(payload: AICallPayload): Promise<AICallResult> {
  const fnName = fnMap[payload.mode]
  const fn = httpsCallable<AICallPayload, AICallResult>(functions, fnName)
  const result = await fn(payload)
  return result.data
}
