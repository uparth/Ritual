import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Card } from '@/components/ui/Card'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { colors, spacing } from '@/constants/tokens'

interface JournalPromptCardProps {
  energy?: number | null
  stress?: number | null
}

function pickPrompt(energy?: number | null, stress?: number | null): string {
  if (typeof energy === 'number' && energy <= 3) {
    return 'What is the smallest kind thing I can do for myself today?'
  }

  if (typeof stress === 'number' && stress >= 7) {
    return 'What is one pressure I can put down for the next hour?'
  }

  return 'What pattern am I noticing in my body, mood, or cravings today?'
}

export function JournalPromptCard({ energy, stress }: JournalPromptCardProps) {
  const prompt = pickPrompt(energy, stress)

  return (
    <Card style={styles.card}>
      <View style={styles.badge}>
        <RText variant="caption" style={styles.badgeText}>Prompt</RText>
      </View>
      <RText variant="h3">Journal check-in</RText>
      <RText variant="body" color="muted">{prompt}</RText>
      <Button
        label="Write"
        onPress={() => router.push(`/journal/new?prompt=${encodeURIComponent(prompt)}`)}
        variant="secondary"
        size="sm"
        style={styles.button}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondaryTint,
    borderColor: colors.secondary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.secondary,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
})
