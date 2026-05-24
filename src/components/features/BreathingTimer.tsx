import { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Card } from '@/components/ui/Card'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { colors, spacing } from '@/constants/tokens'

type BreathPhase = 'inhale' | 'hold' | 'exhale'

interface BreathingTimerProps {
  rounds?: number
}

const phaseSeconds: Record<BreathPhase, number> = {
  inhale: 4,
  hold: 2,
  exhale: 6,
}

const phaseOrder: BreathPhase[] = ['inhale', 'hold', 'exhale']

export function BreathingTimer({ rounds = 4 }: BreathingTimerProps) {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(phaseSeconds.inhale)
  const [round, setRound] = useState(1)
  const phase = phaseOrder[phaseIndex]
  const progress = useMemo(() => {
    const total = phaseSeconds[phase]
    return Math.max(0.18, (total - secondsLeft + 1) / total)
  }, [phase, secondsLeft])

  useEffect(() => {
    if (!running) return

    const timer = setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft(secondsLeft - 1)
        return
      }

      const nextPhaseIndex = (phaseIndex + 1) % phaseOrder.length
      if (nextPhaseIndex === 0 && round >= rounds) {
        reset()
        return
      }

      if (nextPhaseIndex === 0) setRound(round + 1)
      setPhaseIndex(nextPhaseIndex)
      setSecondsLeft(phaseSeconds[phaseOrder[nextPhaseIndex]])
    }, 1000)

    return () => clearTimeout(timer)
  }, [phaseIndex, round, rounds, running, secondsLeft])

  function reset() {
    setRunning(false)
    setPhaseIndex(0)
    setSecondsLeft(phaseSeconds.inhale)
    setRound(1)
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <RText variant="h3">Breathing reset</RText>
          <RText variant="small" color="muted">Four quiet rounds to soften the nervous system.</RText>
        </View>
        <RText variant="caption" color="muted">{round}/{rounds}</RText>
      </View>

      <Pressable onPress={() => setRunning(value => !value)} style={styles.timerWrap}>
        <View style={[styles.circle, { transform: [{ scale: phase === 'exhale' ? 1 : 1 + progress * 0.28 }] }]}>
          <RText variant="h2" style={styles.phase}>{phase}</RText>
          <RText variant="h1">{secondsLeft}</RText>
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Button
          label={running ? 'Pause' : 'Start'}
          onPress={() => setRunning(value => !value)}
          size="sm"
          style={styles.actionButton}
        />
        <Button
          label="Reset"
          onPress={reset}
          variant="secondary"
          size="sm"
          style={styles.actionButton}
        />
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  timerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 190,
  },
  circle: {
    alignItems: 'center',
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
    borderRadius: 80,
    borderWidth: 1,
    height: 160,
    justifyContent: 'center',
    width: 160,
  },
  phase: {
    color: colors.primary,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
})
