import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius, spacing, font } from '@/constants/tokens'
import { RText } from './Text'

type ChipVariant = 'default' | 'primary' | 'success' | 'warning'

interface ChipProps {
  label: string
  selected?: boolean
  onPress?: () => void
  variant?: ChipVariant
  disabled?: boolean
  style?: ViewStyle
}

export function Chip({
  label,
  selected = false,
  onPress,
  variant = 'default',
  disabled = false,
  style,
}: ChipProps) {
  const selectedStyle = selected ? selectedChipStyles[variant] : null

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
      style={[
        styles.base,
        selectedStyle,
        !selected && styles.unselected,
        disabled && styles.disabled,
        style,
      ]}
    >
      <RText
        style={[
          styles.label,
          selected && { color: chipTextColor[variant], fontFamily: font.family.medium },
        ]}
      >
        {label}
      </RText>
    </TouchableOpacity>
  )
}

const chipTextColor: Record<ChipVariant, string> = {
  default: colors.primary,
  primary: colors.primary,
  success: colors.success,
  warning: colors.warning,
}

const selectedChipStyles: Record<ChipVariant, ViewStyle> = {
  default: {
    borderColor: 'rgba(167,139,250,0.45)',
    backgroundColor: colors.primaryTint,
  },
  primary: {
    borderColor: 'rgba(167,139,250,0.45)',
    backgroundColor: colors.primaryTint,
  },
  success: {
    borderColor: 'rgba(52,211,153,0.45)',
    backgroundColor: colors.successTint,
  },
  warning: {
    borderColor: 'rgba(251,191,36,0.45)',
    backgroundColor: colors.warningTint,
  },
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    minHeight: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselected: {
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontSize: font.size.small,
    color: colors.textSecondary,
    fontFamily: font.family.regular,
  },
})
