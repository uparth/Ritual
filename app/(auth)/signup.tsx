import { useState } from 'react'
import { View, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing, radius, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'

export default function SignupScreen() {
  const { signUp, error, authLoading, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignUp() {
    clearError()
    if (!name || !email || !password) return
    await signUp(email, password, name)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Button label="← Back" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-start' }} />
            <RText variant="h2" style={{ marginTop: spacing.lg }}>Create your account</RText>
            <RText variant="body" color="muted">Start your ritual journey.</RText>
          </View>

          <View style={styles.form}>
            <View style={styles.field}>
              <RText variant="small" color="subtle">{copy.auth.name}</RText>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Your first name"
                placeholderTextColor={colors.muted}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.field}>
              <RText variant="small" color="subtle">{copy.auth.email}</RText>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@email.com"
                placeholderTextColor={colors.muted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.field}>
              <RText variant="small" color="subtle">{copy.auth.password}</RText>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="8+ characters"
                placeholderTextColor={colors.muted}
                secureTextEntry
              />
            </View>

            {error && <RText variant="small" color="error">{error}</RText>}

            <Button
              label={copy.auth.signUp}
              onPress={handleSignUp}
              loading={authLoading}
              disabled={!name || !email || !password}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footer}>
            <RText variant="small" color="muted">{copy.auth.hasAccount} </RText>
            <Button label={copy.auth.signIn} onPress={() => router.replace('/(auth)/login')} variant="ghost" size="sm" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.screen, gap: spacing.xl, flexGrow: 1 },
  header: { gap: spacing.xs },
  form: { gap: spacing.md },
  field: { gap: spacing.xs },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: font.size.body,
    fontFamily: 'Inter-Regular',
    minHeight: 50,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
})
