import type { OnboardingAnswers } from '@/stores/useOnboardingStore'
import type { Ritual, DayCode } from '@/types'

const allDays: DayCode[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
const weekdays: DayCode[] = ['mon', 'tue', 'wed', 'thu', 'fri']

interface RitualTemplate {
  title: string
  type: Ritual['type']
  durationMinutes: number
  lowEnergyAlternative: string
  days: DayCode[]
  order: number
}

const templates: Record<string, RitualTemplate[]> = {
  weight_loss: [
    { title: 'Drink a full glass of water on waking', type: 'body', durationMinutes: 2, lowEnergyAlternative: 'Sip water slowly in bed', days: allDays, order: 1 },
    { title: 'Walk for 10 minutes after a meal', type: 'body', durationMinutes: 10, lowEnergyAlternative: 'Step outside for 3 minutes of fresh air', days: allDays, order: 2 },
    { title: 'Pause before eating — ask if you are hungry or stressed', type: 'mind', durationMinutes: 1, lowEnergyAlternative: 'Take 3 slow breaths before eating', days: allDays, order: 3 },
  ],
  mental_clarity: [
    { title: 'Morning journal — 3 lines on how you feel', type: 'reflection', durationMinutes: 5, lowEnergyAlternative: 'Write one word that describes today', days: allDays, order: 1 },
    { title: 'Box breathing — 4 rounds before a stressful task', type: 'mind', durationMinutes: 4, lowEnergyAlternative: 'Take 3 deep breaths whenever you feel overwhelmed', days: allDays, order: 2 },
    { title: 'Evening reflection — what went well today', type: 'reflection', durationMinutes: 5, lowEnergyAlternative: 'Name one small good thing from today', days: allDays, order: 3 },
  ],
  both: [
    { title: 'Drink water and stretch for 2 minutes on waking', type: 'body', durationMinutes: 3, lowEnergyAlternative: 'Drink water in bed', days: allDays, order: 1 },
    { title: 'Walk for 10 minutes in natural light', type: 'body', durationMinutes: 10, lowEnergyAlternative: 'Stand by a window for 3 minutes', days: allDays, order: 2 },
    { title: 'Write 3 things you are grateful for', type: 'reflection', durationMinutes: 5, lowEnergyAlternative: 'Think of one thing you are grateful for', days: allDays, order: 3 },
  ],
  energy: [
    { title: 'Sleep by 10:30 PM — set an alarm as a reminder', type: 'sleep', durationMinutes: 1, lowEnergyAlternative: 'Dim your phone brightness after 9 PM', days: allDays, order: 1 },
    { title: 'Morning sunlight — stand outside for 5 minutes', type: 'body', durationMinutes: 5, lowEnergyAlternative: 'Open a window when you wake up', days: allDays, order: 2 },
    { title: 'No phone for the first 15 minutes after waking', type: 'mind', durationMinutes: 15, lowEnergyAlternative: 'Check phone only after drinking water', days: weekdays, order: 3 },
  ],
  sleep: [
    { title: 'Wind down routine — dim lights 30 min before bed', type: 'sleep', durationMinutes: 30, lowEnergyAlternative: 'Put your phone in another room before bed', days: allDays, order: 1 },
    { title: 'No screens 30 minutes before sleep', type: 'sleep', durationMinutes: 1, lowEnergyAlternative: 'Switch to low-brightness reading instead of scrolling', days: allDays, order: 2 },
    { title: 'Gratitude — write 3 lines before closing your eyes', type: 'reflection', durationMinutes: 5, lowEnergyAlternative: 'Think of one kind thing that happened today', days: allDays, order: 3 },
  ],
}

export function buildRitualPlan(answers: Partial<OnboardingAnswers>) {
  const goal = answers.primaryGoal ?? 'both'
  const ritualTemplates = templates[goal] ?? templates.both

  const rituals: Omit<Ritual, 'ritualId' | 'createdAt'>[] = ritualTemplates.map(t => ({
    title: t.title,
    description: null,
    type: t.type,
    durationMinutes: t.durationMinutes,
    scheduledTime: null,
    days: t.days,
    isActive: true,
    lowEnergyAlternative: t.lowEnergyAlternative,
    reminderEnabled: false,
    order: t.order,
  }))

  return {
    rituals,
    ritualTitles: ritualTemplates.map(t => t.title),
  }
}

export function todayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

export function getGreetingKey(): 'morning' | 'afternoon' | 'evening' | 'fallback' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'fallback'
}
