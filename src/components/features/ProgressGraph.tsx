import { useMemo } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { LineChart, type lineDataItem } from 'react-native-gifted-charts'
import { Card } from '@/components/ui/Card'
import { RText } from '@/components/ui/Text'
import { colors, font, spacing } from '@/constants/tokens'
import type { ProgressPoint } from '@/stores/useProgressStore'

interface ProgressGraphProps {
  title: string
  subtitle: string
  points: ProgressPoint[]
  color: string
  maxValue?: number
  suffix?: string
}

export function ProgressGraph({ title, subtitle, points, color, maxValue, suffix }: ProgressGraphProps) {
  const { width } = useWindowDimensions()
  const chartWidth = Math.min(width - spacing.screen * 2 - spacing.md * 2, 360)
  const data = useMemo<lineDataItem[]>(
    () => points.map((point, index) => ({
      value: point.value,
      label: index === 0 || index === points.length - 1 ? point.label : '',
      dataPointText: suffix ? `${point.value}${suffix}` : `${point.value}`,
    })),
    [points, suffix],
  )

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <RText variant="h3">{title}</RText>
          <RText variant="small" color="muted">{subtitle}</RText>
        </View>
        {points.length > 0 ? (
          <RText variant="h3" style={{ color }}>
            {points[points.length - 1].value}{suffix ?? ''}
          </RText>
        ) : null}
      </View>

      {points.length >= 2 ? (
        <LineChart
          data={data}
          width={chartWidth}
          height={132}
          maxValue={maxValue}
          noOfSections={4}
          color={color}
          thickness={3}
          curved
          areaChart
          startFillColor={color}
          endFillColor={color}
          startOpacity={0.22}
          endOpacity={0.02}
          dataPointsColor={color}
          dataPointsRadius={4}
          yAxisLabelWidth={28}
          yAxisTextStyle={styles.axisText}
          xAxisLabelTextStyle={styles.axisText}
          xAxisColor={colors.border}
          yAxisColor={colors.border}
          rulesColor={colors.border}
          disableScroll
          hideRules={false}
        />
      ) : (
        <View style={styles.empty}>
          <RText variant="small" color="muted">Add at least two check-ins to see this trend.</RText>
        </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  titleWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  axisText: {
    color: colors.muted,
    fontSize: font.size.caption,
  },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 132,
    padding: spacing.md,
  },
})
