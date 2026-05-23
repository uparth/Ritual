import { View, StyleSheet, ViewStyle } from 'react-native'
import { spacing } from '@/constants/tokens'
import { Chip } from '@/components/ui/Chip'

interface ToggleChipGroupProps {
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
  maxSelections?: number
  style?: ViewStyle
}

export function ToggleChipGroup({
  options,
  selected,
  onToggle,
  maxSelections,
  style,
}: ToggleChipGroupProps) {
  function handleToggle(value: string) {
    const isSelected = selected.includes(value)
    if (!isSelected && maxSelections && selected.length >= maxSelections) return
    onToggle(value)
  }

  return (
    <View style={[styles.container, style]}>
      {options.map((opt) => (
        <Chip
          key={opt.value}
          label={opt.label}
          selected={selected.includes(opt.value)}
          onPress={() => handleToggle(opt.value)}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
})
