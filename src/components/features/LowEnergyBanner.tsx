import { TouchableOpacity, StyleSheet } from 'react-native'
import { colors, radius, spacing } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'
import { copy } from '@/constants/copy'
import { config } from '@/constants/config'

interface LowEnergyBannerProps {
  energyLevel: number
  onActivate: () => void
}

export function LowEnergyBanner({ energyLevel, onActivate }: LowEnergyBannerProps) {
  if (energyLevel > config.checkin.lowEnergyThreshold) return null

  return (
    <TouchableOpacity onPress={onActivate} activeOpacity={0.8} style={styles.banner}>
      <RText variant="small" style={styles.text}>{copy.lowEnergy.banner}</RText>
      <RText variant="caption" style={styles.cta}>{copy.lowEnergy.cta} →</RText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.warningTint,
    borderRadius: radius.sm + 4,
    borderWidth: 1,
    borderColor: 'rgba(251,191,36,0.3)',
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    color: colors.warning,
    fontFamily: 'Inter-Medium',
    flex: 1,
  },
  cta: {
    color: colors.warning,
    fontFamily: 'Inter-SemiBold',
  },
})
