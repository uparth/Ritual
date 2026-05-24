import { View, StyleSheet, SafeAreaView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { colors, spacing, font, radius } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { copy } from '@/constants/copy'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#10141D', '#0D1117', '#151123']}
        locations={[0, 0.55, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={styles.gradient}
      >
      <View style={styles.backgroundMarks} pointerEvents="none">
        <View style={styles.largeArc} />
        <View style={styles.midArc} />
        <View style={styles.diagonalPanel} />
        <View style={[styles.pathLine, styles.pathLineOne]} />
        <View style={[styles.pathLine, styles.pathLineTwo]} />
        <View style={[styles.pathLine, styles.pathLineThree]} />
        <View style={styles.miniStack}>
          <View style={[styles.miniBar, { width: 52 }]} />
          <View style={[styles.miniBar, { width: 82 }]} />
          <View style={[styles.miniBar, { width: 62 }]} />
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.hero}>
          <View style={styles.badge}>
            <RText variant="caption" color="primary" style={{ fontFamily: font.family.semibold }}>RITUAL</RText>
          </View>
          <RText variant="h1" style={styles.headline}>{copy.onboarding.welcome.headline}</RText>
          <RText variant="body" color="muted" style={styles.subline}>{copy.onboarding.welcome.subline}</RText>
        </View>

        <View style={styles.actions}>
          <Button
            label={copy.onboarding.welcome.cta}
            onPress={() => router.push('/signup')}
            fullWidth
            size="lg"
          />
          <Button
            label={copy.onboarding.welcome.login}
            onPress={() => router.push('/login')}
            variant="ghost"
            fullWidth
            size="md"
          />
        </View>
      </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  gradient: {
    flex: 1,
    overflow: 'hidden',
  },
  backgroundMarks: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  largeArc: {
    borderColor: 'rgba(167,139,250,0.13)',
    borderRadius: 190,
    borderWidth: 1,
    height: 380,
    position: 'absolute',
    right: -180,
    top: -88,
    transform: [{ rotate: '-18deg' }],
    width: 380,
  },
  midArc: {
    borderColor: 'rgba(56,189,248,0.10)',
    borderRadius: 130,
    borderWidth: 1,
    height: 260,
    position: 'absolute',
    right: -96,
    top: 96,
    width: 260,
  },
  diagonalPanel: {
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderColor: 'rgba(255,255,255,0.055)',
    borderRadius: radius.card,
    borderWidth: 1,
    height: 220,
    position: 'absolute',
    right: -92,
    top: 250,
    transform: [{ rotate: '-24deg' }],
    width: 320,
  },
  pathLine: {
    backgroundColor: 'rgba(167,139,250,0.14)',
    borderRadius: 999,
    height: 2,
    position: 'absolute',
    transform: [{ rotate: '-24deg' }],
  },
  pathLineOne: {
    right: 30,
    top: 290,
    width: 138,
  },
  pathLineTwo: {
    right: -10,
    top: 330,
    width: 186,
  },
  pathLineThree: {
    right: 52,
    top: 370,
    width: 92,
  },
  miniStack: {
    bottom: 150,
    gap: spacing.sm,
    opacity: 0.85,
    position: 'absolute',
    right: 28,
  },
  miniBar: {
    backgroundColor: 'rgba(56,189,248,0.12)',
    borderColor: 'rgba(56,189,248,0.14)',
    borderRadius: 999,
    borderWidth: 1,
    height: 8,
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
    backgroundColor: 'rgba(167,139,250,0.16)',
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.38)',
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
