import { Text, TextProps, StyleSheet } from 'react-native'
import { colors, font } from '@/constants/tokens'

type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'small' | 'caption'
type Color = 'primary' | 'secondary' | 'muted' | 'subtle' | 'error' | 'success' | 'warning' | 'default'

interface RTextProps extends TextProps {
  variant?: Variant
  color?: Color
}

const variantStyles: Record<Variant, object> = {
  h1:      { fontSize: font.size.h1,      fontFamily: 'Inter-Bold',     lineHeight: font.size.h1 * font.lineHeight.tight   },
  h2:      { fontSize: font.size.h2,      fontFamily: 'Inter-SemiBold', lineHeight: font.size.h2 * font.lineHeight.tight   },
  h3:      { fontSize: font.size.h3,      fontFamily: 'Inter-SemiBold', lineHeight: font.size.h3 * font.lineHeight.normal  },
  body:    { fontSize: font.size.body,    fontFamily: 'Inter-Regular',  lineHeight: font.size.body * font.lineHeight.relaxed },
  small:   { fontSize: font.size.small,   fontFamily: 'Inter-Regular',  lineHeight: font.size.small * font.lineHeight.normal },
  caption: { fontSize: font.size.caption, fontFamily: 'Inter-Regular',  lineHeight: font.size.caption * font.lineHeight.normal },
}

const colorMap: Record<Color, string> = {
  default:   colors.textPrimary,
  primary:   colors.primary,
  secondary: colors.secondary,
  muted:     colors.muted,
  subtle:    colors.subtle,
  error:     colors.error,
  success:   colors.success,
  warning:   colors.warning,
}

export function RText({ variant = 'body', color = 'default', style, ...props }: RTextProps) {
  return (
    <Text
      style={[
        styles.base,
        variantStyles[variant],
        { color: colorMap[color] },
        style,
      ]}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  base: {
    color: colors.textPrimary,
  },
})
