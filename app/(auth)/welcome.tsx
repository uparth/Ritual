import { View, StyleSheet, SafeAreaView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { copy } from '@/constants/copy'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <RText variant="caption" color="primary" style={{ fontFamily: 'Inter-SemiBold' }}>RITUAL</RText>
          </View>
          <RText variant="h1" style={styles.headline}>{copy.onboarding.welcome.headline}</RText>
          <RText variant="body" color="muted" style={styles.subline}>{copy.onboarding.welcome.subline}</RText>
        </View>

        <View style={styles.actions}>
          <Button
            label={copy.onboarding.welcome.cta}
            onPress={() => router.push('/(auth)/signup')}
            fullWidth
            size="lg"
          />
          <Button
            label={copy.onboarding.welcome.login}
            onPress={() => router.push('/(auth)/login')}
            variant="ghost"
            fullWidth
            size="md"
          />
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    justifyContent: 'space-between',
    paddingBottom: spacing.xxl,
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryTint,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  headline: {
    letterSpacing: -1.5,
    lineHeight: 36,
  },
  subline: {
    lineHeight: 24,
    maxWidth: 320,
  },
  actions: {
    gap: spacing.sm,
  },
})
