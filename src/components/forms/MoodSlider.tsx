import { View, StyleSheet } from 'react-native'
import Slider from '@react-native-community/slider'
import { colors, spacing, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'

interface MoodSliderProps {
  label: string
  value: number
  onChange: (v: number) => void
  labelMin?: string
  labelMax?: string
  color?: string
  minimumValue?: number
  maximumValue?: number
  step?: number
}

export function MoodSlider({
  label,
  value,
  onChange,
  labelMin = 'Low',
  labelMax = 'High',
  color = colors.primary,
  minimumValue = 1,
  maximumValue = 10,
  step = 1,
}: MoodSliderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <RText variant="small" style={styles.label}>{label}</RText>
        <RText variant="small" color="primary" style={{ fontFamily: font.family.semibold }}>
          {value}
        </RText>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={color}
        maximumTrackTintColor={colors.surface3}
        thumbTintColor={color}
      />
      <View style={styles.labels}>
        <RText variant="caption" color="muted">{labelMin}</RText>
        <RText variant="caption" color="muted">{labelMax}</RText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontFamily: font.family.medium,
  },
  slider: {
    height: 36,
    marginHorizontal: -spacing.xs,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
})
