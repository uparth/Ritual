import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useForm } from 'react-hook-form'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { FormTextInput } from '@/components/forms'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'

type LoginFormData = {
  email: string
  password: string
}

export default function LoginScreen() {
  const { signIn, error, authLoading, clearError } = useAuthStore()
  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  async function handleSignIn(data: LoginFormData) {
    clearError()
    try {
      await signIn(data.email.trim(), data.password)
    } catch {
      // Store owns the user-facing error state.
    }
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
            <FormTextInput
              control={control}
              name="email"
              label={copy.auth.email}
              placeholder="you@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              rules={{
                required: copy.errors.required,
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: 'Enter a valid email address.',
                },
              }}
            />
            <FormTextInput
              control={control}
              name="password"
              label={copy.auth.password}
              placeholder="Your password"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              rules={{
                required: copy.errors.required,
              }}
            />

            {error && <RText variant="small" color="error">{error}</RText>}

            <Button
              label={copy.auth.signIn}
              onPress={handleSubmit(handleSignIn)}
              loading={authLoading}
              disabled={!isValid}
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
})
