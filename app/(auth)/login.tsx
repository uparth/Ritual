import { useState } from 'react'
import { View, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { colors, spacing, radius, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'

export default function LoginScreen() {
  const { signIn, error, authLoading, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSignIn() {
    clearError()
    if (!email || !password) return
    await signIn(email, password)
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Button label="← Back" onPress={() => router.back()} variant="ghost" size="sm" style={{ alignSelf: 'flex-start' }} />
            <RText variant="h2" style={{ marginTop: spacing.lg }}>Welcome back</RText>
            <RText variant="body" color="muted">Sign in to continue your ritual.</RText>
          </View>

          <View style={styles.form}>
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
                placeholder="Your password"
                placeholderTextColor={colors.muted}
                secureTextEntry
              />
            </View>

            {error && <RText variant="small" color="error">{error}</RText>}

            <Button
              label={copy.auth.signIn}
              onPress={handleSignIn}
              loading={authLoading}
              disabled={!email || !password}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footer}>
            <RText variant="small" color="muted">{copy.auth.noAccount} </RText>
            <Button label={copy.auth.signUp} onPress={() => router.replace('/(auth)/signup')} variant="ghost" size="sm" />
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
