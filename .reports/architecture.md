# Ritual — Architecture Report

**Generated:** 2026-05-23  
**Stack:** React Native + Expo + TypeScript + Firebase + OpenAI via Cloud Functions

---

## 1. Project Overview

Ritual is a dark-mode-first mobile app for mind-body transformation. It supports emotional regulation, weight loss, daily rituals, low-energy mode, AI coaching, and progress tracking. The architecture is optimized for a solo creator — minimal backend complexity, maximum type safety, and a clean separation between UI, state, and services.

---

## 2. Folder Structure

```
Ritual/
├── app/                          ← Expo Router (file = route)
│   ├── _layout.tsx               ← Root: auth guard, font loading, navigation setup
│   ├── index.tsx                 ← Redirect to welcome or today
│   ├── (auth)/
│   │   ├── _layout.tsx           ← Auth stack (fade animation)
│   │   ├── welcome.tsx           ← Emotional first screen
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (onboarding)/
│   │   ├── _layout.tsx           ← Onboarding stack (slide animation, no tab bar)
│   │   ├── step-1.tsx            ← Struggles multi-select
│   │   ├── step-2.tsx            ← Energy slider
│   │   ├── step-3.tsx            ← Cravings slider
│   │   ├── step-4.tsx            ← Sleep hours slider
│   │   ├── step-5.tsx            ← Movement level chips
│   │   ├── step-6.tsx            ← Primary goal chips
│   │   ├── step-7.tsx            ← Spiritual practice chips
│   │   ├── step-8.tsx            ← Preferred coaching tone chips
│   │   └── plan.tsx              ← Plan generation + loading state
│   ├── (tabs)/
│   │   ├── _layout.tsx           ← Bottom tab navigator (5 tabs)
│   │   ├── today.tsx             ← Core screen: rituals + AI + check-in
│   │   ├── rituals.tsx           ← All rituals list + add
│   │   ├── coach.tsx             ← AI companion (7 entry modes)
│   │   ├── progress.tsx          ← Charts + weekly insight (Phase 5)
│   │   └── profile.tsx           ← Goal, tone, sign out
│   ├── check-in.tsx              ← Modal: morning + evening check-in
│   ├── low-energy.tsx            ← Modal: 3-ritual minimum day
│   ├── ritual/[id].tsx           ← Modal: ritual detail + edit
│   └── journal/[id].tsx          ← Modal: full-screen journal editor
│
├── src/
│   ├── components/
│   │   ├── ui/                   ← Primitives: no business logic, no Firestore
│   │   │   ├── Text.tsx          ← RText: variant + color props
│   │   │   ├── Button.tsx        ← primary / secondary / ghost, 3 sizes
│   │   │   ├── Card.tsx          ← Dark card with border
│   │   │   ├── Chip.tsx          ← Selectable tag
│   │   │   ├── Skeleton.tsx      ← Animated loading placeholder
│   │   │   ├── Divider.tsx
│   │   │   └── index.ts
│   │   ├── forms/
│   │   │   ├── MoodSlider.tsx    ← Labeled 1–10 slider
│   │   │   ├── ToggleChipGroup.tsx ← Multi/single select chip group
│   │   │   └── index.ts
│   │   └── features/
│   │       ├── RitualCard.tsx    ← Ritual with type accent, status, complete/skip actions
│   │       ├── AIMessageCard.tsx ← Collapsed AI message, safety flag handling
│   │       ├── LowEnergyBanner.tsx ← Contextual banner (energy ≤ 3)
│   │       └── index.ts
│   │
│   ├── stores/                   ← Zustand — one domain per file
│   │   ├── useAuthStore.ts       ← uid, email, signIn/Up/Out, listenToAuth
│   │   ├── useUserStore.ts       ← profile, preferences, onboardingComplete (persisted)
│   │   ├── useCheckInStore.ts    ← draft, todayCheckIn, save (draft persisted)
│   │   ├── useRitualStore.ts     ← rituals, todayLogs, complete/skip (optimistic)
│   │   ├── useAIStore.ts         ← activeSession, request, fetchLatest
│   │   └── useOnboardingStore.ts ← currentStep, answers (persisted to AsyncStorage)
│   │
│   ├── services/firebase/
│   │   ├── config.ts             ← initializeApp, auth, db, functions exports
│   │   ├── auth.ts               ← signUp (creates user doc), signIn, signOut, listenAuth
│   │   ├── firestore.ts          ← All typed Firestore read/write helpers
│   │   ├── functions.ts          ← callAI() — routes to correct Cloud Function by AIMode
│   │   └── index.ts
│   │
│   ├── constants/
│   │   ├── tokens.ts             ← All design tokens (colors, font, radius, spacing, shadow)
│   │   ├── copy.ts               ← All UI strings (no hardcoded text in JSX)
│   │   └── config.ts             ← Firebase config from env vars, AI function names, thresholds
│   │
│   ├── types/
│   │   ├── user.ts               ← UserDoc, UserProfile, UserPreferences
│   │   ├── checkIn.ts            ← DailyCheckIn, CheckInFormData
│   │   ├── ritual.ts             ← Ritual, RitualLog, RitualWithLog
│   │   ├── aiSession.ts          ← AISession, AIMode, AIInputContext
│   │   ├── journal.ts            ← JournalEntry, WeeklyInsight
│   │   └── index.ts              ← Re-exports all types
│   │
│   └── utils/
│       └── planBuilder.ts        ← buildRitualPlan(), todayDateString(), getGreetingKey()
│
├── functions/src/                ← Firebase Cloud Functions (separate deploy)
│   ├── ai/
│   │   ├── dailyGuidance.ts
│   │   ├── cravingSupport.ts
│   │   ├── overthinkingSupport.ts
│   │   └── lowEnergySupport.ts
│   ├── triggers/
│   │   ├── onCheckInCreated.ts   ← Auto-triggers daily AI message
│   │   └── generateWeeklyInsight.ts ← Scheduled: every Sunday
│   └── notifications/
│       ├── morningReminder.ts
│       └── eveningReminder.ts
│
├── assets/
│   └── fonts/                    ← Inter-Regular/Medium/SemiBold/Bold.ttf
│
├── .reports/
│   └── architecture.md           ← This file
├── .env.example                  ← Firebase env var template
├── app.json                      ← Expo config (dark UI, scheme, typedRoutes)
├── metro.config.js               ← @ alias → src/
├── tsconfig.json                 ← strict + paths: {"@/*": ["src/*"]}
└── package.json
```

---

## 3. Navigation Architecture

### Route Guards (app/_layout.tsx)

```
Auth loading     → null (SplashScreen shown)
No uid           → /(auth)/welcome
uid, no onboard  → /(onboarding)/step-1  (resumes last step via useOnboardingStore)
uid + onboard    → /(tabs)/today
```

### Navigation Stacks

| Stack | Animation | Tab bar |
|---|---|---|
| (auth) | fade | hidden |
| (onboarding) | slide_from_right | hidden |
| (tabs) | default | visible |
| Modals (check-in, low-energy, ritual/[id], journal/[id]) | sheet | hidden |

### Tab Order

```
Today  →  Rituals  →  Coach  →  Progress  →  Profile
  ☀         ✦          ◎          ↗            ○
```

Tab bar: `#0E1116` at 96% opacity, backdrop blur, 72px height, primary `#A78BFA` active color.

---

## 4. Firestore Data Model

### Collection Tree

```
users/{uid}
users/{uid}/profile/main
users/{uid}/preferences/main
users/{uid}/daily_checkins/{yyyy-mm-dd}
users/{uid}/rituals/{ritualId}
users/{uid}/ritual_logs/{logId}
users/{uid}/ai_sessions/{sessionId}
users/{uid}/weight_logs/{yyyy-mm-dd}
users/{uid}/journal_entries/{entryId}
users/{uid}/insights/{weekId}           ← "2026-W21"
```

### Key Document Shapes

**daily_checkins/{date}**
```
mood, stress, anxiety, cravings: 1–10
sleepHours: 0–12 (step 0.5)
energy: 1–10
bodyPain: boolean, bodyPainNote: string | null
weightKg: number | null  (morning only)
movementMinutes: number | null
foodControl: 1–10 | null
spiritualPractice: boolean
notes: string | null
aiSessionId: string | null
```

**rituals/{ritualId}**
```
title, type (mind/body/food/sleep/spiritual/creative/reflection)
durationMinutes, scheduledTime, days: DayCode[]
isActive, lowEnergyAlternative, reminderEnabled, order
```

**ritual_logs/{logId}**
```
ritualId, date, status (completed/skipped/partial)
skipReason, durationActualMinutes, note
```

**ai_sessions/{sessionId}**
```
mode: AIMode, inputContext: AIInputContext
response, safetyFlagged, safetyResponse
model, tokensUsed
```

### Required Composite Indexes

| Collection | Index |
|---|---|
| ritual_logs | ritualId ASC + date DESC |
| ai_sessions | mode ASC + createdAt DESC |
| journal_entries | type ASC + createdAt DESC |
| daily_checkins | date DESC |

### Security Rules (skeleton)

```js
match /users/{uid}/{document=**} {
  allow read, write: if request.auth.uid == uid;
}
```

---

## 5. Design System

### Dark Theme Tokens

| Token | Value | Usage |
|---|---|---|
| `bg` | `#0E1116` | Screen backgrounds |
| `surface` | `#171B22` | Inputs, form fields |
| `card` | `#202631` | Cards |
| `surface3` | `#26303D` | Skeleton, deeply nested |
| `primary` | `#A78BFA` | CTAs, active states, AI |
| `secondary` | `#38BDF8` | Body/movement metrics |
| `success` | `#34D399` | Completion states |
| `warning` | `#FBBF24` | Cravings, low energy |
| `error` | `#F87171` | Errors, anxiety metric |
| `textPrimary` | `#F8FAFC` | Headings, body |
| `textSecondary` | `#CBD5E1` | Body on cards |
| `muted` | `#64748B` | Labels, captions |
| `border` | `#2D3748` | Card/input borders |

### Typography

| Variant | Size | Weight | Use |
|---|---|---|---|
| h1 | 32px | Bold | Welcome headline |
| h2 | 24px | SemiBold | Screen titles |
| h3 | 20px | SemiBold | Section headers |
| body | 16px | Regular | Content |
| small | 14px | Regular | Labels, chips |
| caption | 12px | Regular | Meta, timestamps |

Font: **Inter** (Regular / Medium / SemiBold / Bold)

### Layout

- Screen padding: 20px
- Card radius: 22px
- Button radius: 16px
- Chip radius: 999px (pill)
- Input radius: 14px
- Card gap: 16px
- Section gap: 28px
- Bottom tab height: 72px
- Min touch target: 44px

---

## 6. Reusable Component Architecture

### Layer Rules

| Layer | Files | Rule |
|---|---|---|
| UI primitives | `src/components/ui/` | No Firestore, no stores, props only |
| Form components | `src/components/forms/` | No Firestore, controlled inputs via props |
| Feature components | `src/components/features/` | Accepts typed domain objects as props. No direct store reads inside. |
| Screens | `app/` | Reads from stores, passes data down as props |

### Component Prop Contracts

**RitualCard** receives: `ritual`, `log`, `lowEnergyMode`, `onComplete`, `onSkip`, `onPress`  
**AIMessageCard** receives: `session`, `loading`, `onExpand`  
**LowEnergyBanner** receives: `energyLevel`, `onActivate` — renders null if `energyLevel > 3`  
**MoodSlider** receives: `label`, `value`, `onChange`, `labelMin`, `labelMax`, `color`  
**ToggleChipGroup** receives: `options`, `selected`, `onToggle`, `maxSelections`

---

## 7. State Management Architecture

### Store Responsibilities

| Store | Persisted | Purpose |
|---|---|---|
| `useAuthStore` | No | Firebase auth listener, sign in/up/out |
| `useUserStore` | Yes | Profile, preferences, onboardingComplete flag |
| `useCheckInStore` | Partial (draft only) | Today's check-in + draft preservation |
| `useRitualStore` | No | Ritual list, today's logs, optimistic updates |
| `useAIStore` | No | Active AI session, Cloud Function calls |
| `useOnboardingStore` | Yes | Assessment answers + current step (resume support) |

### Optimistic Update Pattern (useRitualStore)

```
1. Build optimistic log with temp logId
2. Set in store immediately (UI updates instantly)
3. Write to Firestore in background
4. On success → replace temp logId with real logId
5. On failure → remove optimistic entry + show toast
```

### Data Flow — Today Screen

```
app/(tabs)/today.tsx
  → useAuthStore (uid)
  → useUserStore (profile.name, preferredTone)
  → useCheckInStore (todayCheckIn, energy level)
  → useRitualStore (top 3 rituals, todayLogs)
  → useAIStore (activeSession)
  ↓ passes as props to:
     <LowEnergyBanner energyLevel={energy} />
     <AIMessageCard session={session} loading={loading} />
     <RitualCard ritual={r} log={log} />
```

---

## 8. AI Architecture

### Safety Rule

The mobile app **never** calls OpenAI directly.

```
Mobile App  →  Firebase Cloud Function  →  OpenAI API  →  Firestore  →  App
```

OpenAI API key lives only in Cloud Functions environment variables.

### AI Modes

| Mode | Function | Trigger |
|---|---|---|
| `daily_guidance` | `dailyGuidance` | Post morning check-in (auto) |
| `craving_support` | `cravingSupport` | Coach tab user tap |
| `overthinking` | `overthinkingSupport` | Coach tab user tap |
| `low_energy` | `lowEnergySupport` | Low Energy Mode screen |
| `cant_sleep` | `overthinkingSupport` | Coach tab user tap |
| `guilt` | `overthinkingSupport` | Coach tab user tap |
| `motivation` | `dailyGuidance` | Coach tab user tap |

### Input Context (every AI call)

```typescript
{
  checkInDate: string | null,
  mood: number | null,         // 1–10
  stress: number | null,
  energy: number | null,
  cravings: number | null,
  recentPatterns: string[],    // populated in Phase 5 from insights
  userMessage: string | null,
}
```

### Safety Response

If the Cloud Function detects distress keywords, it returns `safetyFlagged: true` and a `safetyResponse` overriding the normal AI message:

> "This sounds heavy to carry alone. Ritual can support small grounding steps, but if you feel unsafe or unable to cope, please contact a trusted person or a mental health professional."

---

## 9. Onboarding Flow

```
/welcome
  ↓ "Begin your ritual"
/signup  (creates Firebase user + users/{uid} doc)
  ↓ auth success → root layout detects onboardingComplete: false
/step-1  struggles multi-select   (saves to useOnboardingStore, persisted)
/step-2  energy slider
/step-3  cravings slider
/step-4  sleep hours slider
/step-5  movement level single-select
/step-6  primary goal single-select
/step-7  spiritual practice single-select
/step-8  preferred tone single-select
  ↓ "Build my plan →"
/plan    (loading: builds UserProfile + preset ritual bundle → writes to Firestore)
  ↓ "Enter Ritual"
/(tabs)/today
```

**Resume support:** `useOnboardingStore` is persisted to AsyncStorage. If the user exits mid-assessment, they resume at the last completed step on next open.

**Plan generation (v1):** `src/utils/planBuilder.ts` maps `primaryGoal` → a preset bundle of 3 rituals with `lowEnergyAlternative` values. Phase 4+ replaces this with a GPT-4o Cloud Function call.

---

## 10. Implementation Order (18 Weeks)

| Week | Phase | Deliverables |
|---|---|---|
| 1 | Foundation | `tokens.ts`, `types/`, `services/firebase/`, app shell, tab nav |
| 2 | Design system | All `ui/` components, `forms/`, font loading |
| 3 | Auth | Welcome, login, signup screens + `useAuthStore` |
| 4 | Onboarding | Steps 1–8, plan screen, `useOnboardingStore`, `planBuilder.ts` |
| 5 | Today screen | Today screen wired: rituals + check-in CTA + greeting |
| 6 | Check-in | Check-in modal (morning + evening) + `useCheckInStore` |
| 7 | Ritual engine | Ritual list, complete/skip, `useRitualStore`, optimistic updates |
| 8 | Low Energy Mode | Low Energy banner + modal + alternative rituals |
| 9 | AI Companion | Cloud Functions scaffold + `callAI` + Coach tab + `useAIStore` |
| 10 | Journal | Journal screen + autosave + guided prompts |
| 11 | Progress | Weight log, ProgressGraph, WeeklyInsightCard |
| 12 | Push notifications | Expo Notifications + morning/evening reminders |
| 13 | Insights engine | Cloud Function: weekly pattern generation |
| 14 | RevenueCat + Paywall | Premium gate + subscription plans |
| 15 | Crash reporting | Sentry integration |
| 16 | Polish | Accessibility audit, haptics, transitions |
| 17 | Beta | TestFlight + Play beta |
| 18 | Launch | App Store + Play Store submission |

---

## 11. Environment Setup

### Required `.env` Variables

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Path Alias

All imports use `@/` resolving to `src/`:

```typescript
import { colors } from '@/constants/tokens'
import { useAuthStore } from '@/stores/useAuthStore'
```

Configured in both `tsconfig.json` (TypeScript) and `metro.config.js` (bundler).

---

## 12. Phase Readiness Checklist

### Phase 1 — Foundation (complete)
- [x] Expo + TypeScript scaffold
- [x] Firebase SDK installed
- [x] Zustand installed
- [x] Expo Router installed
- [x] Folder structure created
- [x] Design tokens (`tokens.ts`)
- [x] Copy constants (`copy.ts`)
- [x] App config (`app.json`, dark mode, scheme)
- [x] Path alias (`@/` → `src/`)

### Phase 2 — Type System (complete)
- [x] `types/user.ts`
- [x] `types/checkIn.ts`
- [x] `types/ritual.ts`
- [x] `types/aiSession.ts`
- [x] `types/journal.ts`

### Phase 3 — Navigation (complete)
- [x] Root `_layout.tsx` (auth guard + font loading)
- [x] `(auth)/_layout.tsx`
- [x] `(onboarding)/_layout.tsx`
- [x] `(tabs)/_layout.tsx`
- [x] All tab screens (today, rituals, coach, progress, profile)
- [x] All modal screens (check-in, low-energy, ritual/[id], journal/[id])

### Phase 4 — Services + Stores (complete)
- [x] `services/firebase/config.ts`
- [x] `services/firebase/auth.ts`
- [x] `services/firebase/firestore.ts`
- [x] `services/firebase/functions.ts`
- [x] `useAuthStore.ts`
- [x] `useUserStore.ts`
- [x] `useCheckInStore.ts`
- [x] `useRitualStore.ts`
- [x] `useAIStore.ts`
- [x] `useOnboardingStore.ts`

### Phase 5 — UI Components (complete)
- [x] `ui/Text.tsx`
- [x] `ui/Button.tsx`
- [x] `ui/Card.tsx`
- [x] `ui/Chip.tsx`
- [x] `ui/Skeleton.tsx`
- [x] `ui/Divider.tsx`
- [x] `forms/MoodSlider.tsx`
- [x] `forms/ToggleChipGroup.tsx`
- [x] `features/RitualCard.tsx`
- [x] `features/AIMessageCard.tsx`
- [x] `features/LowEnergyBanner.tsx`

### Remaining (next phases)
- [ ] `@react-native-community/slider` install + native setup
- [ ] Inter font files in `assets/fonts/`
- [ ] Firebase project creation + `.env` populated
- [ ] Cloud Functions scaffold + OpenAI integration
- [ ] ProgressGraph component (react-native-gifted-charts)
- [ ] WeeklyInsightCard
- [ ] BreathingTimer
- [ ] JournalPromptCard
- [ ] RevenueCat integration
- [ ] Push notification setup

---

*This document is auto-generated and reflects the state of the codebase as of the initial architecture build. Update it when adding new screens, stores, or services.*
