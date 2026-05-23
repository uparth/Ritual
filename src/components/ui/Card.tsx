import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, radius, spacing, shadow } from '@/constants/tokens'

interface CardProps {
  children: React.ReactNode
  padded?: boolean
  elevated?: boolean
  style?: ViewStyle
}

export function Card({ children, padded = true, elevated = false, style }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        elevated && shadow.card,
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  padded: {
    padding: spacing.md,
  },
})
