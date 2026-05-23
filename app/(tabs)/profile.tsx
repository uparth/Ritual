import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Divider } from '@/components/ui/Divider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'

export default function ProfileScreen() {
  const { email, signOut } = useAuthStore()
  const { profile, reset } = useUserStore()

  async function handleSignOut() {
    reset()
    await signOut()
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <RText variant="h2">Profile</RText>
          <RText variant="body" color="muted">{email}</RText>
        </View>

        <Card style={styles.section}>
          <RText variant="h3">Your goal</RText>
          <RText variant="body" color="muted">{profile?.primaryGoal?.replace(/_/g, ' ') ?? '—'}</RText>
          <Divider style={{ marginVertical: spacing.md }} />
          <RText variant="h3">Coaching tone</RText>
          <RText variant="body" color="muted">{profile?.preferredTone ?? '—'}</RText>
        </Card>

        <Button
          label="Sign out"
          onPress={handleSignOut}
          variant="ghost"
          fullWidth
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.screen, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { gap: spacing.xs, paddingTop: spacing.sm },
  section: { gap: spacing.xs },
})
