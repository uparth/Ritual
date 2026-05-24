import { Redirect } from 'expo-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useUserStore } from '@/stores/useUserStore'

function onboardingRoute(step: number) {
  switch (step) {
    case 2:
      return '/(onboarding)/step-2'
    case 3:
      return '/(onboarding)/step-3'
    case 4:
      return '/(onboarding)/step-4'
    case 5:
      return '/(onboarding)/step-5'
    case 6:
      return '/(onboarding)/step-6'
    case 7:
      return '/(onboarding)/step-7'
    case 8:
      return '/(onboarding)/step-8'
    default:
      return '/(onboarding)/step-1'
  }
}

export default function Index() {
  const { uid } = useAuthStore()
  const { currentStep } = useOnboardingStore()
  const { onboardingComplete } = useUserStore()

  if (!uid) return <Redirect href="/(auth)/welcome" />
  if (!onboardingComplete) return <Redirect href={onboardingRoute(currentStep)} />

  return <Redirect href="/(tabs)/today" />
}
