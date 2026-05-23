import { Tabs } from 'expo-router'
import { View, StyleSheet } from 'react-native'
import { colors, spacing, font } from '@/constants/tokens'
import { RText } from '@/components/ui/Text'

type TabIconProps = { focused: boolean; icon: string; label: string }

function TabIcon({ focused, icon, label }: TabIconProps) {
  return (
    <View style={styles.tab}>
      <RText style={[styles.icon, focused && styles.iconActive]}>{icon}</RText>
      <RText style={[styles.label, focused && styles.labelActive]}>{label}</RText>
    </View>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="☀" label="Today" />,
        }}
      />
      <Tabs.Screen
        name="rituals"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="✦" label="Rituals" />,
        }}
      />
      <Tabs.Screen
        name="coach"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="◎" label="Coach" />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="↗" label="Progress" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="○" label="Profile" />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(14,17,22,0.96)',
    borderTopColor:  colors.border,
    borderTopWidth:  1,
    height:          spacing.bottomTabHeight,
    paddingBottom:   8,
    paddingTop:      8,
  },
  tab: {
    alignItems: 'center',
    gap: 3,
  },
  icon: {
    fontSize: 20,
    color: colors.muted,
  },
  iconActive: {
    color: colors.primary,
  },
  label: {
    fontSize: font.size.caption,
    color: colors.muted,
    fontFamily: 'Inter-Medium',
  },
  labelActive: {
    color: colors.primary,
  },
})
