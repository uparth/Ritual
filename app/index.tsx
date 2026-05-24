import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useUserStore } from '@/stores/useUserStore'

function onboardingRoute(step: number) {
  switch (step) {
    case 2:
      return '/step-2'
    case 3:
      return '/step-3'
    case 4:
      return '/step-4'
    case 5:
      return '/step-5'
    case 6:
      return '/step-6'
    case 7:
      return '/step-7'
    case 8:
      return '/step-8'
    default:
      return '/step-1'
  }
}

export default function Index() {
  const { uid } = useAuthStore()
  const { currentStep } = useOnboardingStore()
  const { onboardingComplete } = useUserStore()

  if (!uid) return <Redirect href="/welcome" />
  if (!onboardingComplete) return <Redirect href={onboardingRoute(currentStep)} />

  return <Redirect href="/today" />
}
