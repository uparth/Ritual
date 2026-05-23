import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors } from '@/constants/tokens'

interface DividerProps {
  style?: ViewStyle
}

export function Divider({ style }: DividerProps) {
  return <View style={[styles.base, style]} />
}

const styles = StyleSheet.create({
  base: {
    height: 1,
    backgroundColor: colors.border,
    width: '100%',
  },
})
