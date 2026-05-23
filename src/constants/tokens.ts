import { Platform } from 'react-native'

export const colors = {
  // Backgrounds
  bg:       '#0E1116',
  surface:  '#171B22',
  card:     '#202631',
  surface3: '#26303D',

  // Brand
  primary:   '#A78BFA',
  secondary: '#38BDF8',
  success:   '#34D399',
  warning:   '#FBBF24',
  error:     '#F87171',

  // Text
  textPrimary:   '#F8FAFC',
  textSecondary: '#CBD5E1',
  muted:         '#64748B',
  subtle:        '#94A3B8',

  // Structural
  border:  '#2D3748',
  overlay: 'rgba(0,0,0,0.6)',

  // Tints
  primaryTint:   'rgba(167,139,250,0.12)',
  secondaryTint: 'rgba(56,189,248,0.12)',
  successTint:   'rgba(52,211,153,0.12)',
  warningTint:   'rgba(251,191,36,0.12)',
  errorTint:     'rgba(248,113,113,0.12)',
} as const

export const font = {
  family: {
    regular:  Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
    medium:   Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
    semibold: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
    bold:     Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
  },
  size: {
    h1:      32,
    h2:      24,
    h3:      20,
    body:    16,
    small:   14,
    caption: 12,
  },
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },
} as const

export const radius = {
  card:   22,
  button: 16,
  chip:   999,
  input:  14,
  icon:   12,
  sm:     8,
} as const

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  screen:         20,
  cardGap:        16,
  sectionGap:     28,
  bottomTabHeight:72,
} as const

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 20,
    elevation: 10,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
} as const

export const touchTarget = 44
