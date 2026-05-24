import { View, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useForm } from 'react-hook-form'
import { colors, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { FormTextInput } from '@/components/forms'
import { copy } from '@/constants/copy'
import { useAuthStore } from '@/stores/useAuthStore'

type SignupFormData = {
  name: string
  email: string
  password: string
}

export default function SignupScreen() {
  const { signUp, error, authLoading, clearError } = useAuthStore()
  const {
    control,
    formState: { isValid },
    handleSubmit,
  } = useForm<SignupFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    mode: 'onChange',
  })

  async function handleSignUp(data: SignupFormData) {
    clearError()
    try {
      await signUp(data.email.trim(), data.password, data.name.trim())
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
            <RText variant="h2" style={{ marginTop: spacing.lg }}>Create your account</RText>
            <RText variant="body" color="muted">Start your ritual journey.</RText>
          </View>

          <View style={styles.form}>
            <FormTextInput
              control={control}
              name="name"
              label={copy.auth.name}
              placeholder="Your first name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="givenName"
              rules={{
                required: copy.errors.required,
                minLength: {
                  value: 2,
                  message: 'Use at least 2 characters.',
                },
              }}
            />
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
              placeholder="8+ characters"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              rules={{
                required: copy.errors.required,
                minLength: {
                  value: 8,
                  message: 'Use at least 8 characters.',
                },
              }}
            />

            {error && <RText variant="small" color="error">{error}</RText>}

            <Button
              label={copy.auth.signUp}
              onPress={handleSubmit(handleSignUp)}
              loading={authLoading}
              disabled={!isValid}
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
  },
})
