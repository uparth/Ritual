import { TextInput, TextInputProps, StyleSheet, View } from 'react-native'
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form'
import { colors, font, radius, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'

interface FormTextInputProps<T extends FieldValues>
  extends Omit<TextInputProps, 'onChange' | 'onChangeText' | 'value'> {
  control: Control<T>
  name: Path<T>
  label: string
  rules?: RegisterOptions<T, Path<T>>
}

export function FormTextInput<T extends FieldValues>({
  control,
  name,
  label,
  rules,
  style,
  ...textInputProps
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
        <View style={styles.field}>
          <RText variant="small" color="subtle">
            {label}
          </RText>
          <TextInput
            {...textInputProps}
            value={typeof value === 'string' ? value : ''}
            onBlur={onBlur}
            onChangeText={onChange}
            placeholderTextColor={colors.muted}
            style={[styles.input, error && styles.inputError, style]}
          />
          {error?.message ? (
            <RText variant="caption" color="error">
              {error.message}
            </RText>
          ) : null}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  field: {
    gap: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.input,
    borderWidth: 1,
    color: colors.textPrimary,
    fontFamily: font.family.regular,
    fontSize: font.size.body,
    minHeight: 50,
    padding: spacing.md,
  },
  inputError: {
    borderColor: colors.error,
  },
})
