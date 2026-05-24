import { useState, useEffect, useRef } from 'react'
import { View, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { colors, spacing, font, radius } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { saveJournalEntry, updateJournalEntry } from '@/services/firebase/firestore'
import { useAuthStore } from '@/stores/useAuthStore'
import { todayDateString } from '@/utils/planBuilder'

export default function JournalScreen() {
  const { id, prompt } = useLocalSearchParams<{ id: string; prompt?: string }>()
  const { uid } = useAuthStore()
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [entryId, setEntryId] = useState<string | null>(id === 'new' ? null : id)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!uid || !body) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => autoSave(), 3000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [body])

  async function autoSave() {
    if (!uid) return
    setSaving(true)
    if (!entryId) {
      const newId = await saveJournalEntry(uid, {
        date: todayDateString(),
        type: 'free',
        prompt: prompt ?? null,
        body,
        mood: null,
        tags: [],
      })
      setEntryId(newId)
    } else {
      await updateJournalEntry(uid, entryId, body)
    }
    setSaving(false)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Button label="Done" onPress={() => { autoSave(); router.back() }} variant="ghost" size="sm" />
          <RText variant="caption" color="muted">{saving ? 'Saving…' : 'Auto-saved'}</RText>
        </View>
        {prompt && <RText variant="body" color="muted" style={styles.prompt}>{prompt}</RText>}
        <TextInput
          style={styles.editor}
          value={body}
          onChangeText={setBody}
          placeholder="Write freely. This is just for you."
          placeholderTextColor={colors.muted}
          multiline
          autoFocus
          textAlignVertical="top"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
  },
  prompt: {
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.sm,
    fontStyle: 'italic',
  },
  editor: {
    flex: 1,
    padding: spacing.screen,
    color: colors.textPrimary,
    fontSize: font.size.body,
    fontFamily: font.family.regular,
    lineHeight: font.size.body * 1.7,
  },
})
