import { TouchableOpacity, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius, font, touchTarget } from '@/constants/tokens'
import { RText } from './Text'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: Variant
  size?: Size
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

const sizeMap: Record<Size, { height: number; fontSize: number; paddingH: number }> = {
  sm: { height: 40, fontSize: font.size.small, paddingH: 16 },
  md: { height: 50, fontSize: font.size.body,  paddingH: 20 },
  lg: { height: 58, fontSize: font.size.h3,    paddingH: 24 },
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const { height, fontSize, paddingH } = sizeMap[size]
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        styles[variant],
        { height, minHeight: touchTarget, paddingHorizontal: paddingH },
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.primary : colors.textPrimary} size="small" />
      ) : (
        <RText
          style={{
            fontSize,
            fontFamily: 'Inter-SemiBold',
            color: variant === 'ghost' ? colors.primary : colors.textPrimary,
          }}
        >
          {label}
        </RText>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
})
