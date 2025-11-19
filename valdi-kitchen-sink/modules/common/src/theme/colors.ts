/**
 * Color palette for Valdi Kitchen Sink demo app
 * Provides a consistent design system across all demos
 */

export const Colors = {
  // Primary colors
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',

  // Secondary colors
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  secondaryDark: '#7C3AED',

  // Semantic colors
  success: '#10B981',
  successLight: '#34D399',
  successDark: '#059669',

  warning: '#F59E0B',
  warningLight: '#FBBF24',
  warningDark: '#D97706',

  error: '#EF4444',
  errorLight: '#F87171',
  errorDark: '#DC2626',

  info: '#3B82F6',
  infoLight: '#60A5FA',
  infoDark: '#2563EB',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Background colors
  background: '#F9FAFB',
  backgroundDark: '#111827',
  surface: '#FFFFFF',
  surfaceDark: '#1F2937',

  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E5E7EB',
  borderDark: '#374151',
  borderLight: '#F3F4F6',

  // Transparent overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.25)',
  overlayDark: 'rgba(0, 0, 0, 0.75)',
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * Gradient definitions for use in backgrounds
 */
export const Gradients = {
  primary: `linear-gradient(135deg, ${Colors.primary} 0%, ${Colors.primaryDark} 100%)`,
  secondary: `linear-gradient(135deg, ${Colors.secondary} 0%, ${Colors.secondaryDark} 100%)`,
  success: `linear-gradient(135deg, ${Colors.success} 0%, ${Colors.successDark} 100%)`,
  sunset: `linear-gradient(135deg, #FF6B6B 0%, #FFE66D 50%, #4ECDC4 100%)`,
  ocean: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
  fire: `linear-gradient(135deg, #f12711 0%, #f5af19 100%)`,
  sky: `linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)`,
} as const;
